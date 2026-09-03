import React, { useState } from 'react';
import {
  HelpCircle,
  X,
  Crosshair,
  FileCode,
  Layers,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface QuickStartBannerProps {
  onOpenLegalModal?: () => void;
}

export const QuickStartBanner: React.FC<QuickStartBannerProps> = ({
  onOpenLegalModal,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return (
      <div className="bg-indigo-900/90 text-indigo-100 px-4 py-1 flex items-center justify-between text-[11px] border-b border-indigo-800 shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            SpyWright Quick Guide
          </span>
          <span className="text-indigo-200">
            Learn how to inspect DOM elements, generate robust locators, and export automation code.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="text-xs font-semibold text-white underline hover:text-indigo-200 transition-colors"
          >
            Show Instructions
          </button>
          {onOpenLegalModal && (
            <button
              type="button"
              onClick={onOpenLegalModal}
              className="text-[11px] text-indigo-300 hover:text-white flex items-center gap-1 transition-colors"
            >
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              Legal &amp; Compliance
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div id="quick-start-guide" className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-indigo-900/60 px-4 py-2.5 shrink-0 shadow-xs relative transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Title and Intro */}
        <div className="flex items-start gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded-md bg-indigo-600/80 text-white flex items-center justify-center shrink-0 mt-0.5">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-tight">
                How to Use SpyWright (4 Simple Steps)
              </span>
              <span className="text-[10px] bg-indigo-800 text-indigo-200 px-1.5 py-0.2 rounded font-mono font-medium">
                Quick Guide
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Interactive Web QA Object Spy & resilient test locator generator.
            </p>
          </div>
        </div>

        {/* 4 Step Workflow Chips */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 flex-1">
          {/* Step 1 */}
          <div className="bg-white/5 border border-white/10 rounded-md px-2.5 py-1.5 flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-indigo-500/30 text-indigo-300 flex items-center justify-center text-[10px] font-bold shrink-0 font-mono">
              1
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-white block truncate">Load Page or Demo</span>
              <span className="text-[10px] text-slate-400 block truncate">Use Demo Apps dropdown or URL bar</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white/5 border border-white/10 rounded-md px-2.5 py-1.5 flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-indigo-500/30 text-indigo-300 flex items-center justify-center text-[10px] font-bold shrink-0 font-mono">
              2
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-white block truncate">Toggle Object Spy</span>
              <span className="text-[10px] text-slate-400 block truncate">Hover & click any UI element to inspect</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white/5 border border-white/10 rounded-md px-2.5 py-1.5 flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-indigo-500/30 text-indigo-300 flex items-center justify-center text-[10px] font-bold shrink-0 font-mono">
              3
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-white block truncate">Target Locators</span>
              <span className="text-[10px] text-slate-400 block truncate">Copy role, text, or test-id locators</span>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-white/5 border border-white/10 rounded-md px-2.5 py-1.5 flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-indigo-500/30 text-indigo-300 flex items-center justify-center text-[10px] font-bold shrink-0 font-mono">
              4
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-white block truncate">Export Test Code</span>
              <span className="text-[10px] text-slate-400 block truncate">Export Page Object Models & Specs</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
          {onOpenLegalModal && (
            <button
              type="button"
              onClick={onOpenLegalModal}
              className="text-[11px] text-slate-300 hover:text-white px-2 py-1 rounded hover:bg-white/10 transition-colors flex items-center gap-1"
              title="View Legal Disclaimers & Fair Use Notice"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Legal Notice</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors"
            title="Minimize guide"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
