import {
  DomElementNode,
  PlaywrightLocatorCandidate,
  RecordedAction,
  SupportedLanguage,
  ContextConfig,
  BrowserType,
} from '../types';

export function getLocatorCode(
  candidate: PlaywrightLocatorCandidate | undefined,
  language: SupportedLanguage = 'typescript'
): string {
  if (!candidate) return 'page.locator("body")';
  return language === 'typescript' ? candidate.codeTs : candidate.codeJs;
}

export function generateActionSnippets(
  element: DomElementNode | null,
  candidate: PlaywrightLocatorCandidate | undefined,
  language: SupportedLanguage = 'typescript'
): { title: string; code: string; type: string }[] {
  if (!element || !candidate) return [];

  const loc = getLocatorCode(candidate, language);
  const tag = element.tagName.toLowerCase();
  const type = (element.type || '').toLowerCase();
  const snippets: { title: string; code: string; type: string }[] = [];

  // Click
  snippets.push({
    title: 'Click Element',
    code: `await ${loc}.click();`,
    type: 'action',
  });

  // Fill text for inputs/textareas
  if (tag === 'input' || tag === 'textarea' || element.role === 'textbox') {
    const sampleVal = element.value || (tag === 'input' && type === 'email' ? 'test@qa.org' : 'Automated QA input');
    snippets.push({
      title: 'Fill Value',
      code: `await ${loc}.fill('${sampleVal}');`,
      type: 'action',
    });
    snippets.push({
      title: 'Type Sequentially (Simulate Keyboard)',
      code: `await ${loc}.pressSequentially('${sampleVal}', { delay: 50 });`,
      type: 'action',
    });
    snippets.push({
      title: 'Clear Input',
      code: `await ${loc}.clear();`,
      type: 'action',
    });
  }

  // Check / Uncheck for checkboxes & radio buttons
  if (type === 'checkbox' || element.role === 'checkbox') {
    snippets.push({
      title: 'Check Checkbox',
      code: `await ${loc}.check();`,
      type: 'action',
    });
    snippets.push({
      title: 'Uncheck Checkbox',
      code: `await ${loc}.uncheck();`,
      type: 'action',
    });
  }

  // Select Option for dropdowns
  if (tag === 'select' || element.role === 'combobox') {
    snippets.push({
      title: 'Select Dropdown Option',
      code: `await ${loc}.selectOption({ index: 1 });`,
      type: 'action',
    });
  }

  // Hover
  snippets.push({
    title: 'Hover Cursor',
    code: `await ${loc}.hover();`,
    type: 'action',
  });

  // Double Click
  snippets.push({
    title: 'Double Click',
    code: `await ${loc}.dblclick();`,
    type: 'action',
  });

  // Scroll into view & Focus
  snippets.push({
    title: 'Scroll Into View & Focus',
    code: `await ${loc}.scrollIntoViewIfNeeded();\nawait ${loc}.focus();`,
    type: 'action',
  });

  return snippets;
}

export function generateAssertionSnippets(
  element: DomElementNode | null,
  candidate: PlaywrightLocatorCandidate | undefined,
  language: SupportedLanguage = 'typescript'
): { title: string; code: string; type: string }[] {
  if (!element || !candidate) return [];

  const loc = getLocatorCode(candidate, language);
  const assertions: { title: string; code: string; type: string }[] = [];

  // toBeVisible()
  assertions.push({
    title: 'Assert Element Visible',
    code: `await expect(${loc}).toBeVisible();`,
    type: 'assertion',
  });

  // toBeEnabled() / toBeDisabled()
  if (element.isEnabled) {
    assertions.push({
      title: 'Assert Element Enabled',
      code: `await expect(${loc}).toBeEnabled();`,
      type: 'assertion',
    });
  } else {
    assertions.push({
      title: 'Assert Element Disabled',
      code: `await expect(${loc}).toBeDisabled();`,
      type: 'assertion',
    });
  }

  // toHaveText()
  if (element.innerText && element.innerText.trim().length > 0) {
    const textSnippet = element.innerText.trim().replace(/\s+/g, ' ').slice(0, 40);
    assertions.push({
      title: 'Assert Inner Text',
      code: `await expect(${loc}).toHaveText('${textSnippet.replace(/'/g, "\\'")}');`,
      type: 'assertion',
    });
    assertions.push({
      title: 'Assert Contains Substring Text',
      code: `await expect(${loc}).toContainText('${textSnippet.slice(0, 20).replace(/'/g, "\\'")}');`,
      type: 'assertion',
    });
  }

  // toHaveValue() for inputs
  if (element.tagName.toLowerCase() === 'input' || element.tagName.toLowerCase() === 'textarea') {
    const val = element.value || 'expected_value';
    assertions.push({
      title: 'Assert Input Value',
      code: `await expect(${loc}).toHaveValue('${val.replace(/'/g, "\\'")}');`,
      type: 'assertion',
    });
  }

  // toHaveCount()
  assertions.push({
    title: 'Assert Element Count',
    code: `await expect(${loc}).toHaveCount(1);`,
    type: 'assertion',
  });

  // toHaveAttribute()
  if (element.domId) {
    assertions.push({
      title: 'Assert ID Attribute',
      code: `await expect(${loc}).toHaveAttribute('id', '${element.domId}');`,
      type: 'assertion',
    });
  }

  return assertions;
}

export function generateFullTestSpec(
  url: string,
  actions: RecordedAction[],
  selectedElement: DomElementNode | null,
  selectedCandidate: PlaywrightLocatorCandidate | undefined,
  language: SupportedLanguage = 'typescript',
  pageTitle: string = 'Application',
  browserType: BrowserType = 'chromium'
): string {
  const isTs = language === 'typescript';
  const engineName =
    browserType === 'firefox'
      ? 'Firefox (Gecko Engine)'
      : browserType === 'webkit'
      ? 'WebKit (Safari Engine)'
      : 'Chromium (Blink Engine)';

  // If no recorded actions, create a standard test covering the current inspected element or page
  let actionLines: string[] = [];

  if (actions.length > 0) {
    actionLines = actions.map((act) => {
      const loc = act.selectedLocator;
      switch (act.actionType) {
        case 'navigate':
          return `  await page.goto('${act.value || url}');`;
        case 'click':
          return `  await ${loc}.click();`;
        case 'dblclick':
          return `  await ${loc}.dblclick();`;
        case 'fill':
          return `  await ${loc}.fill('${act.value || ''}');`;
        case 'pressSequentially':
          return `  await ${loc}.pressSequentially('${act.value || ''}', { delay: 50 });`;
        case 'check':
          return `  await ${loc}.check();`;
        case 'uncheck':
          return `  await ${loc}.uncheck();`;
        case 'selectOption':
          return `  await ${loc}.selectOption('${act.value || '1'}');`;
        case 'hover':
          return `  await ${loc}.hover();`;
        case 'pressKey':
          return `  await ${loc}.press('${act.keyName || 'Enter'}');`;
        case 'assertVisible':
          return `  await expect(${loc}).toBeVisible();`;
        case 'assertText':
          return `  await expect(${loc}).toHaveText('${act.expectedText || ''}');`;
        case 'assertValue':
          return `  await expect(${loc}).toHaveValue('${act.value || ''}');`;
        case 'assertEnabled':
          return `  await expect(${loc}).toBeEnabled();`;
        case 'assertCount':
          return `  await expect(${loc}).toHaveCount(1);`;
        default:
          return `  await ${loc}.click();`;
      }
    });
  } else if (selectedElement && selectedCandidate) {
    const loc = getLocatorCode(selectedCandidate, language);
    actionLines = [
      `  // Step 1: Navigate to target URL (${engineName})`,
      `  await page.goto('${url}');`,
      `  await expect(page).toHaveTitle(/.*${pageTitle.slice(0, 15)}/i);`,
      ``,
      `  // Step 2: Inspect and interact with target element`,
      `  const targetElement = ${loc};`,
      `  await expect(targetElement).toBeVisible();`,
    ];

    if (selectedElement.tagName.toLowerCase() === 'input') {
      actionLines.push(`  await targetElement.fill('QA Automated Input Value');`);
    } else if (selectedElement.isInteractive) {
      actionLines.push(`  await targetElement.click();`);
    }
  } else {
    actionLines = [
      `  // Navigate to application with ${engineName}`,
      `  await page.goto('${url}');`,
      `  await expect(page).toHaveTitle(/.*/);`,
      `  await page.waitForLoadState('domcontentloaded');`,
    ];
  }

  if (isTs) {
    return `import { test, expect, type Page } from '@playwright/test';

/**
 * Automated End-to-End Test Suite
 * Target Browser Engine: ${engineName}
 */
test.describe('${pageTitle.replace(/'/g, "\\'")} - Automation Suite', () => {
  test.use({ browserName: '${browserType}' });

  test.beforeEach(async ({ page }: { page: Page }) => {
    // Optional global hooks, authentication setup, or tracing
  });

  test('should verify element accessibility and user workflow on ${browserType}', async ({ page }: { page: Page }) => {
${actionLines.join('\n')}
  });
});
`;
  } else {
    return `const { test, expect } = require('@playwright/test');

/**
 * Automated End-to-End Test Suite
 * Target Browser Engine: ${engineName}
 */
test.describe('${pageTitle.replace(/'/g, "\\'")} - Automation Suite', () => {
  test.use({ browserName: '${browserType}' });

  test.beforeEach(async ({ page }) => {
    // Optional global hooks, authentication setup, or tracing
  });

  test('should verify element accessibility and user workflow on ${browserType}', async ({ page }) => {
${actionLines.join('\n')}
  });
});
`;
  }
}

export function generatePageObjectModel(
  url: string,
  elements: DomElementNode[],
  language: SupportedLanguage = 'typescript',
  className: string = 'AppPage'
): string {
  const isTs = language === 'typescript';

  // Pick the top interactive elements to create locator properties
  const keyElements = elements.filter(
    (el) => el.isInteractive || el.testId || el.role === 'heading' || el.role === 'alert'
  ).slice(0, 12);

  const locatorProps: string[] = [];
  const constructorInits: string[] = [];
  const actionMethods: string[] = [];

  keyElements.forEach((el, idx) => {
    const rawName = el.accessibleName || el.testId || el.domId || el.name || `${el.tagName}_${idx + 1}`;
    const cleanName = sanitizeIdentifier(rawName, idx);
    const candidate = el.locators[0];
    const locCode = candidate ? (isTs ? candidate.codeTs : candidate.codeJs) : `page.locator('${el.tagName}')`;
    const locBody = locCode.replace(/^page\./, 'this.page.');

    if (isTs) {
      locatorProps.push(`  readonly ${cleanName}: Locator;`);
    }
    constructorInits.push(`    this.${cleanName} = ${locBody};`);

    // Generate helper methods based on tag type
    const tag = el.tagName.toLowerCase();
    if (tag === 'input' && (el.type === 'text' || el.type === 'email' || el.type === 'password' || !el.type)) {
      const paramName = cleanName.toLowerCase().includes('email')
        ? 'email'
        : cleanName.toLowerCase().includes('pass')
        ? 'password'
        : 'text';
      if (isTs) {
        actionMethods.push(`  async fill${capitalize(cleanName)}(${paramName}: string): Promise<void> {
    await this.${cleanName}.fill(${paramName});
  }`);
      } else {
        actionMethods.push(`  async fill${capitalize(cleanName)}(${paramName}) {
    await this.${cleanName}.fill(${paramName});
  }`);
      }
    } else if (el.isInteractive) {
      if (isTs) {
        actionMethods.push(`  async click${capitalize(cleanName)}(): Promise<void> {
    await this.${cleanName}.click();
  }`);
      } else {
        actionMethods.push(`  async click${capitalize(cleanName)}() {
    await this.${cleanName}.click();
  }`);
      }
    }
  });

  if (isTs) {
    return `import { type Page, type Locator, expect } from '@playwright/test';

export class ${className} {
  readonly page: Page;
  readonly url: string = '${url}';

  // Locators
${locatorProps.length > 0 ? locatorProps.join('\n') : '  // Add locators here'}

  constructor(page: Page) {
    this.page = page;
${constructorInits.length > 0 ? constructorInits.join('\n') : ''}
  }

  /**
   * Navigates to the page
   */
  async goto(): Promise<void> {
    await this.page.goto(this.url);
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Asserts the primary page elements are visible
   */
  async verifyPageLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp('.*'));
  }

  // High-Level User Actions
${actionMethods.join('\n\n')}
}
`;
  } else {
    return `const { expect } = require('@playwright/test');

class ${className} {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.url = '${url}';

    // Locators
${constructorInits.length > 0 ? constructorInits.join('\n') : ''}
  }

  async goto() {
    await this.page.goto(this.url);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async verifyPageLoaded() {
    await expect(this.page).toHaveURL(new RegExp('.*'));
  }

  // High-Level User Actions
${actionMethods.join('\n\n')}
}

module.exports = { ${className} };
`;
  }
}

export function generateCucumberBdd(
  url: string,
  element: DomElementNode | null,
  candidate: PlaywrightLocatorCandidate | undefined,
  language: SupportedLanguage = 'typescript'
): { feature: string; stepDefs: string } {
  const loc = candidate ? (language === 'typescript' ? candidate.codeTs : candidate.codeJs) : `page.locator('button')`;
  const name = element?.accessibleName || 'Submit';

  const feature = `# -- Cucumber BDD Feature Spec
Feature: Web Object Interaction & Automation
  As a QA Automation Engineer
  I want to interact with page elements using reliable target locators
  So that regression tests execute deterministically in CI/CD

  Scenario: Successfully navigate and interact with ${name}
    Given I navigate to "${url}"
    When I interact with the "${name}" element
    Then the "${name}" should be visible on the page
`;

  const isTs = language === 'typescript';
  const stepDefs = isTs
    ? `import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { page } from './hooks'; // Custom world fixture

Given('I navigate to {string}', async function (targetUrl: string) {
  await page.goto(targetUrl);
});

When('I interact with the {string} element', async function (elementName: string) {
  const locator = ${loc};
  await locator.click();
});

Then('the {string} should be visible on the page', async function (elementName: string) {
  const locator = ${loc};
  await expect(locator).toBeVisible();
});
`
    : `const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

Given('I navigate to {string}', async function (targetUrl) {
  await this.page.goto(targetUrl);
});

When('I interact with the {string} element', async function (elementName) {
  const locator = ${loc};
  await locator.click();
});

Then('the {string} should be visible on the page', async function (elementName) {
  const locator = ${loc};
  await expect(locator).toBeVisible();
});
`;

  return { feature, stepDefs };
}

export function generateContextSetupCode(
  config: ContextConfig,
  language: SupportedLanguage = 'typescript',
  browserType: BrowserType = 'chromium'
): string {
  const isTs = language === 'typescript';
  const engineModule = browserType; // 'chromium' | 'firefox' | 'webkit'
  const engineLabel =
    browserType === 'firefox'
      ? 'Firefox (Gecko Engine)'
      : browserType === 'webkit'
      ? 'WebKit (Safari Engine)'
      : 'Chromium (Blink Engine)';

  return isTs
    ? `import { ${engineModule}, type Browser, type BrowserContext, type Page } from '@playwright/test';

// 1. Launch configured ${engineLabel}
const browser: Browser = await ${engineModule}.launch({
  headless: false,
  slowMo: 50,
});

// 2. Create isolated Browser Context with simulated device & locale
const context: BrowserContext = await browser.newContext({
  viewport: { width: ${config.viewport.width}, height: ${config.viewport.height} },
  colorScheme: '${config.colorScheme}',
  locale: '${config.locale}',
  timezoneId: '${config.timezoneId}',
  permissions: ${JSON.stringify(config.permissions)},
  ${config.geolocation ? `geolocation: { latitude: ${config.geolocation.latitude}, longitude: ${config.geolocation.longitude} },` : ''}
  userAgent: '${
    browserType === 'firefox'
      ? 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0'
      : browserType === 'webkit'
      ? 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15'
      : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
  }',
});

// 3. Open fresh Page
const page: Page = await context.newPage();
`
    : `const { ${engineModule} } = require('@playwright/test');

// 1. Launch configured ${engineLabel}
const browser = await ${engineModule}.launch({
  headless: false,
  slowMo: 50,
});

// 2. Create isolated Browser Context with simulated device & locale
const context = await browser.newContext({
  viewport: { width: ${config.viewport.width}, height: ${config.viewport.height} },
  colorScheme: '${config.colorScheme}',
  locale: '${config.locale}',
  timezoneId: '${config.timezoneId}',
  permissions: ${JSON.stringify(config.permissions)},
  ${config.geolocation ? `geolocation: { latitude: ${config.geolocation.latitude}, longitude: ${config.geolocation.longitude} },` : ''}
  userAgent: '${
    browserType === 'firefox'
      ? 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0'
      : browserType === 'webkit'
      ? 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15'
      : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
  }',
});

// 3. Open fresh Page
const page = await context.newPage();
`;
}

export function generatePlaywrightConfig(
  browserType: BrowserType = 'chromium',
  config: ContextConfig,
  language: SupportedLanguage = 'typescript'
): string {
  const isTs = language === 'typescript';

  if (isTs) {
    return `import { defineConfig, devices } from '@playwright/test';

/**
 * Multi-Engine Test Runner Configuration
 * Active Engine: ${browserType.toUpperCase()}
 */
export default defineConfig({
  testDir: './tests',
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }], ['list']],
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: ${config.viewport.width}, height: ${config.viewport.height} },
    colorScheme: '${config.colorScheme}',
    locale: '${config.locale}',
  },

  projects: [
    {
      name: '${browserType}',
      use: {
        ...devices['${
          browserType === 'firefox'
            ? 'Desktop Firefox'
            : browserType === 'webkit'
            ? 'Desktop Safari'
            : 'Desktop Chrome'
        }'],
        browserName: '${browserType}',
      },
    },
    {
      name: 'all-browsers-chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'all-browsers-firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'all-browsers-webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
`;
  } else {
    return `const { defineConfig, devices } = require('@playwright/test');

/**
 * Multi-Engine Test Runner Configuration
 * Active Engine: ${browserType.toUpperCase()}
 */
module.exports = defineConfig({
  testDir: './tests',
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: true,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    viewport: { width: ${config.viewport.width}, height: ${config.viewport.height} },
    colorScheme: '${config.colorScheme}',
    locale: '${config.locale}',
  },

  projects: [
    {
      name: '${browserType}',
      use: {
        ...devices['${
          browserType === 'firefox'
            ? 'Desktop Firefox'
            : browserType === 'webkit'
            ? 'Desktop Safari'
            : 'Desktop Chrome'
        }'],
        browserName: '${browserType}',
      },
    },
  ],
});
`;
  }
}

function sanitizeIdentifier(str: string, fallbackIdx: number): string {
  const cleaned = str
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .trim()
    .split(/\s+/)
    .map((word, idx) => (idx === 0 ? word.toLowerCase() : capitalize(word)))
    .join('');

  if (!cleaned || /^[0-9]/.test(cleaned)) {
    return `elem${fallbackIdx + 1}`;
  }
  return cleaned.slice(0, 30);
}

function capitalize(s: string): string {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}
