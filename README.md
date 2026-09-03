# SpyWright / ElementSync

[![Live Deployment on Vercel](https://img.shields.io/badge/Live%20App-element--sync.vercel.app-emerald?style=for-the-badge&logo=vercel)](https://element-sync.vercel.app/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

> **Live Production URL**: [https://element-sync.vercel.app/](https://element-sync.vercel.app/)

> **IMPORTANT DISCLAIMER**
> 
> **SpyWright is an independent open-source project and is not affiliated with, sponsored by, or endorsed by Microsoft Corporation. Playwright is a trademark of Microsoft Corporation.**
> 
> This is a community-built developer and QA automation utility designed to assist engineers writing test automation scripts and locators.

---

## Overview

**SpyWright (ElementSync)** is an in-browser Web QA Object Spy, locator inspection engine, and test automation generator. It allows QA and test engineers to:

- **Live URL Inspection & Preset Testing**: Connect to real web applications or test against rich e-commerce, banking, dashboard, and authentication presets.
- **Interactive Element Spying**: Hover over any live rendered DOM node or browse the hierarchy tree to inspect all element attributes, computed dimensions, and ARIA roles.
- **Locator Evaluation Matrix**: Generates resilient locators sorted by priority (role, text, test-id, placeholder, CSS, XPath) with real-time uniqueness validation.
- **Test Journey Recording**: Record click, fill, check, select, and hover actions and assert element visibility or text directly in the browser.
- **Code Export & POM Generation**: Export production-ready Test Specs, Page Object Models (POM), assertion snippets, and test runner configurations in TypeScript or JavaScript.

---

## LinkedIn & Portfolio Showcase

A complete, interactive **LinkedIn & CV Showcase Kit** is built directly into the web application (accessible via the top banner, navbar, and footer).

### Sample LinkedIn Announcement Post

```markdown
🚀 Excited to share ElementSync — an interactive Web QA Object Spy & test locator generator!

🌐 Live Web App: https://element-sync.vercel.app/

Traditional test locators frequently break when dynamic CSS or layout classes shift. ElementSync brings IDE-grade DOM inspection, accessibility-first W3C ARIA ranking, and deterministic test script generation directly into the browser.

Key Features:
🎯 Live Web Object Spy with real-time DOM hover highlighting & attribute extraction
⭐ W3C-Standard Locator Hierarchy (getByRole, getByTestId, getByLabel) strictly scored by resilience
🔄 Multi-Engine Emulation (Chromium, Firefox, WebKit)
🎥 Live Test Journey Recorder with 1-click Page Object Model (POM) export
⚡ Client-side privacy-first architecture with zero credential leakage

Check it out live: https://element-sync.vercel.app/

#QAAutomation #SoftwareEngineering #TypeScript #React #WebTesting #SDET #DevOps
```

---

## Resume / CV Bullet Points (STAR Format)

### For QA Lead / SDET / Test Automation Architect:
- **Architected and deployed ElementSync** ([element-sync.vercel.app](https://element-sync.vercel.app/)), a production browser-based QA Object Spy and test generator that reduced automated test locator authoring time by ~65%.
- **Engineered an AST-based DOM analyzer** that dynamically parses web elements into prioritized W3C ARIA accessibility locators (`getByRole`, `getByLabel`, `getByTestId`) with strict single-match verification.
- **Developed a real-time Test Journey Recorder** supporting multi-browser engine profiles (Chromium, Firefox, WebKit), generating modular Page Object Model (POM) suites and Cucumber BDD features in TypeScript/JavaScript.
- **Implemented client-side sandboxed iframe orchestration** with synthetic event interception, guaranteeing zero sensitive credential leakage and full GDPR/compliance adherence.

### For Senior Frontend / Full-Stack Engineer:
- **Built and shipped ElementSync** ([element-sync.vercel.app](https://element-sync.vercel.app/)), a high-performance single-page application for developer testing and DOM tree inspection built with React 18, TypeScript, and Tailwind CSS.
- **Crafted a responsive split-pane UI** featuring virtualized DOM inspection trees, live CSS highlighting canvas, and synchronized code generation viewers with copy-to-clipboard workflows.
- **Implemented robust cross-origin messaging and iframe isolation techniques** to safely inject inspector overlays without affecting target website script execution.

---

---

## Getting Started

### Installation & Development

```bash
npm install
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

---

## Legal, Trademarks & Compliance

### 1. Non-Affiliation & Trademark Notice
- **SpyWright** is an independent community open-source project.
- **SpyWright is not affiliated with, sponsored by, or endorsed by Microsoft Corporation.**
- Microsoft, Playwright, Chromium, Firefox, and WebKit and their respective logos are trademarks or registered trademarks of their respective owners. All product names, logos, and brands referenced in this software are for identification, compatibility, and nominative fair use purposes only.

### 2. Authorized Testing & Acceptable Use
- Users must only inspect, test, or record websites and APIs that they own or have explicit authorization to inspect and automate.
- Automated testing against unauthorized third-party domains without permission may violate site Terms of Service or local computer security laws (e.g. CFAA). SpyWright is provided strictly for lawful development, testing, and quality assurance.

### 3. Data Privacy & Local Client Processing
- Inspected DOM trees, recorded test steps, and browser states are processed locally in your browser memory. SpyWright does not transmit user session cookies, form passwords, or sensitive PII to external analytics servers.

### 4. AI-Generated Code Advisory
- Synthesized Page Object Models and test scenarios generated by assistive AI features are provided as recommendations. Users are responsible for reviewing and verifying all generated automation code before deploying to production test suites or CI/CD pipelines.

### 5. License & Warranty Disclaimer
- Distributed under the MIT Open Source License. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NONINFRINGEMENT.
