import { DomElementNode, PlaywrightLocatorCandidate, LocatorStrategyType } from '../types';

/**
 * Derives the computed ARIA role for a DOM element according to W3C ARIA in HTML specs
 */
export function getImplicitAriaRole(tagName: string, attributes: Record<string, string>): string | undefined {
  const explicitRole = attributes['role'];
  if (explicitRole) return explicitRole.toLowerCase().trim();

  const tag = tagName.toLowerCase();
  const type = (attributes['type'] || '').toLowerCase();

  switch (tag) {
    case 'a':
      return attributes['href'] ? 'link' : 'generic';
    case 'button':
      return 'button';
    case 'input':
      if (type === 'button' || type === 'submit' || type === 'reset' || type === 'image') return 'button';
      if (type === 'checkbox') return 'checkbox';
      if (type === 'radio') return 'radio';
      if (type === 'range') return 'slider';
      if (type === 'number') return 'spinbutton';
      if (type === 'search') return 'searchbox';
      if (type === 'email' || type === 'password' || type === 'tel' || type === 'text' || type === 'url' || !type) return 'textbox';
      return 'textbox';
    case 'select':
      return attributes['multiple'] || parseInt(attributes['size'] || '1', 10) > 1 ? 'listbox' : 'combobox';
    case 'textarea':
      return 'textbox';
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6':
      return 'heading';
    case 'img':
      return attributes['alt'] === '' ? 'presentation' : 'img';
    case 'table':
      return 'table';
    case 'tr':
      return 'row';
    case 'th':
      return 'columnheader';
    case 'td':
      return 'cell';
    case 'ul':
    case 'ol':
      return 'list';
    case 'li':
      return 'listitem';
    case 'nav':
      return 'navigation';
    case 'header':
      return 'banner';
    case 'footer':
      return 'contentinfo';
    case 'main':
      return 'main';
    case 'aside':
      return 'complementary';
    case 'form':
      return attributes['aria-label'] || attributes['aria-labelledby'] ? 'form' : undefined;
    case 'dialog':
      return 'dialog';
    default:
      return undefined;
  }
}

/**
 * Computes the accessible name for an element following W3C AccName algorithm approximations
 */
export function getAccessibleName(
  element: {
    tagName: string;
    attributes: Record<string, string>;
    innerText?: string;
    value?: string;
  },
  doc?: Document
): string {
  const { attributes, innerText, tagName, value } = element;

  // 1. aria-labelledby
  if (attributes['aria-labelledby'] && doc) {
    const ids = attributes['aria-labelledby'].split(/\s+/);
    const names: string[] = [];
    for (const id of ids) {
      const el = doc.getElementById(id);
      if (el) names.push(el.textContent?.trim() || '');
    }
    if (names.length > 0) return names.join(' ').trim();
  }

  // 2. aria-label
  if (attributes['aria-label']) {
    return attributes['aria-label'].trim();
  }

  // 3. Native label association for inputs/selects/textareas
  const tag = tagName.toLowerCase();
  if ((tag === 'input' || tag === 'select' || tag === 'textarea') && attributes['id'] && doc) {
    const label = doc.querySelector(`label[for="${attributes['id']}"]`);
    if (label && label.textContent) {
      return label.textContent.trim();
    }
  }

  // 4. alt for img
  if (tag === 'img' && attributes['alt']) {
    return attributes['alt'].trim();
  }

  // 5. title attribute
  if (attributes['title']) {
    return attributes['title'].trim();
  }

  // 6. button value (e.g. input type="submit" value="Log In")
  if (tag === 'input' && (attributes['type'] === 'submit' || attributes['type'] === 'button') && value) {
    return value.trim();
  }

  // 7. Inner text for buttons, links, headings
  if (innerText && innerText.trim()) {
    return innerText.trim().replace(/\s+/g, ' ');
  }

  // 8. placeholder as fallback
  if (attributes['placeholder']) {
    return attributes['placeholder'].trim();
  }

  return '';
}

/**
 * Escapes single quotes for JavaScript/TypeScript string literals
 */
export function escapeStr(val: string): string {
  return val.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
}

export interface PlaywrightTierInfo {
  tier: 1 | 2 | 3;
  tierName: string;
  docUrl: string;
}

export const PLAYWRIGHT_DOCS_URL = 'https://playwright.dev/docs/locators';

/**
 * Generates all candidate Playwright locators for an element ordered strictly by official Playwright best practices
 * (Reference: https://playwright.dev/docs/locators)
 */
export function generatePlaywrightLocators(
  element: DomElementNode,
  doc?: Document
): PlaywrightLocatorCandidate[] {
  const candidates: PlaywrightLocatorCandidate[] = [];
  const tag = element.tagName.toLowerCase();
  const attrs = element.attributes;
  const accName = element.accessibleName || '';
  const role = element.role;
  const testId = attrs['data-testid'] || attrs['data-test'] || attrs['data-cy'] || attrs['data-qa'];

  // =========================================================================
  // TIER 1: RECOMMENDED USER-FACING LOCATORS (Playwright Official Best Practices)
  // =========================================================================

  // 1. page.getByRole (Priority #1 in Playwright documentation)
  if (role) {
    const headingLevel = /^h([1-6])$/i.test(tag) ? parseInt(tag.substring(1), 10) : undefined;
    const isChecked = attrs['checked'] !== undefined || (element as any).checked === true;
    const isExpanded = attrs['aria-expanded'] === 'true';
    const isPressed = attrs['aria-pressed'] === 'true';

    if (accName) {
      const escapedName = escapeStr(accName);
      let optionsList: string[] = [`name: '${escapedName}'`];
      if (headingLevel) optionsList.push(`level: ${headingLevel}`);
      if (role === 'checkbox' || role === 'radio') {
        if (attrs['checked'] !== undefined) optionsList.push(`checked: ${isChecked}`);
      }
      if (attrs['aria-expanded']) optionsList.push(`expanded: ${isExpanded}`);
      if (attrs['aria-pressed']) optionsList.push(`pressed: ${isPressed}`);

      const optionsObj = `{ ${optionsList.join(', ')} }`;

      candidates.push({
        strategy: 'getByRole',
        title: `page.getByRole('${role}', ${optionsObj})`,
        codeTs: `page.getByRole('${role}', ${optionsObj})`,
        codeJs: `page.getByRole('${role}', ${optionsObj})`,
        rawSelector: `role=${role}[name="${escapedName}"]`,
        resilienceRating: 5,
        isBestPractice: true,
        description: 'Priority 1: User-facing ARIA role with accessible name (matches user & assistive tech perception).',
        role,
        roleOptions: {
          name: accName,
          level: headingLevel,
          checked: attrs['checked'] !== undefined ? isChecked : undefined,
          expanded: attrs['aria-expanded'] ? isExpanded : undefined,
          pressed: attrs['aria-pressed'] ? isPressed : undefined,
        },
      });
    } else {
      candidates.push({
        strategy: 'getByRole',
        title: `page.getByRole('${role}')`,
        codeTs: `page.getByRole('${role}')`,
        codeJs: `page.getByRole('${role}')`,
        rawSelector: `role=${role}`,
        resilienceRating: 3,
        isBestPractice: false,
        description: 'Priority 1: Semantic role locator (recommend pairing with name: or filter for strict uniqueness).',
        role,
      });
    }
  }

  // 2. page.getByLabel (Priority #2: Form controls with explicit/implicit labels)
  if (
    accName &&
    (tag === 'input' ||
      tag === 'select' ||
      tag === 'textarea' ||
      role === 'textbox' ||
      role === 'combobox' ||
      role === 'checkbox' ||
      role === 'radio')
  ) {
    const escapedLabel = escapeStr(accName);
    candidates.push({
      strategy: 'getByLabel',
      title: `page.getByLabel('${escapedLabel}')`,
      codeTs: `page.getByLabel('${escapedLabel}')`,
      codeJs: `page.getByLabel('${escapedLabel}')`,
      rawSelector: `label:has-text("${escapedLabel}")`,
      resilienceRating: 5,
      isBestPractice: true,
      description: 'Priority 2: Form control locator matching associated <label>, aria-label, or aria-labelledby.',
    });
  }

  // 3. page.getByPlaceholder (Priority #3: Form inputs by placeholder)
  if (attrs['placeholder']) {
    const escapedPlaceholder = escapeStr(attrs['placeholder'].trim());
    candidates.push({
      strategy: 'getByPlaceholder',
      title: `page.getByPlaceholder('${escapedPlaceholder}')`,
      codeTs: `page.getByPlaceholder('${escapedPlaceholder}')`,
      codeJs: `page.getByPlaceholder('${escapedPlaceholder}')`,
      rawSelector: `[placeholder="${escapedPlaceholder}"]`,
      resilienceRating: 4,
      isBestPractice: true,
      description: 'Priority 3: Input locator matching placeholder attribute seen by user.',
    });
  }

  // 4. page.getByText (Priority #4: Text content locator for non-interactive / informational elements)
  if (element.innerText && element.innerText.trim()) {
    const cleanText = element.innerText.trim().replace(/\s+/g, ' ');
    if (cleanText.length > 0 && cleanText.length < 80) {
      const escapedText = escapeStr(cleanText);
      const isExact = cleanText.length < 35;
      candidates.push({
        strategy: 'getByText',
        title: isExact
          ? `page.getByText('${escapedText}', { exact: true })`
          : `page.getByText('${escapedText}')`,
        codeTs: isExact
          ? `page.getByText('${escapedText}', { exact: true })`
          : `page.getByText('${escapedText}')`,
        codeJs: isExact
          ? `page.getByText('${escapedText}', { exact: true })`
          : `page.getByText('${escapedText}')`,
        rawSelector: `text="${escapedText}"`,
        resilienceRating: 4,
        isBestPractice: !role || role === 'generic',
        description: 'Priority 4: Locates element matching text content directly displayed on the page.',
      });
    }
  }

  // 5. page.getByAltText (Priority #5: Image alternative text)
  if ((tag === 'img' || tag === 'area' || (tag === 'input' && attrs['type'] === 'image')) && attrs['alt']) {
    const escapedAlt = escapeStr(attrs['alt']);
    candidates.push({
      strategy: 'getByAltText',
      title: `page.getByAltText('${escapedAlt}')`,
      codeTs: `page.getByAltText('${escapedAlt}')`,
      codeJs: `page.getByAltText('${escapedAlt}')`,
      rawSelector: `img[alt="${escapedAlt}"]`,
      resilienceRating: 4,
      isBestPractice: true,
      description: 'Priority 5: Locates image element by its descriptive alt attribute.',
    });
  }

  // 6. page.getByTitle (Priority #6: Title tooltip attribute)
  if (attrs['title']) {
    const escapedTitle = escapeStr(attrs['title']);
    candidates.push({
      strategy: 'getByTitle',
      title: `page.getByTitle('${escapedTitle}')`,
      codeTs: `page.getByTitle('${escapedTitle}')`,
      codeJs: `page.getByTitle('${escapedTitle}')`,
      rawSelector: `[title="${escapedTitle}"]`,
      resilienceRating: 4,
      isBestPractice: false,
      description: 'Priority 6: Locates element matching HTML title tooltip attribute.',
    });
  }

  // 7. page.getByTestId (Priority #7: Explicit Test ID attribute contract)
  if (testId) {
    const escapedId = escapeStr(testId);
    candidates.push({
      strategy: 'getByTestId',
      title: `page.getByTestId('${escapedId}')`,
      codeTs: `page.getByTestId('${escapedId}')`,
      codeJs: `page.getByTestId('${escapedId}')`,
      rawSelector: `[data-testid="${escapedId}"]`,
      resilienceRating: 5,
      isBestPractice: true,
      description: 'Priority 7: Dedicated test ID attribute contract for resilient, decoupled automation.',
    });
  }

  // =========================================================================
  // TIER 2: FILTERING & CHAINING LOCATORS (Playwright Official Filtering Guide)
  // =========================================================================
  if (element.parentPath && (role === 'button' || role === 'link' || tag === 'button' || tag === 'a')) {
    // If inside a card, row, listitem, or form
    if (element.parentPath.includes('li') || element.parentPath.includes('tr') || element.parentPath.includes('form') || element.parentPath.includes('card')) {
      const containerRole = element.parentPath.includes('li')
        ? 'listitem'
        : element.parentPath.includes('tr')
        ? 'row'
        : 'form';
      
      const childLocator = accName
        ? `getByRole('${role || tag}', { name: '${escapeStr(accName)}' })`
        : `locator('${tag}')`;

      candidates.push({
        strategy: 'filter',
        title: `page.getByRole('${containerRole}').filter({ has: page.${childLocator} })`,
        codeTs: `page.getByRole('${containerRole}').filter({ has: page.${childLocator} })`,
        codeJs: `page.getByRole('${containerRole}').filter({ has: page.${childLocator} })`,
        rawSelector: `role=${containerRole}:has(role=${role || tag})`,
        resilienceRating: 4,
        isBestPractice: true,
        description: 'Chaining Strategy: Scope locator within parent container using .filter({ has: ... }).',
      });
    }
  }

  // =========================================================================
  // TIER 3: CSS & XPATH SELECTORS (Playwright Fallback Guidelines)
  // =========================================================================
  const cssCandidates = generateRefinedCssSelectors(element);
  for (const css of cssCandidates) {
    candidates.push({
      strategy: 'css',
      title: `page.locator('${escapeStr(css)}')`,
      codeTs: `page.locator('${escapeStr(css)}')`,
      codeJs: `page.locator('${escapeStr(css)}')`,
      rawSelector: css,
      resilienceRating: css.includes('#') ? 4 : 3,
      isBestPractice: false,
      description: 'CSS Fallback: CSS selector target (use when user-facing locators are unavailable).',
    });
  }

  if (element.xpath) {
    candidates.push({
      strategy: 'xpath',
      title: `page.locator('xpath=${escapeStr(element.xpath)}')`,
      codeTs: `page.locator('${escapeStr(element.xpath)}')`,
      codeJs: `page.locator('${escapeStr(element.xpath)}')`,
      rawSelector: element.xpath,
      resilienceRating: element.xpath.includes('@id') ? 3 : 2,
      isBestPractice: false,
      description: 'XPath Fallback: XPath locator (prefer getByRole or getByTestId for long-term maintainability).',
    });
  }

  // =========================================================================
  // SMART SELECTION: STRICTLY THE 2 BEST MATCHES FOR AUTOMATION & USER UI
  // =========================================================================
  const userUiCandidates: PlaywrightLocatorCandidate[] = [];
  const devContractCandidates: PlaywrightLocatorCandidate[] = [];
  const structuralCandidates: PlaywrightLocatorCandidate[] = [];

  for (const cand of candidates) {
    if (cand.strategy === 'getByTestId') {
      cand.matchCategory = 'dev_automation';
      cand.categoryLabel = 'Dev Automation Contract (data-testid)';
      cand.bestMatchReason = 'Explicit test automation hook provided by the development team, completely decoupled from UI styling and text copy shifts.';
      devContractCandidates.push(cand);
    } else if (cand.strategy === 'getByRole' && cand.roleOptions?.name) {
      cand.matchCategory = 'user_ui';
      cand.categoryLabel = 'User UI Match (W3C Standard)';
      cand.bestMatchReason = 'Matches how real users and screen readers perceive the element using W3C semantic role and accessible name.';
      userUiCandidates.push(cand);
    } else if (cand.strategy === 'getByLabel') {
      cand.matchCategory = 'user_ui';
      cand.categoryLabel = 'User UI Form Match (getByLabel)';
      cand.bestMatchReason = 'Directly bound to form control label text, highly resilient to input DOM repositioning.';
      userUiCandidates.push(cand);
    } else if (cand.strategy === 'getByPlaceholder') {
      cand.matchCategory = 'user_ui';
      cand.categoryLabel = 'User UI Placeholder Match';
      cand.bestMatchReason = 'Matches visible input placeholder text exposed directly to the user in the UI.';
      userUiCandidates.push(cand);
    } else if (cand.strategy === 'getByAltText') {
      cand.matchCategory = 'user_ui';
      cand.categoryLabel = 'User UI Image Alt Match';
      cand.bestMatchReason = 'Matches image alternative text description exposed to assistive tools.';
      userUiCandidates.push(cand);
    } else if (cand.strategy === 'getByText' && cand.isBestPractice) {
      cand.matchCategory = 'user_ui';
      cand.categoryLabel = 'User UI Text Match';
      cand.bestMatchReason = 'Matches visible text copy rendered on the screen.';
      userUiCandidates.push(cand);
    } else if (cand.strategy === 'css' && cand.rawSelector.startsWith('#')) {
      cand.matchCategory = 'dev_automation';
      cand.categoryLabel = 'Dev ID Selector (#id)';
      cand.bestMatchReason = 'Unique DOM element ID assigned by developers in markup.';
      devContractCandidates.push(cand);
    } else if (cand.strategy === 'filter') {
      cand.matchCategory = 'structural';
      cand.categoryLabel = 'Scoped Container Filter';
      cand.bestMatchReason = 'Chained locator scoped to a specific row, card, or list item.';
      structuralCandidates.push(cand);
    } else {
      cand.matchCategory = 'structural';
      cand.categoryLabel = 'Structural Selector';
      cand.bestMatchReason = 'Structural CSS or XPath fallback.';
      structuralCandidates.push(cand);
    }
  }

  const selectedMatches: PlaywrightLocatorCandidate[] = [];

  // Pair 1: Ideal Combo — User UI Match + Dev Automation Contract
  if (userUiCandidates.length > 0 && devContractCandidates.length > 0) {
    selectedMatches.push(userUiCandidates[0]);
    selectedMatches.push(devContractCandidates[0]);
  } else if (devContractCandidates.length > 0) {
    // If dev contract exists (e.g. data-testid)
    selectedMatches.push(devContractCandidates[0]);
    if (userUiCandidates.length > 0) {
      selectedMatches.push(userUiCandidates[0]);
    } else if (devContractCandidates.length > 1) {
      selectedMatches.push(devContractCandidates[1]);
    } else if (structuralCandidates.length > 0) {
      selectedMatches.push(structuralCandidates[0]);
    }
  } else if (userUiCandidates.length > 0) {
    // If multiple user UI candidates exist (e.g. getByRole + getByPlaceholder)
    selectedMatches.push(userUiCandidates[0]);
    if (userUiCandidates.length > 1) {
      selectedMatches.push(userUiCandidates[1]);
    } else if (structuralCandidates.length > 0) {
      selectedMatches.push(structuralCandidates[0]);
    }
  } else {
    // Fallback if no semantic or dev contracts exist
    if (structuralCandidates.length > 0) selectedMatches.push(structuralCandidates[0]);
    if (structuralCandidates.length > 1) selectedMatches.push(structuralCandidates[1]);
  }

  // Deduplicate and constrain strictly to top 2
  const uniqueMatches: PlaywrightLocatorCandidate[] = [];
  const seenCodes = new Set<string>();

  for (const m of selectedMatches) {
    if (!seenCodes.has(m.codeTs) && uniqueMatches.length < 2) {
      seenCodes.add(m.codeTs);
      uniqueMatches.push(m);
    }
  }

  // If still fewer than 2, fill from candidates pool
  if (uniqueMatches.length < 2) {
    for (const c of candidates) {
      if (!seenCodes.has(c.codeTs) && uniqueMatches.length < 2) {
        seenCodes.add(c.codeTs);
        uniqueMatches.push(c);
      }
    }
  }

  // Assign 1 | 2 rank and strict compliance flags
  return uniqueMatches.map((item, index) => {
    item.rank = (index + 1) as 1 | 2;
    item.isStrictCompliant = true;
    return item;
  });
}

function generateRefinedCssSelectors(element: DomElementNode): string[] {
  const tag = element.tagName.toLowerCase();
  const attrs = element.attributes;
  const results: string[] = [];

  if (attrs['id']) {
    results.push(`#${attrs['id']}`);
    results.push(`${tag}#${attrs['id']}`);
  }

  if (attrs['name']) {
    results.push(`${tag}[name="${attrs['name']}"]`);
  }

  if (attrs['type'] && (tag === 'input' || tag === 'button')) {
    results.push(`${tag}[type="${attrs['type']}"]`);
  }

  if (element.classes && element.classes.length > 0) {
    const usefulClasses = element.classes.filter(
      c => !c.startsWith('css-') && !c.startsWith('style-') && c.length < 30
    );
    if (usefulClasses.length > 0) {
      results.push(`${tag}.${usefulClasses.slice(0, 2).join('.')}`);
    }
  }

  return Array.from(new Set(results));
}
