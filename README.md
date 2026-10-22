# AI Research Assistant Chrome Extension

A context-aware research assistant powered by Gemini AI. Highlight text on any webpage and ask questions in a sleek, modern side panel.

## 📋 Table of Contents
- [Overview](#-overview)
- [Main Features](#-main-features)
- [Technologies](#-technologies)
- [Project Structure](#-project-structure)
- [Local Setup](#-local-setup)
- [How to Use](#-how-to-use)
- [Deployment & Docker](#-deployment--docker)
- [Development Guidelines](#-development-guidelines)

## 🌟 Overview
Chrome extensions are a powerful way to enhance user workflows. This tool leverages the latest Gemini 2.0 models to provide instant, context-aware assistance based on what the user is currently viewing.

## ✨ Main Features
- **Context Extraction:** Automatically extracts page text to provide relevant answers.
- **Selection Analysis:** Highlight text and ask the AI to summarize, explain, or translate it.
- **Side Panel Interface:** A dedicated, persistent chat window for research.
- **History Tracking:** Saves your chat history locally so you never lose your research.
- **Secure Key Storage:** Store your own Gemini API key locally in the browser.

## 🛠️ Technologies
- **Frontend:** TypeScript, Vite, Tailwind CSS.
- **APIs:** Chrome Extension Manifest V3 (SidePanel, Storage, Scripting).
- **AI:** Google Gemini 2.0 Flash (`@google/genai`).
- **Testing:** Vitest, JSDOM.

## 📁 Project Structure
```text
ai-research-assistant-extension/
├── src/                # Source code (TypeScript)
│   ├── services/       # AI services
│   ├── background.ts   # Extension background script
│   ├── content-script.ts # Page context extraction
│   └── sidepanel.ts    # Main UI logic
├── sidepanel.html      # Main UI template
├── manifest.json       # Extension manifest
├── vite.config.ts      # Build configuration
└── package.json        # Dependencies
```

## 🚀 Local Setup

### 1. Installation
```bash
npm install
```

### 2. Build the Extension
```bash
npm run build
```

### 3. Load in Chrome
1. Open Chrome and go to `chrome://extensions/`.
2. Enable **Developer mode** (top right).
3. Click **Load unpacked**.
4. Select the `dist` folder generated in the project root.

## 💡 How to Use
1. Open the side panel by clicking the extension icon.
2. Enter your Gemini API key in the settings (gear icon).
3. Highlight any text on a page to see it appear in the "Selected Text" preview.
4. Ask a question or click the send icon to analyze the selection.

## 🚢 Deployment & Docker

### Build with Docker
You can build the extension artifacts using Docker to ensure a consistent environment:

```bash
docker compose up build-extension
```

The artifacts will be available in the `dist/` folder.

### Deployment
This project is a browser extension. Deployment involves:
1. Running `npm run build`.
2. Zipping the `dist/` folder.
3. Uploading to the **Chrome Web Store Developer Dashboard**.

## 🛠️ Development Guidelines
- Use **Vite** for fast bundling.
- Ensure all new logic is covered by unit tests in `src/*.spec.ts`.
- Follow Manifest V3 security standards (no remote scripts).

---

## 🛠️ Project Deep Dive & Technical Guide

### 🎯 Main Purpose
AI Research Assistant Chrome browser extension for on-page text summarizing, explaining, and real-time contextual information retrieval.

### 🧰 Tecnologias Utilizadas (Tech Stack)
- **Primary Technologies:** TypeScript, Vite, Tailwind CSS, Chrome Extension Manifest V3, Node.js / npm
- **Deployment Strategy:** Bundled browser extension package zipped for upload to the Chrome Web Store.

### 🚀 Como Implantar e Executar (How to Deploy & Run)
#### Development Setup
1. Run `npm install` to install local developer packages.
2. Build the output: `npm run build`.
3. Go to `chrome://extensions/` in Google Chrome, enable Developer Mode, click **Load unpacked**, and select the generated `dist` directory.

---
