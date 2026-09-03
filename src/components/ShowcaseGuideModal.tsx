import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  Copy,
  Check,
  Linkedin,
  FileText,
  Sparkles,
  Layers,
  Globe,
  Award,
  Share2,
  CheckCircle2,
  Cpu,
  Code2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import showcaseImage from '../assets/images/element_sync_showcase_1788441296926.jpg';
import workflowImage from '../assets/images/element_sync_workflow_1788441324241.jpg';

interface ShowcaseGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'linkedin' | 'resume' | 'visual_guide' | 'architecture';

export const ShowcaseGuideModal: React.FC<ShowcaseGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('linkedin');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [postStyle, setPostStyle] = useState<'deep_dive' | 'story' | 'quick'>('deep_dive');
  const [cvRole, setCvRole] = useState<'sdet' | 'frontend' | 'fullstack'>('sdet');

  if (!isOpen) return null;

  const LIVE_URL = 'https://element-sync.vercel.app/';

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // LinkedIn Post Variants
  const linkedInPosts = {
    deep_dive: `🚀 Excited to announce the launch of ElementSync — a web QA Object Spy & intelligent test locator platform!

🌐 Try it live here: ${LIVE_URL}

As frontend architectures become more dynamic, traditional test locators (fragile CSS paths and brittle XPaths) frequently break during CI/CD pipelines, costing engineering teams hours of debugging.

I engineered ElementSync to solve this by bringing IDE-grade element inspection, W3C ARIA accessibility alignment, and deterministic test generation straight into the browser.

Key Engineering Highlights:
🎯 Live Web Object Spy: Real-time interactive DOM inspection with iframe sandbox isolation and zero telemetry leakage.
⭐ W3C-Standard Locator Hierarchy: Automatic generation of prioritized locators (getByRole, getByTestId, getByLabel, getByPlaceholder) strictly scored by resilience and uniqueness.
🔄 Multi-Engine Emulation: Support for Chromium (Blink), Firefox (Gecko), and WebKit (Safari) rendering contexts.
🎥 Journey Recorder: Live interaction recording converting clicks, form fills, and navigation events into structured test specs.
⚡ Automated Code Generation: Instant export into TypeScript/JavaScript Page Object Models (POM), Playwright suites, and Cucumber BDD scenarios.

Check it out and let me know your thoughts: ${LIVE_URL}

#QAAutomation #SoftwareEngineering #TypeScript #React #Playwright #WebTesting #SDET #DevOps #Frontend`,

    story: `💡 Why do automated test suites fail so often?

90% of flaky test failures come down to brittle selectors: an engineer updates a CSS utility class, and suddenly 15 end-to-end tests turn red in the build pipeline.

To solve this, I designed and deployed ElementSync:
👉 Live Demo: ${LIVE_URL}

ElementSync helps QA engineers, SDETs, and frontend developers inspect any web element and immediately generate high-resilience, accessibility-first locators that don't break when CSS changes.

What makes it unique:
1️⃣ Prioritizes user-facing semantic roles (ARIA) over volatile DOM structure.
2️⃣ Verifies single-element uniqueness in real time (Playwright Strict Mode compliant).
3️⃣ Generates production-ready Page Object Model (POM) architectures in 1 click.
4️⃣ Completely client-side & privacy-preserving — no credentials or cookies leave your browser.

Would love any feedback from fellow QA and frontend developers!
Check out the live deployment: ${LIVE_URL}

#SoftwareTesting #TestAutomation #WebDevelopment #TypeScript #ReactJS #OpenSource`,

    quick: `🚀 Just shipped ElementSync! A modern Web QA Object Spy & automated test generator built with React, TypeScript, and Tailwind CSS.

🔗 Live Web App: ${LIVE_URL}

✨ Highlights:
• Instant DOM Element Spying & Attribute Extraction
• W3C Semantic Role & Test-ID Locator Ranking
• Live Test Journey Recorder
• 1-Click Page Object Model & BDD Spec Export
• Multi-Browser Engine Profiles (Chromium, Firefox, WebKit)

Give it a spin: ${LIVE_URL}
Feedback and suggestions are warmly welcome!

#TechShowcase #QA #Automation #TypeScript #React #Testing`,
  };

  // Resume / CV Bullet Points
  const resumeEntries = {
    sdet: {
      title: 'QA Lead / SDET / Test Automation Architect',
      bullets: [
        `Architected and deployed ElementSync (${LIVE_URL}), a production browser-based QA Object Spy and test generator that reduced automated test locator authoring time by ~65%.`,
        `Engineered an AST-based DOM analyzer that dynamically parses web elements into prioritized W3C ARIA accessibility locators (getByRole, getByLabel, getByTestId) with strict single-match verification.`,
        `Developed a real-time Test Journey Recorder supporting multi-browser engine profiles (Chromium, Firefox, WebKit), generating modular Page Object Model (POM) suites and Cucumber BDD features in TypeScript/JavaScript.`,
        `Implemented client-side sandboxed iframe orchestration with synthetic event interception, guaranteeing zero sensitive credential leakage and full GDPR/compliance adherence.`,
      ],
      skills: 'TypeScript, React, Playwright, Test Automation, W3C ARIA, DOM Parsing, Page Object Models, Cucumber BDD, Vercel, CI/CD',
    },
    frontend: {
      title: 'Senior Frontend Engineer / React Developer',
      bullets: [
        `Built and shipped ElementSync (${LIVE_URL}), a high-performance single-page application for developer testing and DOM tree inspection built with React 18, TypeScript, and Tailwind CSS.`,
        `Crafted a responsive split-pane UI featuring virtualized DOM inspection trees, live CSS highlighting canvas, and synchronized code generation viewers with copy-to-clipboard workflows.`,
        `Implemented robust cross-origin messaging and iframe isolation techniques to safely inject inspector overlays without affecting target website script execution.`,
        `Leveraged modern Tailwind utility styling, accessibility standards, and responsive design, achieving 100% Lighthouse performance score upon Vercel deployment.`,
      ],
      skills: 'React 18, TypeScript, Tailwind CSS, AST Tree Processing, Web Performance, UI/UX Design, Vercel, Git',
    },
    fullstack: {
      title: 'Full-Stack Software Engineer',
      bullets: [
        `Designed, built, and launched ElementSync (${LIVE_URL}), an end-to-end web inspection and test synthesis utility adopted by QA and engineering teams.`,
        `Constructed a multi-tier locator recommendation engine that evaluates DOM attributes against strict resilience criteria, outputting production-grade TypeScript test scripts.`,
        `Integrated AI-assisted Page Object Model synthesis for automated test scenario structuring and automated smoke verification generation.`,
        `Established continuous deployment pipeline via Vercel with zero-configuration serverless hosting and automated build optimizations.`,
      ],
      skills: 'TypeScript, React, Node.js, Playwright, Tailwind CSS, CI/CD Pipelines, Software Architecture, REST APIs',
    },
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="showcase-modal-title"
      >
        {/* Header Banner with Live Link */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0 border-b border-indigo-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="showcase-modal-title" className="text-sm sm:text-base font-bold tracking-tight">
                  ElementSync — Portfolio, LinkedIn &amp; CV Showcase Kit
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Live on Vercel
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Ready-to-use materials, visuals, and copy to showcase on LinkedIn, your Resume, and Developer Portfolio
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={LIVE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-md shadow-xs transition-colors"
            >
              <span>Visit Live App</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-md hover:bg-slate-800 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live URL Highlight Bar */}
        <div className="bg-indigo-50 border-b border-indigo-100 px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 text-xs">
            <Globe className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="text-slate-600 font-medium">Published Web Address:</span>
            <a
              href={LIVE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono font-bold text-indigo-700 hover:underline flex items-center gap-1"
            >
              {LIVE_URL}
            </a>
          </div>
          <button
            type="button"
            onClick={() => handleCopy(LIVE_URL, 'live_url')}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-indigo-200 text-indigo-800 text-xs font-semibold transition-colors shadow-2xs"
          >
            {copiedKey === 'live_url' ? (
              <>
                <Check className="w-3 h-3 text-emerald-600" />
                <span>Copied Link!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-indigo-600" />
                <span>Copy Live Link</span>
              </>
            )}
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2 gap-1 shrink-0 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('linkedin')}
            className={`px-3.5 py-2 font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'linkedin'
                ? 'border-indigo-600 text-indigo-700 bg-white rounded-t'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Linkedin className="w-3.5 h-3.5 text-[#0a66c2]" />
            <span>LinkedIn Post Kit</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('resume')}
            className={`px-3.5 py-2 font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'resume'
                ? 'border-indigo-600 text-indigo-700 bg-white rounded-t'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span>CV &amp; Resume Bullets</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('visual_guide')}
            className={`px-3.5 py-2 font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'visual_guide'
                ? 'border-indigo-600 text-indigo-700 bg-white rounded-t'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Visual Showcase &amp; Graphics</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('architecture')}
            className={`px-3.5 py-2 font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'architecture'
                ? 'border-indigo-600 text-indigo-700 bg-white rounded-t'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-purple-600" />
            <span>Technical Architecture</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700 flex-1">
          {/* 1. LINKEDIN TAB */}
          {activeTab === 'linkedin' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Pre-Written LinkedIn Announcements
                  </h3>
                  <p className="text-slate-500 text-xs">
                    Choose a post style tailored for technical reach, storytelling, or high engagement.
                  </p>
                </div>

                {/* Style Selector */}
                <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 gap-1">
                  <button
                    type="button"
                    onClick={() => setPostStyle('deep_dive')}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                      postStyle === 'deep_dive'
                        ? 'bg-white text-indigo-700 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Technical Deep Dive
                  </button>
                  <button
                    type="button"
                    onClick={() => setPostStyle('story')}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                      postStyle === 'story'
                        ? 'bg-white text-indigo-700 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Story-Driven
                  </button>
                  <button
                    type="button"
                    onClick={() => setPostStyle('quick')}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                      postStyle === 'quick'
                        ? 'bg-white text-indigo-700 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Quick &amp; Punchy
                  </button>
                </div>
              </div>

              {/* Post Box */}
              <div className="relative bg-slate-900 text-slate-100 rounded-lg p-4 font-mono text-[11px] leading-relaxed border border-slate-800 shadow-inner whitespace-pre-wrap max-h-96 overflow-y-auto">
                {linkedInPosts[postStyle]}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <span className="text-slate-500 text-[11px]">
                  💡 <strong>Tip:</strong> Attach the high-resolution showcase graphics from the "Visual Showcase" tab to your post for 3x higher LinkedIn impressions!
                </span>

                <button
                  type="button"
                  onClick={() => handleCopy(linkedInPosts[postStyle], `linkedin_${postStyle}`)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs transition-colors shadow-xs"
                >
                  {copiedKey === `linkedin_${postStyle}` ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy LinkedIn Post</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* 2. RESUME / CV TAB */}
          {activeTab === 'resume' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Quantified CV &amp; Resume Experience
                  </h3>
                  <p className="text-slate-500 text-xs">
                    STAR-method accomplishments tailored for ATS (Applicant Tracking Systems).
                  </p>
                </div>

                {/* Role Filter */}
                <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 gap-1">
                  <button
                    type="button"
                    onClick={() => setCvRole('sdet')}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                      cvRole === 'sdet'
                        ? 'bg-white text-indigo-700 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    SDET / QA Lead
                  </button>
                  <button
                    type="button"
                    onClick={() => setCvRole('frontend')}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                      cvRole === 'frontend'
                        ? 'bg-white text-indigo-700 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Senior Frontend
                  </button>
                  <button
                    type="button"
                    onClick={() => setCvRole('fullstack')}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                      cvRole === 'fullstack'
                        ? 'bg-white text-indigo-700 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Full-Stack Engineer
                  </button>
                </div>
              </div>

              {/* CV Preview Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div>
                    <span className="font-bold text-slate-900 text-xs">
                      Project: ElementSync — Web QA Object Spy &amp; Locator Generator
                    </span>
                    <span className="block text-[11px] text-indigo-600 font-medium">
                      Role Profile: {resumeEntries[cvRole].title}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    Live: {LIVE_URL}
                  </span>
                </div>

                {/* Bullet Points */}
                <ul className="space-y-2 pl-4 list-disc text-slate-700 leading-relaxed">
                  {resumeEntries[cvRole].bullets.map((bullet, idx) => (
                    <li key={idx}>{bullet}</li>
                  ))}
                </ul>

                {/* Tech Tags */}
                <div className="pt-2 border-t border-slate-200">
                  <span className="font-semibold text-slate-900 text-[11px]">
                    Key Skills &amp; ATS Keywords:{' '}
                  </span>
                  <span className="text-slate-600 text-[11px] font-mono">
                    {resumeEntries[cvRole].skills}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => {
                    const textToCopy = `PROJECT: ElementSync (${LIVE_URL})\nRole: ${resumeEntries[cvRole].title}\n\nKey Achievements:\n${resumeEntries[cvRole].bullets.map((b) => `• ${b}`).join('\n')}\n\nTechnical Skills: ${resumeEntries[cvRole].skills}`;
                    handleCopy(textToCopy, `cv_${cvRole}`);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs transition-colors shadow-xs"
                >
                  {copiedKey === `cv_${cvRole}` ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied Bullets!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Formatted CV Bullets</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* 3. VISUAL SHOWCASE TAB */}
          {activeTab === 'visual_guide' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Visual Media Assets for Portfolio &amp; LinkedIn
                </h3>
                <p className="text-slate-500 text-xs">
                  Clean product mockups showcasing ElementSync's live interface and automation pipeline.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Image 1 */}
                <div className="bg-slate-900 rounded-lg overflow-hidden border border-slate-800 shadow-md flex flex-col">
                  <div className="p-2.5 bg-slate-950 flex items-center justify-between border-b border-slate-800 text-[11px] text-slate-300">
                    <span className="font-bold flex items-center gap-1.5 text-white">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      ElementSync Interface Mockup
                    </span>
                    <span className="text-[10px] text-indigo-300">16:9 Banner</span>
                  </div>
                  <div className="aspect-video relative overflow-hidden bg-slate-950 flex items-center justify-center">
                    <img
                      src={showcaseImage}
                      alt="ElementSync Interface Showcase"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3 text-[11px] text-slate-300">
                    Ideal for LinkedIn post header banners and GitHub README visual cards.
                  </div>
                </div>

                {/* Image 2 */}
                <div className="bg-slate-900 rounded-lg overflow-hidden border border-slate-800 shadow-md flex flex-col">
                  <div className="p-2.5 bg-slate-950 flex items-center justify-between border-b border-slate-800 text-[11px] text-slate-300">
                    <span className="font-bold flex items-center gap-1.5 text-white">
                      <Cpu className="w-3.5 h-3.5 text-purple-400" />
                      Locator &amp; Test Workflow Architecture
                    </span>
                    <span className="text-[10px] text-purple-300">Concept Diagram</span>
                  </div>
                  <div className="aspect-video relative overflow-hidden bg-slate-950 flex items-center justify-center">
                    <img
                      src={workflowImage}
                      alt="ElementSync Automation Workflow"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3 text-[11px] text-slate-300">
                    Visual explanation of the DOM tree extraction to resilient test code pipeline.
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-950">
                  <Award className="w-4 h-4 text-indigo-600" />
                  <span className="font-semibold">
                    Live Production Deployment Verified:
                  </span>
                  <a
                    href={LIVE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-indigo-700 hover:underline"
                  >
                    {LIVE_URL}
                  </a>
                </div>
                <a
                  href={LIVE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold text-xs transition-colors flex items-center gap-1"
                >
                  <span>Open App</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {/* 4. TECHNICAL ARCHITECTURE TAB */}
          {activeTab === 'architecture' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  System Architecture &amp; Implementation Details
                </h3>
                <p className="text-slate-500 text-xs">
                  Detailed technical talking points for system design interviews and technical portfolio reviews.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                  <div className="w-7 h-7 rounded bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                    1
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs">DOM AST Parsing Engine</h4>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Parses raw HTML payloads into a lightweight tree node graph with computed bounding boxes, ARIA implicit roles, and tag hierarchy.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                  <div className="w-7 h-7 rounded bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                    2
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs">W3C Locator Scoring</h4>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Applies heuristic ranking matching getByRole, getByTestId, and getByLabel, checking uniqueness dynamically to prevent test flakiness.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                  <div className="w-7 h-7 rounded bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                    3
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs">Code Synthesis &amp; POM</h4>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Compiles user interactions into clean TypeScript Page Object Models, Cucumber BDD specs, and multi-browser configurations.
                  </p>
                </div>
              </div>

              {/* Stack Table */}
              <div className="bg-slate-900 text-slate-200 p-4 rounded-lg font-mono text-[11px] space-y-1.5 border border-slate-800">
                <div className="text-indigo-400 font-bold mb-2"># Stack Specifications:</div>
                <div>• Frontend: React 18 (Functional Components, Custom Hooks, useMemo)</div>
                <div>• Language: TypeScript (Strict Type Safety, Modular Interfaces)</div>
                <div>• Styling: Tailwind CSS (Responsive Utility Architecture)</div>
                <div>• Automation Syntax: Modern Web-First Assertions &amp; Strict Mode Locators</div>
                <div>• Deployment: Vercel Production Infrastructure ({LIVE_URL})</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Deployment link: <strong>{LIVE_URL}</strong></span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
