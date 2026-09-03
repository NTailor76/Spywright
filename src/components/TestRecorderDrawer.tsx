import React from 'react';
import {
  CircleDot,
  Trash2,
  Play,
  CheckCircle2,
  Copy,
  Check,
  Plus,
  ArrowRight,
  Code,
  X,
  FileCode,
} from 'lucide-react';
import { RecordedAction, SupportedLanguage } from '../types';

interface TestRecorderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  actions: RecordedAction[];
  onClearActions: () => void;
  onDeleteAction: (id: string) => void;
  onAddAssertion: (actionId: string) => void;
  onOpenCodeModal: () => void;
  language: SupportedLanguage;
}

export const TestRecorderDrawer: React.FC<TestRecorderDrawerProps> = ({
  isOpen,
  onClose,
  actions,
  onClearActions,
  onDeleteAction,
  onAddAssertion,
  onOpenCodeModal,
  language,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopyAll = () => {
    const lines = actions.map((act) => {
      switch (act.actionType) {
        case 'fill':
          return `await ${act.selectedLocator}.fill('${act.value || ''}');`;
        case 'click':
          return `await ${act.selectedLocator}.click();`;
        case 'check':
          return `await ${act.selectedLocator}.check();`;
        case 'assertVisible':
          return `await expect(${act.selectedLocator}).toBeVisible();`;
        default:
          return `await ${act.selectedLocator}.click();`;
      }
    });

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 shadow-2xl p-4 max-h-72 flex flex-col gap-3 text-slate-900 animate-in slide-in-from-bottom duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Test Journey Recorder ({actions.length} Recorded Steps)
          </h3>
          <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
            Inspecting or interacting with elements in the preview logs automated actions here
          </span>
        </div>

        <div className="flex items-center gap-2">
          {actions.length > 0 && (
            <>
              <button
                type="button"
                onClick={handleCopyAll}
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 rounded text-xs font-semibold shadow-2xs transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-500" />}
                <span>{copied ? 'Copied Steps' : 'Copy All Steps'}</span>
              </button>

              <button
                type="button"
                onClick={onOpenCodeModal}
                className="flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-bold shadow-xs transition-colors"
              >
                <FileCode className="w-3 h-3" />
                <span>Export Test Spec</span>
              </button>

              <button
                type="button"
                onClick={onClearActions}
                className="flex items-center gap-1 px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded text-xs font-semibold transition-colors"
              >
                <Trash2 className="w-3 h-3 text-rose-500" />
                <span>Clear</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Action Steps Stream */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden flex items-center gap-2 py-1">
        {actions.length === 0 ? (
          <div className="text-xs text-slate-500 italic py-3">
            No steps recorded yet. Click on any element in the live preview or select actions in the Object Spy to start building your test journey.
          </div>
        ) : (
          actions.map((act, index) => (
            <div
              key={act.id}
              className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 min-w-[260px] max-w-[320px] flex flex-col gap-1 shrink-0 text-xs shadow-2xs group relative hover:border-indigo-300 transition-colors"
            >
              <div className="flex items-center justify-between gap-1 text-[10px] text-slate-500">
                <span className="font-bold text-indigo-600">Step {index + 1}</span>
                <span className="uppercase font-mono font-bold px-1.5 py-0.2 bg-white border border-slate-200 rounded text-slate-700 shadow-2xs">
                  {act.actionType}
                </span>
              </div>

              <div className="font-mono text-[11px] text-slate-800 truncate bg-white p-1.5 rounded border border-slate-200 font-medium">
                {act.selectedLocator}
              </div>

              {act.value && (
                <div className="text-[11px] text-amber-700 font-mono truncate font-medium">
                  value: "{act.value}"
                </div>
              )}

              <button
                type="button"
                onClick={() => onDeleteAction(act.id)}
                className="absolute right-1.5 top-1.5 p-1 bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded opacity-0 group-hover:opacity-100 transition-opacity shadow-2xs"
                title="Delete this step"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
