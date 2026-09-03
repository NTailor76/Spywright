import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  Crosshair,
  ExternalLink,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  AlertTriangle,
  ShieldAlert,
  Flame,
  Cpu,
  Compass,
  Lock,
  RotateCw,
  ArrowLeft,
  ArrowRight,
  Shield,
  Menu,
} from 'lucide-react';
import { DomElementNode, RecordedAction, SupportedLanguage, BrowserType } from '../types';
import { SAUCE_DEMO_PAGES } from '../data/sauceDemoPages';

interface LivePageViewerProps {
  html: string;
  url: string;
  spyActive: boolean;
  recordingActive: boolean;
  selectedElement: DomElementNode | null;
  elementMap?: Map<string, DomElementNode>;
  allElements?: DomElementNode[];
  onSelectElementById: (spyId: string) => void;
  onRecordAction: (action: Omit<RecordedAction, 'id' | 'timestamp'>) => void;
  onNavigate?: (newUrl: string, newHtml?: string) => void;
  highlightedElementIds: string[];
  viewportWidth: number;
  viewportHeight: number;
  colorScheme: 'light' | 'dark' | 'no-preference';
  language: SupportedLanguage;
  browserType?: BrowserType;
}

export const LivePageViewer: React.FC<LivePageViewerProps> = ({
  html,
  url,
  spyActive,
  recordingActive,
  selectedElement,
  elementMap,
  allElements,
  onSelectElementById,
  onRecordAction,
  onNavigate,
  highlightedElementIds,
  viewportWidth,
  viewportHeight,
  colorScheme,
  language,
  browserType = 'chromium',
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredInfo, setHoveredInfo] = useState<{
    tagName: string;
    role?: string;
    accessibleName?: string;
    rect: { top: number; left: number; width: number; height: number };
    topLocators: { code: string; label: string; category?: string }[];
  } | null>(null);

  const [scale, setScale] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [engineNotification, setEngineNotification] = useState<string | null>(null);

  // Client-side sanitizer: guarantees that third-party scripts, hydration error handlers,
  // or anti-framing frame busters cannot wipe the body or blank the screen.
  const sanitizedHtml = useMemo(() => {
    if (!html) return '';
    let clean = html;
    // Neutralize executable scripts so they cannot crash hydration or execute frame-busters
    clean = clean.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (match, attrs) => {
      if (/type=["']application\/(ld\+)?json["']/i.test(attrs)) {
        return match;
      }
      return `<script type="text/disabled" data-spy-neutralized="true"${attrs}>/* Neutralized for QA Object Spy */</script>`;
    });
    // Neutralize inline lifecycle triggers
    clean = clean.replace(/\s+on(load|unload|beforeunload|error)=["'][^"']*["']/gi, ' data-disabled-event="true"');
    // Strip meta refresh and CSP frame-ancestors
    clean = clean.replace(/<meta[^>]*http-equiv=["']?(refresh|Content-Security-Policy|X-Frame-Options)["']?[^>]*>/gi, '');
    return clean;
  }, [html]);

  // Show quick notification banner when browser engine switches
  useEffect(() => {
    const label =
      browserType === 'firefox'
        ? 'Firefox (Gecko Engine rv:128.0)'
        : browserType === 'webkit'
        ? 'WebKit (Safari Engine 17.5)'
        : 'Chromium (Blink Engine 128.0)';
    setEngineNotification(`Switched Active Browser to: ${label}`);
    const timer = setTimeout(() => setEngineNotification(null), 2500);
    return () => clearTimeout(timer);
  }, [browserType]);

  // Maintain fresh references to all callback and state props to prevent stale closures
  const latestPropsRef = useRef({
    spyActive,
    recordingActive,
    elementMap,
    allElements,
    language,
    url,
    onSelectElementById,
    onRecordAction,
    onNavigate,
  });

  useEffect(() => {
    latestPropsRef.current = {
      spyActive,
      recordingActive,
      elementMap,
      allElements,
      language,
      url,
      onSelectElementById,
      onRecordAction,
      onNavigate,
    };
  });

  // Tag iframe DOM elements with data-spy-id matching DomParser traversal
  const tagIframeDoc = (doc: Document) => {
    let counter = 0;
    const walk = (el: Element) => {
      const tagName = el.tagName.toLowerCase();
      if (['script', 'style', 'meta', 'link', 'noscript', 'title'].includes(tagName)) {
        return;
      }
      el.setAttribute('data-spy-id', `elem_${++counter}`);
      for (let i = 0; i < el.children.length; i++) {
        walk(el.children[i]);
      }
    };
    const root = doc.body || doc.documentElement;
    if (root) walk(root);
  };

  // Setup communication and event handlers inside the iframe
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    let cleanupIframeListeners: (() => void) | null = null;

    const setupIframeDocument = () => {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc || !iframeDoc.body) return;

        // Clean up previous listeners if any
        if (cleanupIframeListeners) {
          cleanupIframeListeners();
          cleanupIframeListeners = null;
        }

        // Tag all elements with spy IDs
        tagIframeDoc(iframeDoc);

        // Apply dark/light theme emulation
        if (colorScheme === 'dark') {
          iframeDoc.documentElement.style.filter = 'invert(0.9) hue-rotate(180deg)';
        } else {
          iframeDoc.documentElement.style.filter = 'none';
        }

        // Inject Spy and recording listener styles + Browser Engine typography emulation
        let style = iframeDoc.getElementById('spywright-inspector-styles') as HTMLStyleElement;
        if (!style) {
          style = iframeDoc.createElement('style');
          style.id = 'spywright-inspector-styles';
          iframeDoc.head.appendChild(style);
        }
        style.textContent = `
          .__pw_hover_highlight {
            outline: 2px dashed #10b981 !important;
            outline-offset: 1px !important;
            background-color: rgba(16, 185, 129, 0.12) !important;
            cursor: crosshair !important;
          }
          .__pw_selected_highlight {
            outline: 2px solid #3b82f6 !important;
            outline-offset: 2px !important;
            background-color: rgba(59, 130, 246, 0.18) !important;
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.25) !important;
          }
          .__pw_matched_highlight {
            outline: 2px solid #f59e0b !important;
            outline-offset: 1px !important;
            background-color: rgba(245, 158, 11, 0.2) !important;
          }
          /* Anti-blank screen guard: prevent anti-flicker or hydration hide styles from hiding content */
          html, body {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            min-height: 100vh !important;
          }
          .async-hide {
            opacity: 1 !important;
            visibility: visible !important;
          }
          #__next, #root, #chrome-app, main {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
          }
          /* Engine-specific font smoothing and scrollbars */
          ${
            browserType === 'firefox'
              ? `
                html, body {
                  -moz-osx-font-smoothing: grayscale !important;
                  text-rendering: optimizeLegibility !important;
                  scrollbar-width: thin !important;
                  scrollbar-color: #6366f1 #f1f5f9 !important;
                }
              `
              : browserType === 'webkit'
              ? `
                html, body {
                  -webkit-font-smoothing: subpixel-antialiased !important;
                  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
                }
              `
              : `
                html, body {
                  -webkit-font-smoothing: antialiased !important;
                }
              `
          }
        `;

        let currentHoveredEl: HTMLElement | null = null;

        const onMouseMove = (e: MouseEvent) => {
          const { spyActive, elementMap, allElements, language, onSelectElementById } = latestPropsRef.current;
          if (!spyActive) {
            setHoveredInfo(null);
            return;
          }

          const target = e.target as HTMLElement;
          if (!target || target === iframeDoc.body || target === iframeDoc.documentElement) {
            if (currentHoveredEl) {
              currentHoveredEl.classList.remove('__pw_hover_highlight');
              currentHoveredEl = null;
            }
            setHoveredInfo(null);
            return;
          }

          if (currentHoveredEl !== target) {
            if (currentHoveredEl) {
              currentHoveredEl.classList.remove('__pw_hover_highlight');
            }
            currentHoveredEl = target;
            currentHoveredEl.classList.add('__pw_hover_highlight');

            const rect = target.getBoundingClientRect();
            let spyId = target.getAttribute('data-spy-id') || target.dataset.spyId || '';
            const tagName = target.tagName.toLowerCase();
            const role = target.getAttribute('role') || '';
            const name = target.getAttribute('aria-label') || target.textContent?.trim().slice(0, 30) || '';
            
            // Fallback locator search if spyId is not directly on target
            if (!spyId && allElements && allElements.length > 0) {
              const targetId = target.id;
              const targetName = target.getAttribute('name');
              const targetTestId = target.dataset.testid || target.getAttribute('data-testid') || target.getAttribute('data-test') || target.getAttribute('data-cy');
              const targetType = target.getAttribute('type');
              const targetPlaceholder = target.getAttribute('placeholder');

              const found = allElements.find((el) => {
                if (targetId && el.domId === targetId) return true;
                if (targetTestId && el.testId === targetTestId) return true;
                if (targetName && el.name === targetName && el.tagName === tagName) return true;
                if (targetType && el.type === targetType && el.placeholder === targetPlaceholder) return true;
                return false;
              });
              if (found) {
                spyId = found.id;
                target.setAttribute('data-spy-id', spyId);
              }
            }

            // Trigger instant real-time inspector selection on hover
            if (spyId && onSelectElementById) {
              onSelectElementById(spyId);
            }

            // Retrieve the 2 best match locators from the parsed element model
            const matchedNode = elementMap?.get(spyId);
            let topLocators: { code: string; label: string; category?: string }[] = [];

            if (matchedNode && matchedNode.locators && matchedNode.locators.length > 0) {
              topLocators = matchedNode.locators.slice(0, 2).map((loc) => ({
                code: language === 'typescript' ? loc.codeTs : loc.codeJs,
                label: loc.categoryLabel || (loc.matchCategory === 'dev_automation' ? 'Dev Contract' : 'User UI'),
                category: loc.matchCategory,
              }));
            } else {
              // Dynamic fallback locators
              const testId = target.dataset.testid || target.getAttribute('data-testid') || target.getAttribute('data-test') || target.getAttribute('data-cy');
              const placeholder = target.getAttribute('placeholder');
              const label = target.getAttribute('aria-label');

              if (label) {
                topLocators.push({ code: `page.getByLabel('${label.replace(/'/g, "\\'")}')`, label: 'User UI Form Match' });
              } else if (placeholder) {
                topLocators.push({ code: `page.getByPlaceholder('${placeholder.replace(/'/g, "\\'")}')`, label: 'User UI Placeholder' });
              } else if (name && (tagName === 'button' || role === 'button')) {
                topLocators.push({ code: `page.getByRole('button', { name: '${name.replace(/'/g, "\\'")}' })`, label: 'User UI Role' });
              } else {
                topLocators.push({ code: `page.locator('${tagName}')`, label: 'CSS Locator' });
              }

              if (testId) {
                topLocators.push({ code: `page.getByTestId('${testId}')`, label: 'Dev Automation Contract' });
              }
            }

            setHoveredInfo({
              tagName,
              role,
              accessibleName: name,
              rect: {
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
              },
              topLocators,
            });
          }
        };

        const onMouseLeave = () => {
          if (currentHoveredEl) {
            currentHoveredEl.classList.remove('__pw_hover_highlight');
            currentHoveredEl = null;
          }
          setHoveredInfo(null);
        };

        // Form Submit Handler for SauceDemo and other forms
        const handleFormSubmit = (form: HTMLFormElement | null) => {
          const { url, onNavigate } = latestPropsRef.current;
          if (!onNavigate) return;

          // Check if SauceDemo Login
          const isSauceDemoLogin =
            url.includes('saucedemo') ||
            (form && (form.id === 'login_button_container' || form.getAttribute('data-test') === 'login-form'));

          if (isSauceDemoLogin) {
            const usernameInput = (iframeDoc.querySelector('#user-name') ||
              iframeDoc.querySelector('[data-test="username"]')) as HTMLInputElement;
            const passwordInput = (iframeDoc.querySelector('#password') ||
              iframeDoc.querySelector('[data-test="password"]')) as HTMLInputElement;
            const errorContainer = iframeDoc.querySelector('.error-message-container');

            const usernameVal = usernameInput?.value?.trim() || '';
            const passwordVal = passwordInput?.value?.trim() || '';

            if (!usernameVal) {
              if (errorContainer) {
                errorContainer.classList.add('error');
                errorContainer.innerHTML = `<h3 data-test="error">Epic sadface: Username is required</h3><button class="error-button" data-test="error-button">✕</button>`;
                tagIframeDoc(iframeDoc);
              }
              return;
            }

            if (!passwordVal) {
              if (errorContainer) {
                errorContainer.classList.add('error');
                errorContainer.innerHTML = `<h3 data-test="error">Epic sadface: Password is required</h3><button class="error-button" data-test="error-button">✕</button>`;
                tagIframeDoc(iframeDoc);
              }
              return;
            }

            if (usernameVal === 'locked_out_user') {
              if (errorContainer) {
                errorContainer.classList.add('error');
                errorContainer.innerHTML = `<h3 data-test="error">Epic sadface: Sorry, this user has been locked out.</h3><button class="error-button" data-test="error-button">✕</button>`;
                tagIframeDoc(iframeDoc);
              }
              return;
            }

            // Valid user login -> Transition to SauceDemo Inventory / Products Catalog
            onNavigate('https://www.saucedemo.com/inventory.html', SAUCE_DEMO_PAGES.inventory(0, []));
            return;
          }

          // Check if SauceDemo Checkout Step 1
          if (url.includes('checkout-step-one')) {
            onNavigate('https://www.saucedemo.com/checkout-step-two.html', SAUCE_DEMO_PAGES.checkoutStepTwo());
            return;
          }

          // General form action
          if (form && form.action && !form.action.startsWith('javascript:')) {
            onNavigate(form.action);
          }
        };

        // Click handler for element selection, action recording, and interactive navigation
        const onClick = (e: MouseEvent) => {
          const { spyActive, recordingActive, url, onSelectElementById, onRecordAction, onNavigate } = latestPropsRef.current;
          const target = e.target as HTMLElement;
          if (!target) return;

          const spyId = target.getAttribute('data-spy-id') || target.dataset.spyId;
          if (spyId && spyActive && onSelectElementById) {
            onSelectElementById(spyId);
          }

          const tagName = target.tagName.toLowerCase();
          const type = (target.getAttribute('type') || '').toLowerCase();
          const testId = target.dataset.testid || target.getAttribute('data-test') || target.getAttribute('data-cy');
          const id = target.id;
          const ariaLabel = target.getAttribute('aria-label') || '';
          const role = target.getAttribute('role') || '';
          const text = target.textContent?.trim().slice(0, 35) || '';
          const placeholder = target.getAttribute('placeholder') || '';

          // Record action if recording mode is active
          if (recordingActive && onRecordAction) {
            let locStr = `page.locator('${tagName}')`;
            let strategy: any = 'css';

            if (role || tagName === 'button' || tagName === 'a') {
              const compRole = role || (tagName === 'button' ? 'button' : 'link');
              const name = ariaLabel || text;
              if (name) {
                locStr = `page.getByRole('${compRole}', { name: '${name.replace(/'/g, "\\'")}' })`;
                strategy = 'getByRole';
              }
            } else if (testId) {
              locStr = `page.getByTestId('${testId.replace(/'/g, "\\'")}')`;
              strategy = 'getByTestId';
            } else if (ariaLabel) {
              locStr = `page.getByLabel('${ariaLabel.replace(/'/g, "\\'")}')`;
              strategy = 'getByLabel';
            } else if (placeholder) {
              locStr = `page.getByPlaceholder('${placeholder.replace(/'/g, "\\'")}')`;
              strategy = 'getByPlaceholder';
            } else if (text && text.length < 30) {
              locStr = `page.getByText('${text.replace(/'/g, "\\'")}')`;
              strategy = 'getByText';
            }

            if (type === 'checkbox' || type === 'radio') {
              const inputEl = target as HTMLInputElement;
              onRecordAction({
                actionType: inputEl.checked ? 'check' : 'uncheck',
                selectedLocator: locStr,
                locatorStrategy: strategy,
                comment: `${inputEl.checked ? 'Check' : 'Uncheck'} option`,
              });
            } else if (tagName !== 'input' && tagName !== 'select' && tagName !== 'textarea') {
              onRecordAction({
                actionType: 'click',
                selectedLocator: locStr,
                locatorStrategy: strategy,
                comment: `Click ${tagName}`,
              });
            }
          }

          // Interactive Handler: SauceDemo Login Button or Form Submit
          if (
            (tagName === 'input' || tagName === 'button') &&
            (id === 'login-button' || testId === 'login-button' || type === 'submit')
          ) {
            e.preventDefault();
            const form = target.closest('form');
            handleFormSubmit(form);
            return;
          }

          // Dismiss Error message in SauceDemo
          if (target.classList.contains('error-button') || testId === 'error-button') {
            e.preventDefault();
            const container = target.closest('.error-message-container');
            if (container) {
              container.classList.remove('error');
              container.innerHTML = '';
            }
            return;
          }

          // Interactive Handler: SauceDemo Add-to-Cart & Remove buttons
          if (
            target.classList.contains('btn_inventory') ||
            testId?.startsWith('add-to-cart') ||
            testId?.startsWith('remove')
          ) {
            e.preventDefault();
            const isCurrentlyRemove =
              target.classList.contains('btn_secondary') || testId?.startsWith('remove');
            const itemSlug = (testId || id || '')
              .replace(/^add-to-cart-/, '')
              .replace(/^remove-/, '');

            if (isCurrentlyRemove) {
              target.textContent = 'Add to cart';
              target.classList.remove('btn_secondary');
              target.classList.add('btn_primary');
              target.setAttribute('data-test', `add-to-cart-${itemSlug}`);
              target.id = `add-to-cart-${itemSlug}`;
            } else {
              target.textContent = 'Remove';
              target.classList.remove('btn_primary');
              target.classList.add('btn_secondary');
              target.setAttribute('data-test', `remove-${itemSlug}`);
              target.id = `remove-${itemSlug}`;
            }

            // Update shopping cart badge count in DOM
            const removeButtons = iframeDoc.querySelectorAll(
              '.btn_inventory.btn_secondary, [data-test^="remove-"]'
            );
            const count = removeButtons.length;
            let cartBadge = iframeDoc.querySelector('.shopping_cart_badge') as HTMLElement;
            const cartLink = iframeDoc.querySelector('.shopping_cart_link') as HTMLElement;

            if (count > 0) {
              if (!cartBadge && cartLink) {
                cartBadge = iframeDoc.createElement('span');
                cartBadge.className = 'shopping_cart_badge';
                cartBadge.setAttribute('data-test', 'shopping-cart-badge');
                cartLink.appendChild(cartBadge);
              }
              if (cartBadge) {
                cartBadge.textContent = String(count);
              }
            } else if (cartBadge) {
              cartBadge.remove();
            }

            tagIframeDoc(iframeDoc);
            return;
          }

          // Interactive Handler: Burger Menu toggle in SauceDemo
          if (id === 'react-burger-menu-btn' || testId === 'open-menu') {
            e.preventDefault();
            const menu = iframeDoc.getElementById('sidebar-menu');
            if (menu) menu.classList.add('open');
            return;
          }
          if (id === 'react-burger-cross-btn' || testId === 'close-menu') {
            e.preventDefault();
            const menu = iframeDoc.getElementById('sidebar-menu');
            if (menu) menu.classList.remove('open');
            return;
          }

          // Interactive Handler: SauceDemo Logout
          if (id === 'logout_sidebar_link' || testId === 'logout-sidebar-link') {
            e.preventDefault();
            if (onNavigate) onNavigate('https://www.saucedemo.com', SAUCE_DEMO_PAGES.login());
            return;
          }

          // Interactive Handler: SauceDemo Reset App State
          if (id === 'reset_sidebar_link' || testId === 'reset-sidebar-link') {
            e.preventDefault();
            if (onNavigate) onNavigate('https://www.saucedemo.com/inventory.html', SAUCE_DEMO_PAGES.inventory(0, []));
            return;
          }

          // Interactive Handler: SauceDemo Cart Navigation
          if (
            target.classList.contains('shopping_cart_link') ||
            target.closest('.shopping_cart_link') ||
            testId === 'shopping-cart-link'
          ) {
            e.preventDefault();
            if (onNavigate) onNavigate('https://www.saucedemo.com/cart.html', SAUCE_DEMO_PAGES.cart(1, ['sauce-labs-backpack']));
            return;
          }

          // Interactive Handler: SauceDemo Cart -> Continue Shopping
          if (id === 'continue-shopping' || testId === 'continue-shopping') {
            e.preventDefault();
            if (onNavigate) onNavigate('https://www.saucedemo.com/inventory.html', SAUCE_DEMO_PAGES.inventory(0, []));
            return;
          }

          // Interactive Handler: SauceDemo Cart -> Checkout Step 1
          if (id === 'checkout' || testId === 'checkout') {
            e.preventDefault();
            if (onNavigate) onNavigate('https://www.saucedemo.com/checkout-step-one.html', SAUCE_DEMO_PAGES.checkoutStepOne());
            return;
          }

          // Interactive Handler: SauceDemo Checkout Step 1 -> Step 2
          if (id === 'continue' || testId === 'continue') {
            e.preventDefault();
            if (onNavigate) onNavigate('https://www.saucedemo.com/checkout-step-two.html', SAUCE_DEMO_PAGES.checkoutStepTwo());
            return;
          }

          // Interactive Handler: SauceDemo Checkout Step 2 -> Finish
          if (id === 'finish' || testId === 'finish') {
            e.preventDefault();
            if (onNavigate) onNavigate('https://www.saucedemo.com/checkout-complete.html', SAUCE_DEMO_PAGES.checkoutComplete());
            return;
          }

          // Interactive Handler: SauceDemo Finish -> Back Home
          if (id === 'back-to-products' || testId === 'back-to-products') {
            e.preventDefault();
            if (onNavigate) onNavigate('https://www.saucedemo.com/inventory.html', SAUCE_DEMO_PAGES.inventory(0, []));
            return;
          }

          // Interactive Handler: SauceDemo Cancel button
          if (id === 'cancel' || testId === 'cancel') {
            e.preventDefault();
            if (onNavigate) onNavigate('https://www.saucedemo.com/cart.html', SAUCE_DEMO_PAGES.cart(1, ['sauce-labs-backpack']));
            return;
          }

          // General Link click handler
          const link = target.closest('a');
          if (link && link.getAttribute('href') && onNavigate) {
            const href = link.getAttribute('href') || '';
            if (href.startsWith('#') || href.startsWith('javascript:')) {
              // hash anchor
              return;
            }
            e.preventDefault();
            onNavigate(href);
          }
        };

        // Form Submit listener
        const onSubmit = (e: Event) => {
          e.preventDefault();
          const form = e.target as HTMLFormElement;
          handleFormSubmit(form);
        };

        // Input & Change listener for live interactive typing
        let debounceTimer: any = null;
        const onInput = (e: Event) => {
          const { recordingActive, onRecordAction } = latestPropsRef.current;
          if (!recordingActive || !onRecordAction) return;
          const target = e.target as HTMLInputElement | HTMLTextAreaElement;
          if (!target) return;

          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            const tagName = target.tagName.toLowerCase();
            const val = target.value;
            const ariaLabel = target.getAttribute('aria-label') || '';
            const placeholder = target.getAttribute('placeholder') || '';
            const testId = target.dataset.testid || target.getAttribute('data-test') || target.getAttribute('data-cy');

            let locStr = `page.locator('${tagName}')`;
            let strategy: any = 'css';

            if (testId) {
              locStr = `page.getByTestId('${testId.replace(/'/g, "\\'")}')`;
              strategy = 'getByTestId';
            } else if (ariaLabel) {
              locStr = `page.getByLabel('${ariaLabel.replace(/'/g, "\\'")}')`;
              strategy = 'getByLabel';
            } else if (placeholder) {
              locStr = `page.getByPlaceholder('${placeholder.replace(/'/g, "\\'")}')`;
              strategy = 'getByPlaceholder';
            } else {
              locStr = `page.getByRole('textbox')`;
              strategy = 'getByRole';
            }

            onRecordAction({
              actionType: 'fill',
              selectedLocator: locStr,
              locatorStrategy: strategy,
              value: val,
              comment: `Fill input with "${val}"`,
            });
          }, 350);
        };

        const onChange = (e: Event) => {
          const { recordingActive, onRecordAction } = latestPropsRef.current;
          if (!recordingActive || !onRecordAction) return;
          const target = e.target as HTMLElement;
          if (target.tagName.toLowerCase() === 'select') {
            const selectEl = target as HTMLSelectElement;
            const val = selectEl.value;
            const ariaLabel = selectEl.getAttribute('aria-label') || '';
            const testId = selectEl.dataset.testid || selectEl.getAttribute('data-test');

            let locStr = `page.locator('select')`;
            let strategy: any = 'css';

            if (testId) {
              locStr = `page.getByTestId('${testId}')`;
              strategy = 'getByTestId';
            } else if (ariaLabel) {
              locStr = `page.getByLabel('${ariaLabel}')`;
              strategy = 'getByLabel';
            } else {
              locStr = `page.getByRole('combobox')`;
              strategy = 'getByRole';
            }

            onRecordAction({
              actionType: 'selectOption',
              selectedLocator: locStr,
              locatorStrategy: strategy,
              value: val,
              comment: `Select dropdown option "${val}"`,
            });
          }
        };

        iframeDoc.addEventListener('mousemove', onMouseMove);
        iframeDoc.addEventListener('mouseleave', onMouseLeave);
        iframeDoc.addEventListener('click', onClick, true);
        iframeDoc.addEventListener('submit', onSubmit, true);
        iframeDoc.addEventListener('input', onInput);
        iframeDoc.addEventListener('change', onChange);

        cleanupIframeListeners = () => {
          iframeDoc.removeEventListener('mousemove', onMouseMove);
          iframeDoc.removeEventListener('mouseleave', onMouseLeave);
          iframeDoc.removeEventListener('click', onClick, true);
          iframeDoc.removeEventListener('submit', onSubmit, true);
          iframeDoc.removeEventListener('input', onInput);
          iframeDoc.removeEventListener('change', onChange);
        };
      } catch (e) {
        console.warn('Iframe inspection restriction:', e);
      }
    };

    iframe.addEventListener('load', setupIframeDocument);
    // If iframe document is already accessible, setup immediately
    if (iframe.contentDocument && iframe.contentDocument.body) {
      setupIframeDocument();
    }

    return () => {
      iframe.removeEventListener('load', setupIframeDocument);
      if (cleanupIframeListeners) {
        cleanupIframeListeners();
      }
    };
  }, [html, colorScheme]);

  // Update selected element highlight inside iframe
  useEffect(() => {
    try {
      const iframe = iframeRef.current;
      if (!iframe) return;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) return;

      // Remove existing selections
      const prevSelected = iframeDoc.querySelectorAll('.__pw_selected_highlight');
      prevSelected.forEach((el) => el.classList.remove('__pw_selected_highlight'));

      // Remove existing matched highlights
      const prevMatched = iframeDoc.querySelectorAll('.__pw_matched_highlight');
      prevMatched.forEach((el) => el.classList.remove('__pw_matched_highlight'));

      if (selectedElement) {
        const el = iframeDoc.querySelector(`[data-spy-id="${selectedElement.id}"]`);
        if (el) {
          el.classList.add('__pw_selected_highlight');
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }

      // Highlight matched candidates
      highlightedElementIds.forEach((id) => {
        const matchedEl = iframeDoc.querySelector(`[data-spy-id="${id}"]`);
        if (matchedEl) {
          matchedEl.classList.add('__pw_matched_highlight');
        }
      });
    } catch {
      // ignore
    }
  }, [selectedElement, highlightedElementIds]);

  return (
    <div
      ref={containerRef}
      className={`relative flex-1 flex flex-col bg-slate-100 overflow-hidden border-r border-slate-200 ${
        isFullscreen ? 'fixed inset-0 z-50' : ''
      }`}
    >
      {/* Top Viewer Control Bar */}
      <div className="h-10 bg-white border-b border-slate-200 px-3.5 flex items-center justify-between text-xs text-slate-700 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">Render Canvas</span>
          <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Live User Environment
          </span>

          {spyActive && (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
              <Crosshair className="w-3 h-3 text-indigo-600 animate-spin" />
              Hover element to spy
            </span>
          )}
          {recordingActive && (
            <span className="flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 animate-pulse">
              ● Recording Test Actions
            </span>
          )}
        </div>

        {/* Zoom & Fullscreen Controls */}
        <div className="flex items-center gap-1">
          {engineNotification && (
            <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded animate-fade-in mr-2">
              {engineNotification}
            </span>
          )}
          <button
            type="button"
            onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
            className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-900 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono text-slate-600 w-10 text-center font-semibold">
            {Math.round(scale * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setScale((s) => Math.min(1.5, s + 0.1))}
            className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-900 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setScale(1)}
            className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 rounded text-slate-700 ml-1 border border-slate-200"
          >
            100%
          </button>
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-900 ml-2 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen View'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Sandboxed Iframe Container with Browser Chrome Window adapting to user setup */}
      <div className="flex-1 overflow-auto p-3 flex flex-col bg-[#F3F4F6]">
        <div
          style={{
            transform: scale !== 1 ? `scale(${scale})` : undefined,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out',
          }}
          className="w-full flex-1 bg-white rounded-lg shadow-xl border border-slate-300 overflow-hidden relative flex flex-col min-h-[680px]"
        >
          {/* Realistic Browser Window Top Chrome Header */}
          <div
            className={`border-b select-none transition-colors ${
              browserType === 'firefox'
                ? 'bg-slate-900 text-slate-200 border-slate-800'
                : browserType === 'webkit'
                ? 'bg-slate-100 text-slate-700 border-slate-300'
                : 'bg-slate-100 text-slate-800 border-slate-200'
            }`}
          >
            {/* Tabs Row */}
            <div className="flex items-center px-3 pt-2 gap-2 text-xs font-sans">
              <div className="flex items-center gap-1.5 mr-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              </div>

              {/* Active Tab */}
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-t-md text-xs font-medium border-t border-l border-r shadow-xs ${
                  browserType === 'firefox'
                    ? 'bg-slate-800 text-white border-slate-700'
                    : browserType === 'webkit'
                    ? 'bg-white text-slate-800 border-slate-300 rounded-t-lg'
                    : 'bg-white text-slate-900 border-slate-200'
                }`}
              >
                {browserType === 'firefox' ? (
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                ) : browserType === 'webkit' ? (
                  <Compass className="w-3.5 h-3.5 text-sky-500" />
                ) : (
                  <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                )}
                <span className="font-semibold truncate max-w-[200px]">
                  {browserType === 'firefox'
                    ? 'Firefox'
                    : browserType === 'webkit'
                    ? 'Safari'
                    : 'Chromium'}{' '}
                  - {url ? new URL(url.startsWith('http') ? url : `https://${url}`).hostname : 'App'}
                </span>
                <span className="text-[10px] text-slate-400 ml-1">×</span>
              </div>

              {/* Engine Badge on right */}
              <div className="ml-auto flex items-center gap-1.5 text-[10px] font-mono">
                <span
                  className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                    browserType === 'firefox'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : browserType === 'webkit'
                      ? 'bg-sky-100 text-sky-800 border border-sky-300'
                      : 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                  }`}
                >
                  {browserType === 'firefox'
                    ? 'Gecko Engine (rv:128)'
                    : browserType === 'webkit'
                    ? 'WebKit Engine (17.5)'
                    : 'Blink Engine (v128)'}
                </span>
              </div>
            </div>

            {/* Address / Navigation Toolbar */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 border-t ${
                browserType === 'firefox'
                  ? 'bg-slate-800/90 border-slate-700'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center gap-1 text-slate-400">
                <button type="button" className="p-1 hover:text-slate-600 rounded">
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
                <button type="button" className="p-1 hover:text-slate-600 rounded">
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button type="button" className="p-1 hover:text-slate-600 rounded">
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* URL Address Capsule */}
              <div
                className={`flex-1 flex items-center gap-2 px-3 py-1 rounded-md text-xs font-mono border ${
                  browserType === 'firefox'
                    ? 'bg-slate-900 border-slate-700 text-slate-200'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                {browserType === 'firefox' ? (
                  <Shield className="w-3 h-3 text-purple-400" />
                ) : (
                  <Lock className="w-3 h-3 text-emerald-600" />
                )}
                <span className="text-emerald-600 font-semibold text-[11px]">https://</span>
                <span className="truncate flex-1 text-[11px]">
                  {url.replace(/^https?:\/\//i, '')}
                </span>
                <span className="text-[10px] text-slate-400 font-sans font-medium">
                  {browserType}
                </span>
              </div>

              <div className="flex items-center text-slate-400">
                <Menu className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          <iframe
            id="spied-page-iframe"
            ref={iframeRef}
            srcDoc={sanitizedHtml}
            title="Inspected Web Page Canvas"
            sandbox="allow-same-origin allow-forms allow-popups"
            className="w-full flex-1 min-h-[640px] border-none block"
          />

          {/* Hover Element Overlay Badge with Top 2 Best Match Locators */}
          {spyActive && hoveredInfo && (
            <div
              style={{
                top: `${Math.max(8, hoveredInfo.rect.top - (hoveredInfo.topLocators.length > 1 ? 58 : 36))}px`,
                left: `${Math.max(8, hoveredInfo.rect.left)}px`,
              }}
              className="absolute z-50 pointer-events-none bg-slate-950/95 text-white border-2 border-indigo-500 rounded-lg shadow-2xl p-2 text-[11px] font-mono flex flex-col gap-1 backdrop-blur-md animate-in fade-in zoom-in-95 duration-75 max-w-md ring-2 ring-indigo-500/20"
            >
              <div className="flex items-center gap-2 border-b border-slate-800 pb-1">
                <span className="font-bold text-indigo-400">&lt;{hoveredInfo.tagName}&gt;</span>
                {hoveredInfo.accessibleName && (
                  <span className="text-slate-300 text-[10px] truncate max-w-[150px] font-sans font-medium">
                    "{hoveredInfo.accessibleName}"
                  </span>
                )}
                {hoveredInfo.role && (
                  <span className="text-[9px] bg-slate-800 text-indigo-300 px-1 py-0.2 rounded font-sans border border-slate-700">
                    {hoveredInfo.role}
                  </span>
                )}
                <span className="ml-auto text-[9px] bg-indigo-900/80 text-amber-300 px-1.5 py-0.2 rounded font-sans font-bold">
                  2 Best Matches
                </span>
              </div>

              <div className="flex flex-col gap-1">
                {hoveredInfo.topLocators.map((loc, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-[10px]">
                    <span className={`px-1 rounded text-[8px] font-bold ${
                      idx === 0 ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-amber-300'
                    }`}>
                      #{idx + 1}
                    </span>
                    <span className="text-indigo-300 truncate max-w-[280px]">
                      {loc.code}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
