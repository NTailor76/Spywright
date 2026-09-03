export type SupportedLanguage = 'typescript' | 'javascript';

export type BrowserType = 'chromium' | 'firefox' | 'webkit';

export interface ContextConfig {
  viewport: { width: number; height: number };
  colorScheme: 'light' | 'dark' | 'no-preference';
  userAgent?: string;
  locale: string;
  timezoneId: string;
  geolocation?: { latitude: number; longitude: number };
  permissions: string[];
  httpCredentials?: { username: string; password?: string };
}

export interface PageMetadata {
  url: string;
  title: string;
  status?: number;
  statusText?: string;
  contentType?: string;
  headers?: Record<string, string>;
  elementCount: number;
  interactiveCount: number;
  frameTree: FrameInfo[];
}

export interface FrameInfo {
  id: string;
  name: string;
  url: string;
  isMainFrame: boolean;
  selector?: string;
}

export type LocatorStrategyType =
  | 'getByRole'
  | 'getByLabel'
  | 'getByPlaceholder'
  | 'getByText'
  | 'getByTestId'
  | 'getByTitle'
  | 'getByAltText'
  | 'css'
  | 'xpath'
  | 'chained'
  | 'filter';

export interface PlaywrightLocatorCandidate {
  strategy: LocatorStrategyType;
  title: string;
  codeTs: string;
  codeJs: string;
  rawSelector: string;
  resilienceRating: number; // 1 to 5 stars
  isBestPractice: boolean;
  rank?: 1 | 2;
  matchCategory?: 'user_ui' | 'dev_automation' | 'structural';
  categoryLabel?: string;
  bestMatchReason?: string;
  description: string;
  matchCount?: number;
  isStrictCompliant?: boolean;
  role?: string;
  roleOptions?: {
    name?: string;
    exact?: boolean;
    checked?: boolean;
    pressed?: boolean;
    expanded?: boolean;
    level?: number;
  };
}

export interface DomElementNode {
  id: string;
  tagName: string;
  domId?: string;
  name?: string;
  classes: string[];
  role?: string;
  accessibleName?: string;
  innerText?: string;
  placeholder?: string;
  type?: string;
  value?: string;
  href?: string;
  src?: string;
  alt?: string;
  title?: string;
  testId?: string; // data-testid, data-test, data-cy, data-qa
  ariaLabel?: string;
  ariaLabelledby?: string;
  ariaDescribedby?: string;
  ariaExpanded?: boolean;
  ariaPressed?: boolean;
  ariaChecked?: boolean;
  ariaSelected?: boolean;
  ariaDisabled?: boolean;
  ariaHidden?: boolean;
  ariaInvalid?: boolean;
  ariaCurrent?: string;
  checked?: boolean;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  tabIndex?: number;
  headingLevel?: number;
  target?: string;
  formAction?: string;
  formMethod?: string;
  attributes: Record<string, string>;
  rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  isVisible: boolean;
  isEnabled: boolean;
  isInteractive: boolean;
  path: string; // e.g. "body > div#app > form > button"
  xpath: string;
  depth: number;
  childrenCount: number;
  children?: DomElementNode[];
  parentPath?: string;
  locators: PlaywrightLocatorCandidate[];
  isStrictCompliant?: boolean;
  matchCount?: number;
}

export interface RecordedAction {
  id: string;
  timestamp: number;
  actionType:
    | 'navigate'
    | 'click'
    | 'dblclick'
    | 'fill'
    | 'pressSequentially'
    | 'check'
    | 'uncheck'
    | 'selectOption'
    | 'hover'
    | 'pressKey'
    | 'assertVisible'
    | 'assertText'
    | 'assertValue'
    | 'assertEnabled'
    | 'assertCount';
  targetElement?: DomElementNode;
  selectedLocator: string; // The locator string chosen (e.g. page.getByRole('button', { name: 'Submit' }))
  locatorStrategy: LocatorStrategyType;
  value?: string;
  expectedText?: string;
  keyName?: string;
  comment?: string;
}

export interface DemoPreset {
  id: string;
  name: string;
  category: string;
  description: string;
  url: string;
  html: string;
}
