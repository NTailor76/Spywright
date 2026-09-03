import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  FileCode,
  FileSpreadsheet,
  CheckCircle2,
  Code2,
  Layers,
  Sparkles,
  RefreshCw,
  Terminal,
} from 'lucide-react';
import {
  DomElementNode,
  PlaywrightLocatorCandidate,
  RecordedAction,
  SupportedLanguage,
  ContextConfig,
  BrowserType,
} from '../types';
import {
  generateFullTestSpec,
  generatePageObjectModel,
  generateCucumberBdd,
  generateContextSetupCode,
  generatePlaywrightConfig,
} from '../utils/codeGenerator';

interface CodeGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  pageTitle: string;
  selectedElement: DomElementNode | null;
  selectedCandidate: PlaywrightLocatorCandidate | undefined;
  recordedActions: RecordedAction[];
  allElements: DomElementNode[];
  language: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  contextConfig: ContextConfig;
  browserType: BrowserType;
}

type CodeTab = 'spec' | 'pom' | 'cucumber' | 'context' | 'config';

export const CodeGeneratorModal: React.FC<CodeGeneratorModalProps> = ({
  isOpen,
  onClose,
  url,
  pageTitle,
  selectedElement,
  selectedCandidate,
  recordedActions,
  allElements,
  language,
  onLanguageChange,
  contextConfig,
  browserType,
}) => {
  const [activeTab, setActiveTab] = useState<CodeTab>('spec');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const isTs = language === 'typescript';

  // Compute code based on active tab
  let codeContent = '';
  let filename = '';

  if (activeTab === 'spec') {
    codeContent = generateFullTestSpec(
      url,
      recordedActions,
      selectedElement,
      selectedCandidate,
      language,
      pageTitle,
      browserType
    );
    filename = `automation.spec.${isTs ? 'ts' : 'js'}`;
  } else if (activeTab === 'pom') {
    codeContent = generatePageObjectModel(
      url,
      allElements,
      language,
      'ApplicationPage'
    );
    filename = `ApplicationPage.${isTs ? 'ts' : 'js'}`;
  } else if (activeTab === 'cucumber') {
    const bdd = generateCucumberBdd(url, selectedElement, selectedCandidate, language);
    codeContent = `${bdd.feature}\n# --- Step Definitions (${filename}) ---\n${bdd.stepDefs}`;
    filename = `automation.steps.${isTs ? 'ts' : 'js'}`;
  } else if (activeTab === 'context') {
    codeContent = generateContextSetupCode(contextConfig, language, browserType);
    filename = `playwright.context.${isTs ? 'ts' : 'js'}`;
  } else if (activeTab === 'config') {
    codeContent = generatePlaywrightConfig(browserType, contextConfig, language);
    filename = `playwright.config.${isTs ? 'ts' : 'js'}`;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(codeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([codeContent], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-900">
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Test Automation Code Generator
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Production-grade automation scripts, Page Objects, and test assertions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <div className="flex items-center bg-slate-100 border border-slate-300 rounded-md p-0.5">
              <button
                type="button"
                onClick={() => onLanguageChange('typescript')}
                className={`px-3 py-1 text-xs font-bold rounded transition-colors ${
                  language === 'typescript'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                TypeScript
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange('javascript')}
                className={`px-3 py-1 text-xs font-bold rounded transition-colors ${
                  language === 'javascript'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                JavaScript
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-slate-950 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Controls Bar */}
        <div className="px-5 py-2 bg-white border-b border-slate-200 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('spec')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                activeTab === 'spec'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Test Spec (*.spec.{isTs ? 'ts' : 'js'})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('pom')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                activeTab === 'pom'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Page Object Model (POM)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('cucumber')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                activeTab === 'cucumber'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Cucumber BDD Spec</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('context')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                activeTab === 'context'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Context Setup</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('config')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                activeTab === 'config'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Runner Config</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded border border-indigo-200 bg-indigo-50 text-indigo-700 uppercase">
              {browserType}
            </span>
            <span className="text-[11px] font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-300 font-semibold">
              {filename}
            </span>
          </div>
        </div>

        {/* Code Viewer Box */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-900">
          <pre className="font-mono text-xs text-indigo-300 leading-relaxed overflow-x-auto p-4 bg-slate-950 rounded-lg border border-slate-800 select-all shadow-md">
            <code>{codeContent}</code>
          </pre>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-white border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-600 font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Strict locators &amp; web-first assertions format</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Download File</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
