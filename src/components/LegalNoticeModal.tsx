import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  Scale,
  FileText,
  Lock,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface LegalNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'trademarks' | 'acceptable_use' | 'privacy' | 'ai_disclaimer' | 'license';

export const LegalNoticeModal: React.FC<LegalNoticeModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('trademarks');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-modal-title"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h2 id="legal-modal-title" className="text-sm font-bold tracking-tight">
                Legal Notice & Compliance Center
              </h2>
              <p className="text-[11px] text-slate-400">
                Disclaimers, trademark policies, acceptable use terms, and data privacy
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
            aria-label="Close legal modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-1 shrink-0 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('trademarks')}
            className={`px-3 py-2 font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'trademarks'
                ? 'border-indigo-600 text-indigo-700 bg-white rounded-t'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Trademark Fair Use</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('acceptable_use')}
            className={`px-3 py-2 font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'acceptable_use'
                ? 'border-indigo-600 text-indigo-700 bg-white rounded-t'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Authorized Testing Policy</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`px-3 py-2 font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'privacy'
                ? 'border-indigo-600 text-indigo-700 bg-white rounded-t'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Data Privacy</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ai_disclaimer')}
            className={`px-3 py-2 font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'ai_disclaimer'
                ? 'border-indigo-600 text-indigo-700 bg-white rounded-t'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Code Disclaimer</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('license')}
            className={`px-3 py-2 font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'license'
                ? 'border-indigo-600 text-indigo-700 bg-white rounded-t'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Open Source License</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 leading-relaxed flex-1">
          {activeTab === 'trademarks' && (
            <div className="space-y-3">
              <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-950 font-medium">
                <strong>Trademark Fair Use & Non-Affiliation Declaration:</strong>
                <p className="mt-1 text-indigo-900 text-xs">
                  SpyWright is an independent open-source project and is not affiliated with, sponsored by, or endorsed by Microsoft Corporation. Playwright is a trademark of Microsoft Corporation.
                </p>
              </div>

              <h3 className="font-bold text-slate-900 text-sm">Nominative Fair Use</h3>
              <p>
                All references to "Playwright", "Chromium", "Firefox", "WebKit", and related technologies in this application are used solely for descriptive, comparative, and compatibility purposes (nominative fair use) to inform developers about code generation compatibility.
              </p>
              <p>
                SpyWright does not claim any ownership of the Playwright trademark, logo, or associated Microsoft brand assets. SpyWright uses its own distinct branding, iconography, and codebase.
              </p>
            </div>
          )}

          {activeTab === 'acceptable_use' && (
            <div className="space-y-3">
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-950 font-medium">
                <strong>Authorized Testing & Security Notice:</strong>
                <p className="mt-1 text-amber-900 text-xs">
                  Users may only test and inspect web applications and URLs that they own or have explicit authorization to inspect and automate.
                </p>
              </div>

              <h3 className="font-bold text-slate-900 text-sm">Acceptable Use Terms</h3>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong>Authorization Requirement:</strong> Do not use this tool to inspect, scrape, or automate against systems without proper authorization from the site operator.
                </li>
                <li>
                  <strong>Terms of Service Compliance:</strong> Users are responsible for ensuring that their automated tests comply with the Terms of Service and robots.txt policies of the target domains.
                </li>
                <li>
                  <strong>No Denial of Service:</strong> Do not use automated recording or testing features to flood or disrupt third-party websites or services.
                </li>
              </ul>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-3">
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-950 font-medium flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <strong>Local Client-Side Processing:</strong>
                  <p className="mt-0.5 text-emerald-900 text-xs">
                    Your session data, inspected DOM trees, and recorded test scripts are processed locally in your browser memory.
                  </p>
                </div>
              </div>

              <h3 className="font-bold text-slate-900 text-sm">Privacy & Security Guarantees</h3>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong>No Credential Harvesting:</strong> SpyWright does not capture, store, or transmit user credentials, session cookies, auth tokens, or payment card details to external analytics servers.
                </li>
                <li>
                  <strong>Demo Sandbox Safety:</strong> The pre-built demo presets (E-Commerce, Banking, Dashboard) use local synthetic mock data for safe testing.
                </li>
                <li>
                  <strong>Data Minimization:</strong> When using the AI POM Architect, only the selected structural element metadata is submitted for code synthesis.
                </li>
              </ul>
            </div>
          )}

          {activeTab === 'ai_disclaimer' && (
            <div className="space-y-3">
              <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-lg text-purple-950 font-medium">
                <strong>AI Code Generation Advisory:</strong>
                <p className="mt-1 text-purple-900 text-xs">
                  AI-synthesized Page Object Models and test scenarios are provided as assistive recommendations. Always review code before executing in production environments.
                </p>
              </div>

              <h3 className="font-bold text-slate-900 text-sm">Code Validation & Liability</h3>
              <p>
                Automated test scripts generated by the AI assistant are intended to accelerate QA scripting. The user is responsible for reviewing assertions, test-ids, and execution logic to ensure compatibility with their CI/CD security and execution guidelines.
              </p>
            </div>
          )}

          {activeTab === 'license' && (
            <div className="space-y-3">
              <h3 className="font-bold text-slate-900 text-sm">MIT Open Source License</h3>
              <div className="bg-slate-100 p-3 rounded font-mono text-[11px] text-slate-800 border border-slate-300 leading-relaxed">
                THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500">
            SpyWright &copy; {new Date().getFullYear()} Independent Community Project
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
          >
            I Understand & Close
          </button>
        </div>
      </div>
    </div>
  );
};
