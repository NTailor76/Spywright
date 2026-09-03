import { DomElementNode } from '../types';
import { getImplicitAriaRole, getAccessibleName, generatePlaywrightLocators } from './locatorAnalyzer';

export function parseDocumentToDomTree(doc: Document): {
  tree: DomElementNode[];
  domTree: DomElementNode[];
  allElements: DomElementNode[];
  elementMap: Map<string, DomElementNode>;
} {
  const allElements: DomElementNode[] = [];
  const elementMap = new Map<string, DomElementNode>();
  let elementCounter = 0;

  function traverse(el: Element, depth: number, parentPath?: string): DomElementNode | null {
    // Skip script, style, meta, head, noscript
    const tagName = el.tagName.toLowerCase();
    if (['script', 'style', 'meta', 'link', 'noscript', 'title'].includes(tagName)) {
      return null;
    }

    const uniqueId = `elem_${++elementCounter}`;
    const attributes: Record<string, string> = {};
    for (let i = 0; i < el.attributes.length; i++) {
      const attr = el.attributes[i];
      attributes[attr.name] = attr.value;
    }

    const classes = Array.from(el.classList);
    const role = getImplicitAriaRole(tagName, attributes);
    const innerText = el.textContent?.trim().slice(0, 150) || '';
    const accessibleName = getAccessibleName(
      {
        tagName,
        attributes,
        innerText,
        value: (el as HTMLInputElement).value,
      },
      doc
    );

    // Compute bounding rect
    let rect = { x: 0, y: 0, width: 0, height: 0 };
    let isVisible = true;
    try {
      const clientRect = el.getBoundingClientRect();
      rect = {
        x: Math.round(clientRect.left),
        y: Math.round(clientRect.top),
        width: Math.round(clientRect.width),
        height: Math.round(clientRect.height),
      };
      // Check computed visibility if possible
      const win = doc.defaultView || window;
      const style = win.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
        isVisible = false;
      }
    } catch {
      // fallback
    }

    const isEnabled = !(el as HTMLButtonElement).disabled;
    const isInteractive = [
      'a', 'button', 'input', 'select', 'textarea', 'label', 'details', 'summary'
    ].includes(tagName) || !!attributes['role'] || !!attributes['tabindex'] || !!attributes['onclick'];

    // Extended ARIA and HTML Form Properties
    const headingMatch = /^h([1-6])$/i.exec(tagName);
    const headingLevel = headingMatch ? parseInt(headingMatch[1], 10) : undefined;
    const isChecked = (el as HTMLInputElement).checked ?? (attributes['checked'] !== undefined || attributes['aria-checked'] === 'true');
    const isRequired = (el as HTMLInputElement).required || attributes['required'] !== undefined || attributes['aria-required'] === 'true';
    const isReadOnly = (el as HTMLInputElement).readOnly || attributes['readonly'] !== undefined || attributes['aria-readonly'] === 'true';
    const isDisabled = (el as HTMLInputElement).disabled || attributes['disabled'] !== undefined || attributes['aria-disabled'] === 'true';
    const tabIndexAttr = attributes['tabindex'];
    const tabIndex = tabIndexAttr !== undefined ? parseInt(tabIndexAttr, 10) : undefined;

    // Construct path & xpath
    const domId = attributes['id'];
    const currentSegment = domId ? `${tagName}#${domId}` : classes.length > 0 ? `${tagName}.${classes[0]}` : tagName;
    const path = parentPath ? `${parentPath} > ${currentSegment}` : currentSegment;

    // XPath calculation
    let xpath = '';
    if (domId) {
      xpath = `//*[@id='${domId}']`;
    } else if (attributes['name']) {
      xpath = `//${tagName}[@name='${attributes['name']}']`;
    } else if (accessibleName && (tagName === 'button' || tagName === 'a')) {
      xpath = `//${tagName}[contains(text(), '${accessibleName.slice(0, 20)}')]`;
    } else {
      xpath = `//${path.replace(/\s*>\s*/g, '/')}`;
    }

    const node: DomElementNode = {
      id: uniqueId,
      tagName,
      domId,
      name: attributes['name'],
      classes,
      role,
      accessibleName,
      innerText,
      placeholder: attributes['placeholder'],
      type: attributes['type'],
      value: (el as HTMLInputElement).value,
      href: attributes['href'],
      src: attributes['src'],
      alt: attributes['alt'],
      title: attributes['title'],
      testId: attributes['data-testid'] || attributes['data-test'] || attributes['data-cy'] || attributes['data-qa'],
      ariaLabel: attributes['aria-label'],
      ariaLabelledby: attributes['aria-labelledby'],
      ariaDescribedby: attributes['aria-describedby'],
      ariaExpanded: attributes['aria-expanded'] !== undefined ? attributes['aria-expanded'] === 'true' : undefined,
      ariaPressed: attributes['aria-pressed'] !== undefined ? attributes['aria-pressed'] === 'true' : undefined,
      ariaChecked: attributes['aria-checked'] !== undefined ? attributes['aria-checked'] === 'true' : undefined,
      ariaSelected: attributes['aria-selected'] !== undefined ? attributes['aria-selected'] === 'true' : undefined,
      ariaDisabled: attributes['aria-disabled'] !== undefined ? attributes['aria-disabled'] === 'true' : undefined,
      ariaHidden: attributes['aria-hidden'] !== undefined ? attributes['aria-hidden'] === 'true' : undefined,
      ariaInvalid: attributes['aria-invalid'] !== undefined ? attributes['aria-invalid'] === 'true' : undefined,
      ariaCurrent: attributes['aria-current'],
      checked: isChecked,
      required: isRequired,
      readOnly: isReadOnly,
      disabled: isDisabled,
      tabIndex,
      headingLevel,
      target: attributes['target'],
      formAction: attributes['formaction'] || (tagName === 'form' ? attributes['action'] : undefined),
      formMethod: attributes['formmethod'] || (tagName === 'form' ? attributes['method'] : undefined),
      attributes,
      rect,
      isVisible,
      isEnabled,
      isInteractive,
      path,
      xpath,
      depth,
      childrenCount: el.children.length,
      children: [],
      parentPath,
      locators: [],
    };

    // Attach dataset attribute for visual inspector DOM matching
    try {
      (el as HTMLElement).dataset.spyId = uniqueId;
    } catch {
      // Ignore if element is not HTMLElement
    }

    node.locators = generatePlaywrightLocators(node, doc);

    // Recursively parse children
    const childNodes: DomElementNode[] = [];
    for (let i = 0; i < el.children.length; i++) {
      const childParsed = traverse(el.children[i], depth + 1, path);
      if (childParsed) {
        childNodes.push(childParsed);
      }
    }
    node.children = childNodes;

    allElements.push(node);
    elementMap.set(uniqueId, node);

    return node;
  }

  const rootElement = doc.body || doc.documentElement;
  const tree: DomElementNode[] = [];
  if (rootElement) {
    const rootNode = traverse(rootElement, 0);
    if (rootNode) tree.push(rootNode);
  }

  return { tree, domTree: tree, allElements, elementMap };
}
