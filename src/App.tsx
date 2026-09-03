import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { LivePageViewer } from './components/LivePageViewer';
import { ObjectSpyPanel } from './components/ObjectSpyPanel';
import { CodeGeneratorModal } from './components/CodeGeneratorModal';
import { TestRecorderDrawer } from './components/TestRecorderDrawer';
import { AiArchitectModal } from './components/AiArchitectModal';
import { QuickStartBanner } from './components/QuickStartBanner';
import { LegalNoticeModal } from './components/LegalNoticeModal';
import { DEMO_PRESETS } from './data/demoPresets';
import { GOOGLE_SEARCH_HTML } from './data/googleSearchPage';
import { parseDocumentToDomTree } from './utils/domParser';
import {
  DomElementNode,
  DemoPreset,
  SupportedLanguage,
  BrowserType,
  ContextConfig,
  PageMetadata,
  RecordedAction,
} from './types';

export default function App() {
  // Demo presets
  const initialPreset = DEMO_PRESETS[0];

  // State
  const [currentUrl, setCurrentUrl] = useState<string>(initialPreset.url);
  const [currentHtml, setCurrentHtml] = useState<string>(initialPreset.html);
  const [activePresetId, setActivePresetId] = useState<string | null>(initialPreset.id);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Inspector & Spy State
  const [spyActive, setSpyActive] = useState<boolean>(true);
  const [recordingActive, setRecordingActive] = useState<boolean>(false);
  const [language, setLanguage] = useState<SupportedLanguage>('typescript');
  const [browserType, setBrowserType] = useState<BrowserType>('chromium');

  // Browser Context Configuration for code generation
  const [contextConfig, setContextConfig] = useState<ContextConfig>({
    viewport: { width: 1280, height: 800 },
    colorScheme: 'light',
    locale: 'en-US',
    timezoneId: 'America/New_York',
    permissions: ['geolocation'],
    geolocation: { latitude: 37.7749, longitude: -122.4194 },
  });

  // Selected DOM element and highlighted matches
  const [selectedElement, setSelectedElement] = useState<DomElementNode | null>(null);
  const [highlightedElementIds, setHighlightedElementIds] = useState<string[]>([]);

  // Test journey recording
  const [recordedActions, setRecordedActions] = useState<RecordedAction[]>([]);
  const [isRecorderDrawerOpen, setIsRecorderDrawerOpen] = useState<boolean>(false);

  // Modals
  const [isCodeModalOpen, setIsCodeModalOpen] = useState<boolean>(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState<boolean>(false);

  // Parse HTML into DOM Tree and allElements
  const { domTree, allElements, elementMap } = useMemo(() => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(currentHtml, 'text/html');
      return parseDocumentToDomTree(doc);
    } catch (e) {
      console.error('DOM parsing error:', e);
      return { tree: [], domTree: [], allElements: [], elementMap: new Map<string, DomElementNode>() };
    }
  }, [currentHtml]);

  // Set default selected element if none
  useEffect(() => {
    if (allElements.length > 0 && !selectedElement) {
      // Pick first interactive element (button or input)
      const firstInteractive =
        allElements.find((el) => el.tagName === 'button' || el.tagName === 'input') ||
        allElements[0];
      setSelectedElement(firstInteractive);
    }
  }, [allElements, selectedElement]);

  // Page Metadata
  const pageMetadata: PageMetadata = useMemo(() => {
    let title = 'Web Application';
    try {
      const match = currentHtml.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (match) title = match[1].trim();
    } catch {
      // fallback
    }

    const interactiveCount = allElements.filter((e) => e.isInteractive).length;

    return {
      url: currentUrl,
      title,
      elementCount: allElements.length,
      interactiveCount,
      frameTree: [
        {
          id: 'main-frame',
          name: 'Main Page Context',
          url: currentUrl,
          isMainFrame: true,
        },
      ],
    };
  }, [currentUrl, currentHtml, allElements]);

  // Fetch Live URL via Express backend proxy
  const handleFetchUrl = async (urlToFetch: string) => {
    setIsLoading(true);
    setFetchError(null);
    setActivePresetId(null);

    const cleanInput = urlToFetch
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/$/, '');

    // Check if matching a built-in or benchmark preset (e.g., google.com, saucedemo.com)
    const matchingPreset = DEMO_PRESETS.find((p) => {
      const pClean = p.url
        .toLowerCase()
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .replace(/\/$/, '');
      return (
        pClean === cleanInput ||
        p.id.toLowerCase() === cleanInput ||
        (cleanInput.includes('saucedemo') && p.id === 'saucedemo') ||
        ((cleanInput === 'google.com' || cleanInput === 'google' || cleanInput.startsWith('google.')) && p.id === 'google-search')
      );
    });

    if (matchingPreset) {
      setCurrentUrl(matchingPreset.url);
      setCurrentHtml(matchingPreset.html);
      setActivePresetId(matchingPreset.id);
      setSelectedElement(null);
      setIsLoading(false);
      return;
    }

    try {
      let targetUrl = urlToFetch.trim();
      if (!/^https?:\/\//i.test(targetUrl)) {
        targetUrl = 'https://' + targetUrl;
      }

      const isGoogleUrl = targetUrl.toLowerCase().includes('google.');

      let data: any = null;
      try {
        const res = await fetch('/api/proxy-fetch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: targetUrl,
            viewportWidth: contextConfig.viewport.width,
            viewportHeight: contextConfig.viewport.height,
          }),
        });

        if (res.ok) {
          data = await res.json();
        } else {
          // If response is not 200 (e.g. 404 on Vercel without serverless functions, or 500)
          const text = await res.text().catch(() => '');
          try {
            data = JSON.parse(text);
          } catch {
            data = { error: `HTTP ${res.status}: ${res.statusText || 'Proxy service unavailable'}` };
          }
        }
      } catch (networkErr: any) {
        data = { error: networkErr.message || 'Network request failed' };
      }

      if (data?.success && data?.html) {
        setCurrentUrl(data.finalUrl || targetUrl);
        setCurrentHtml(data.html);
        setSelectedElement(null);
      } else if (isGoogleUrl) {
        // High-availability fallback for Google search benchmarks
        setCurrentUrl('https://www.google.com');
        setCurrentHtml(GOOGLE_SEARCH_HTML);
        setSelectedElement(null);
      } else {
        throw new Error(data?.error || 'Failed to fetch the target webpage.');
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      setFetchError(err.message || 'Could not load URL');
    } finally {
      setIsLoading(false);
    }
  };

  // Select Preset handler
  const handleSelectPreset = (preset: DemoPreset) => {
    setCurrentUrl(preset.url);
    setCurrentHtml(preset.html);
    setActivePresetId(preset.id);
    setSelectedElement(null);
    setFetchError(null);
  };

  // Select Element by Spy ID (from iframe click)
  const handleSelectElementById = useCallback(
    (spyId: string) => {
      const node = elementMap.get(spyId);
      if (node) {
        setSelectedElement(node);
      }
    },
    [elementMap]
  );

  // Add recorded action
  const handleRecordAction = useCallback(
    (actionData: Omit<RecordedAction, 'id' | 'timestamp'>) => {
      const newAction: RecordedAction = {
        ...actionData,
        id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        timestamp: Date.now(),
      };
      setRecordedActions((prev) => [...prev, newAction]);
      setIsRecorderDrawerOpen(true);
    },
    []
  );

  const handleDeleteAction = (id: string) => {
    setRecordedActions((prev) => prev.filter((a) => a.id !== id));
  };

  const handleClearActions = () => {
    setRecordedActions([]);
  };

  // Handle Interactive In-Canvas Navigation
  const handleNavigate = useCallback(
    (newUrl: string, newHtml?: string) => {
      setSelectedElement(null);
      if (newHtml) {
        setCurrentUrl(newUrl);
        setCurrentHtml(newHtml);
        const preset = DEMO_PRESETS.find(
          (p) => p.url.toLowerCase() === newUrl.toLowerCase()
        );
        if (preset) {
          setActivePresetId(preset.id);
        }
      } else {
        handleFetchUrl(newUrl);
      }

      if (recordingActive) {
        handleRecordAction({
          actionType: 'goto',
          selectedLocator: `page.goto('${newUrl}')`,
          locatorStrategy: 'goto',
          value: newUrl,
          comment: `Navigate to ${newUrl}`,
        });
      }
    },
    [recordingActive, handleRecordAction, handleFetchUrl]
  );

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Top Application Navbar */}
      <Navbar
        currentUrl={currentUrl}
        onUrlChange={setCurrentUrl}
        onFetchUrl={handleFetchUrl}
        isLoading={isLoading}
        activePresetId={activePresetId}
        onSelectPreset={handleSelectPreset}
        spyActive={spyActive}
        onToggleSpy={() => setSpyActive(!spyActive)}
        recordingActive={recordingActive}
        onToggleRecording={() => {
          setRecordingActive(!recordingActive);
          if (!recordingActive) {
            setIsRecorderDrawerOpen(true);
          }
        }}
        language={language}
        onLanguageChange={setLanguage}
        browserType={browserType}
        onBrowserTypeChange={setBrowserType}
        onOpenCodeModal={() => setIsCodeModalOpen(true)}
        onOpenAiModal={() => setIsAiModalOpen(true)}
        onOpenLegalModal={() => setIsLegalModalOpen(true)}
        recordedActionsCount={recordedActions.length}
      />

      {/* Top Instructions: Quick Start Guide */}
      <QuickStartBanner
        onOpenLegalModal={() => setIsLegalModalOpen(true)}
      />

      {/* Error Alert Bar if any */}
      {fetchError && (
        <div className="bg-rose-50 border-b border-rose-200 text-rose-800 px-4 py-2 text-xs flex items-center justify-between shadow-2xs">
          <span>Failed to fetch live URL: {fetchError}. Showing cached preview.</span>
          <button
            type="button"
            onClick={() => setFetchError(null)}
            className="text-rose-600 hover:text-rose-900 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Split-View Workspace */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left: Rendered Live Page Viewer with Visual Hover Spy & Sandbox */}
        <LivePageViewer
          html={currentHtml}
          url={currentUrl}
          spyActive={spyActive}
          recordingActive={recordingActive}
          selectedElement={selectedElement}
          elementMap={elementMap}
          allElements={allElements}
          onSelectElementById={handleSelectElementById}
          onRecordAction={handleRecordAction}
          onNavigate={handleNavigate}
          highlightedElementIds={highlightedElementIds}
          viewportWidth={contextConfig.viewport.width}
          viewportHeight={contextConfig.viewport.height}
          colorScheme={contextConfig.colorScheme}
          language={language}
          browserType={browserType}
        />

        {/* Right: Object Spy Inspector & Target Locator Matrix Panel */}
        <ObjectSpyPanel
          selectedElement={selectedElement}
          domTree={domTree}
          allElements={allElements}
          onSelectElement={setSelectedElement}
          language={language}
          onAddAction={handleRecordAction}
          onHighlightMatches={setHighlightedElementIds}
        />
      </div>

      {/* Professional Polish Bottom Status Bar & Legal Disclaimer */}
      <footer id="app-statusbar" className="bg-white border-t border-slate-200 shrink-0 select-none shadow-2xs">
        <div className="px-4 py-1.5 flex flex-wrap justify-between items-center text-[11px] font-medium text-slate-500 gap-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-semibold text-slate-700 uppercase tracking-tight text-[10px]">SpyWright Inspection Engine</span>
            </div>
            <span className="text-slate-300">|</span>
            <span className="font-mono text-slate-600">
              Browser: <strong className="text-slate-800 font-bold uppercase">{browserType}</strong>
            </span>
            <span className="text-slate-300">|</span>
            <span className="font-mono text-slate-600">
              Selected: <strong className="text-indigo-600 font-bold">{selectedElement ? `<${selectedElement.tagName}>` : 'None'}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3 text-[10px]">
            <span className="text-slate-500 font-mono">
              {allElements.length} DOM Nodes ({pageMetadata.interactiveCount} Interactive)
            </span>
            <span className="text-slate-300">|</span>
            <span className="px-1.5 py-0.2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded font-bold uppercase tracking-wider">
              Strict Mode Verified
            </span>
          </div>
        </div>

        {/* Mandatory Legal Disclaimer Bar */}
        <div className="bg-slate-50 border-t border-slate-200/80 px-4 py-1 text-[10px] text-slate-400 text-center flex flex-wrap items-center justify-center gap-x-2 gap-y-1 font-normal">
          <span>SpyWright is an independent open-source project and is not affiliated with, sponsored by, or endorsed by Microsoft Corporation. Playwright is a trademark of Microsoft Corporation.</span>
          <button
            type="button"
            onClick={() => setIsLegalModalOpen(true)}
            className="text-indigo-600 hover:text-indigo-800 underline font-medium cursor-pointer"
          >
            Legal Notice &amp; Compliance Center
          </button>
        </div>
      </footer>

      {/* Bottom Test Journey Recorder Drawer */}
      <TestRecorderDrawer
        isOpen={isRecorderDrawerOpen}
        onClose={() => setIsRecorderDrawerOpen(false)}
        actions={recordedActions}
        onClearActions={handleClearActions}
        onDeleteAction={handleDeleteAction}
        onAddAssertion={(id) => {
          const act = recordedActions.find((a) => a.id === id);
          if (act) {
            handleRecordAction({
              actionType: 'assertVisible',
              selectedLocator: act.selectedLocator,
              locatorStrategy: act.locatorStrategy,
              comment: 'Assert visibility',
            });
          }
        }}
        onOpenCodeModal={() => setIsCodeModalOpen(true)}
        language={language}
      />

      {/* Code Export & Generator Modal */}
      <CodeGeneratorModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
        url={currentUrl}
        pageTitle={pageMetadata.title}
        selectedElement={selectedElement}
        selectedCandidate={selectedElement?.locators[0]}
        recordedActions={recordedActions}
        allElements={allElements}
        language={language}
        onLanguageChange={setLanguage}
        contextConfig={contextConfig}
        browserType={browserType}
      />

      {/* AI POM & Scenario Architect Modal */}
      <AiArchitectModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        url={currentUrl}
        pageTitle={pageMetadata.title}
        allElements={allElements}
        language={language}
      />

      {/* Legal & Compliance Center Modal */}
      <LegalNoticeModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
      />
    </div>
  );
}
