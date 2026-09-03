import React, { useState } from 'react';
import {
  Globe,
  Crosshair,
  CircleDot,
  FileCode,
  Sparkles,
  RefreshCw,
  Layers,
  ChevronDown,
  Check,
  Cpu,
  Flame,
  Compass,
  ScanEye,
  Scale,
  Share2,
} from 'lucide-react';
import { DemoPreset, SupportedLanguage, BrowserType } from '../types';
import { DEMO_PRESETS } from '../data/demoPresets';

interface NavbarProps {
  currentUrl: string;
  onUrlChange: (url: string) => void;
  onFetchUrl: (url: string) => void;
  isLoading: boolean;
  activePresetId: string | null;
  onSelectPreset: (preset: DemoPreset) => void;
  spyActive: boolean;
  onToggleSpy: () => void;
  recordingActive: boolean;
  onToggleRecording: () => void;
  language: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  browserType: BrowserType;
  onBrowserTypeChange: (browser: BrowserType) => void;
  onOpenCodeModal: () => void;
  onOpenAiModal: () => void;
  onOpenLegalModal?: () => void;
  onOpenShowcaseModal?: () => void;
  recordedActionsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUrl,
  onUrlChange,
  onFetchUrl,
  isLoading,
  activePresetId,
  onSelectPreset,
  spyActive,
  onToggleSpy,
  recordingActive,
  onToggleRecording,
  language,
  onLanguageChange,
  browserType,
  onBrowserTypeChange,
  onOpenCodeModal,
  onOpenAiModal,
  onOpenLegalModal,
  onOpenShowcaseModal,
  recordedActionsCount,
}) => {
  const [inputUrl, setInputUrl] = useState(currentUrl);
  const [presetDropdownOpen, setPresetDropdownOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl.trim()) {
      onFetchUrl(inputUrl.trim());
    }
  };

  const getBrowserIcon = () => {
    switch (browserType) {
      case 'firefox':
        return <Flame className="w-3.5 h-3.5 text-orange-500" />;
      case 'webkit':
        return <Compass className="w-3.5 h-3.5 text-sky-500" />;
      default:
        return <Cpu className="w-3.5 h-3.5 text-indigo-600" />;
    }
  };

  return (
    <header id="app-navbar" className="bg-white text-slate-900 border-b border-slate-200 shadow-xs shrink-0 sticky top-0 z-30 w-full">
      <div className="w-full px-4 h-14 flex items-center justify-between gap-3">
        {/* Brand - Far Left */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-700 text-indigo-300 border border-indigo-500/30 flex items-center justify-center font-bold text-sm shadow-xs relative overflow-hidden group">
              <ScanEye className="w-4 h-4 text-indigo-200" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-slate-900">
                SpyWright
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-300">
                BETA
              </span>
            </div>
          </div>

          {/* Preset Selector Dropdown */}
          <div className="relative">
            <button
              id="btn-presets-menu"
              type="button"
              onClick={() => setPresetDropdownOpen(!presetDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-md transition-colors shadow-2xs"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span className="font-semibold">Demo Apps</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {presetDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-72 bg-white border border-slate-200 rounded-lg shadow-xl py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 border-b border-slate-100 uppercase tracking-wider">
                  Test Applications & Environments
                </div>
                {DEMO_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      onSelectPreset(preset);
                      setInputUrl(preset.url);
                      setPresetDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex flex-col gap-0.5 hover:bg-indigo-50/70 transition-colors ${
                      activePresetId === preset.id ? 'bg-indigo-50 text-indigo-700 border-l-2 border-indigo-600 font-medium' : 'text-slate-700'
                    }`}
                  >
                    <div className="font-semibold flex items-center justify-between">
                      <span>{preset.name}</span>
                      {activePresetId === preset.id && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                    </div>
                    <span className="text-[11px] text-slate-500 line-clamp-1">{preset.description}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* URL Input Form - Expanded Flexible Width */}
        <form onSubmit={handleSubmit} className="flex-1 min-w-[320px] flex items-center gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
              <Globe className="w-3.5 h-3.5" />
            </div>
            <input
              id="url-input-field"
              type="text"
              value={inputUrl}
              onChange={(e) => {
                setInputUrl(e.target.value);
                onUrlChange(e.target.value);
              }}
              placeholder="Enter web application URL to spy (e.g., https://app.e-commerce-pro.com/dashboard)..."
              className="w-full pl-8 pr-28 py-1.5 text-xs bg-slate-50 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent rounded-md text-slate-900 placeholder-slate-400 font-mono transition-all"
            />
            <button
              id="btn-fetch-url"
              type="submit"
              disabled={isLoading || !inputUrl.trim()}
              className="absolute right-1 top-1 bottom-1 px-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded text-[11px] font-bold tracking-wide uppercase flex items-center gap-1 transition-all shadow-2xs"
            >
              {isLoading ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <span>Fetch Page</span>
              )}
            </button>
          </div>
        </form>

        {/* Action Controls & Single Browser Selector - Right Aligned */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Object Spy Toggle Button */}
          <button
            id="btn-toggle-object-spy"
            type="button"
            onClick={onToggleSpy}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border transition-all ${
              spyActive
                ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
            title="Toggle Live Object Spy Mode on the page (Hover to inspect, click to select)"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>{spyActive ? 'Spying Active' : 'Object Spy'}</span>
          </button>

          {/* Test Recorder Toggle Button */}
          <button
            id="btn-toggle-test-recorder"
            type="button"
            onClick={onToggleRecording}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md border transition-all ${
              recordingActive
                ? 'bg-rose-600 text-white border-rose-700 shadow-xs animate-pulse'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
            title="Record clicks and inputs into automated test spec"
          >
            <CircleDot className="w-3.5 h-3.5 text-rose-500" />
            <span>Record</span>
            {recordedActionsCount > 0 && (
              <span className="px-1.5 py-0.2 bg-slate-900 text-white text-[10px] rounded-full font-bold">
                {recordedActionsCount}
              </span>
            )}
          </button>

          {/* Single Authoritative Browser Selector */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium shadow-2xs transition-colors ${
              browserType === 'firefox'
                ? 'bg-amber-50/80 border-amber-300 text-amber-900'
                : browserType === 'webkit'
                ? 'bg-sky-50/80 border-sky-300 text-sky-900'
                : 'bg-indigo-50/80 border-indigo-300 text-indigo-900'
            }`}
            title="Select target browser engine for tests"
          >
            {getBrowserIcon()}
            <select
              id="navbar-browser-select"
              value={browserType}
              onChange={(e) => onBrowserTypeChange(e.target.value as BrowserType)}
              className="bg-transparent font-bold outline-none cursor-pointer text-xs pr-1"
            >
              <option value="chromium">Chromium</option>
              <option value="firefox">Firefox</option>
              <option value="webkit">WebKit</option>
            </select>
          </div>

          {/* Language Toggle (TS / JS) */}
          <div className="flex items-center bg-slate-100 border border-slate-300 rounded-md p-0.5">
            <button
              id="btn-lang-ts"
              type="button"
              onClick={() => onLanguageChange('typescript')}
              className={`px-2 py-1 text-[11px] font-bold rounded transition-colors ${
                language === 'typescript'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              TS
            </button>
            <button
              id="btn-lang-js"
              type="button"
              onClick={() => onLanguageChange('javascript')}
              className={`px-2 py-1 text-[11px] font-bold rounded transition-colors ${
                language === 'javascript'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              JS
            </button>
          </div>

          {/* Code Generator & Export Modal Button */}
          <button
            id="btn-open-code-generator"
            type="button"
            onClick={onOpenCodeModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow-xs transition-colors"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Generate Code</span>
          </button>

          {/* AI Advisor Button */}
          <button
            id="btn-open-ai-pom"
            type="button"
            onClick={onOpenAiModal}
            className="p-1.5 text-xs font-medium rounded-md bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-colors"
            title="AI Page Object Model (POM) & Scenario Architect"
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
          </button>

          {/* LinkedIn & CV Showcase Kit Button */}
          {onOpenShowcaseModal && (
            <button
              id="btn-open-showcase-modal"
              type="button"
              onClick={onOpenShowcaseModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md bg-gradient-to-r from-amber-50 to-indigo-50 hover:from-amber-100 hover:to-indigo-100 text-indigo-900 border border-indigo-200 shadow-2xs transition-colors cursor-pointer"
              title="Showcase Kit: LinkedIn Posts, CV Bullets & Live App Link"
            >
              <Share2 className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden lg:inline">LinkedIn &amp; CV</span>
            </button>
          )}

          {/* Legal & Compliance Notice Button */}
          {onOpenLegalModal && (
            <button
              id="btn-open-legal-modal"
              type="button"
              onClick={onOpenLegalModal}
              className="p-1.5 text-xs font-medium rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-300 transition-colors"
              title="Legal Notice, Disclaimers, & Compliance"
            >
              <Scale className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

