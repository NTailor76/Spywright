import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Copy,
  Check,
  Download,
  FileCode,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Layers,
} from 'lucide-react';
import { DomElementNode, SupportedLanguage } from '../types';

interface AiArchitectModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  pageTitle: string;
  allElements: DomElementNode[];
  language: SupportedLanguage;
}

export const AiArchitectModal: React.FC<AiArchitectModalProps> = ({
  isOpen,
  onClose,
  url,
  pageTitle,
  allElements,
  language,
}) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    pageObjectName: string;
    pageObjectCode: string;
    specCode: string;
    qaNotes?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedTab, setCopiedTab] = useState<'pom' | 'spec' | null>(null);
  const [viewTab, setViewTab] = useState<'pom' | 'spec'>('pom');

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    // Pick key interactive elements for the AI prompt
    const interactiveSummary = allElements
      .filter((el) => el.isInteractive || el.testId || el.role)
      .slice(0, 15)
      .map((el) => ({
        tagName: el.tagName,
        role: el.role,
        accessibleName: el.accessibleName,
        testId: el.testId,
        recommendedLocator: el.locators[0]?.codeTs || '',
      }));

    try {
      const res = await fetch('/api/ai-generate-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageUrl: url,
          pageTitle,
          elements: interactiveSummary,
          language,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setResult(data.data);
      } else if (data.fallback) {
        // Fallback generator when key is not active
        setResult({
          pageObjectName: `${pageTitle.replace(/[^a-zA-Z]/g, '')}Page`,
          pageObjectCode: `// Standard Template Page Object Model for ${url}\nimport { type Page, type Locator, expect } from '@playwright/test';\n\nexport class ${pageTitle.replace(/[^a-zA-Z]/g, '')}Page {\n  readonly page: Page;\n\n  constructor(page: Page) {\n    this.page = page;\n  }\n\n  async goto() {\n    await this.page.goto('${url}');\n  }\n}`,
          specCode: `import { test, expect } from '@playwright/test';\n\ntest.describe('${pageTitle}', () => {\n  test('smoke verification', async ({ page }) => {\n    await page.goto('${url}');\n    await expect(page).toHaveTitle(/.*/);\n  });\n});`,
          qaNotes: 'Generated via template engine. Add GEMINI_API_KEY for dynamic contextual synthesis.',
        });
      } else {
        throw new Error(data.error || 'Failed to generate test suite');
      }
    } catch (err: any) {
      setError(err.message || 'Error communicating with AI service');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (type: 'pom' | 'spec') => {
    if (!result) return;
    const text = type === 'pom' ? result.pageObjectCode : result.specCode;
    navigator.clipboard.writeText(text);
    setCopiedTab(type);
    setTimeout(() => setCopiedTab(null), 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden text-slate-900 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">AI Page Object Model & Scenario Architect</h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Synthesize complete POM classes and robust automation test specs using inspected DOM
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          {!result && !loading && (
            <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-2xs">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Analyze {allElements.filter((e) => e.isInteractive).length} Interactive Elements
                </h3>
                <p className="text-xs text-slate-500 max-w-md mt-1 font-medium">
                  AI will analyze form fields, ARIA labels, semantic roles, and buttons on{' '}
                  <span className="font-mono text-indigo-600 font-semibold">{url}</span> to produce clean Page Objects and tests.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGenerate}
                className="mt-2 flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate AI Test Suite</span>
              </button>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-500">
              <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
              <div className="text-xs font-semibold">Analyzing DOM hierarchy & synthesizing POM...</div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2 shadow-2xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {result && (
            <div className="flex flex-col gap-3 flex-1">
              {/* Tab Selector */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setViewTab('pom')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                      viewTab === 'pom'
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Page Object ({result.pageObjectName})
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewTab('spec')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                      viewTab === 'spec'
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Test Spec (*.spec.{language === 'typescript' ? 'ts' : 'js'})
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(viewTab)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-bold shadow-xs transition-colors"
                >
                  {copiedTab === viewTab ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedTab === viewTab ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>

              {/* Code */}
              <pre className="font-mono text-xs text-indigo-200 p-4 bg-slate-950 rounded-lg border border-slate-800 overflow-x-auto select-all max-h-80 shadow-md">
                <code>{viewTab === 'pom' ? result.pageObjectCode : result.specCode}</code>
              </pre>

              {result.qaNotes && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 shadow-2xs">
                  <span className="font-bold text-slate-800 block mb-1">QA Architect Insights:</span>
                  <p className="text-slate-600 text-[11px] whitespace-pre-wrap">{result.qaNotes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
