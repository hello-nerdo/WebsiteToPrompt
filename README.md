# WebsiteToPrompt

A Chrome extension that lets you select HTML elements on a webpage (via a simple inspect-like tool) and compile them into Markdown. The extension **automatically saves** these selections as "prompts," which you can then manage, export, or delete in the new **Prompt Management Dashboard**.

## Features

1. **Selection Mode**:

   - Toggle from the extension popup or context menu.
   - Hover/click on elements in the current tab to capture them.
   - Captured elements are automatically converted to Markdown and stored.

2. **WebsiteToPrompt Dashboard**:

   - Open via popup button or context menu: "Open WebsiteToPrompt Dashboard."
   - View, search, delete, or export your saved prompts.
   - Each prompt includes a timestamp, URL, element path, HTML, and generated Markdown.

3. **Auto-Save**:
   - On each selected element, the extension auto-saves prompt data to `chrome.storage.local`.

## Installation

1. Clone or download this repository.
2. Visit `chrome://extensions/` in Google Chrome (or another Chromium-based browser).
3. Toggle on **Developer Mode**.
4. Click **"Load unpacked"** and select this `WebsiteToPrompt` folder.
5. (Optional) Pin the extension icon.

## How to Use

1. Click the extension icon to open the popup.
2. Toggle **"Selection Mode"**. Hover over the desired element in the active webpage and click it to capture.
3. The selected element is replaced in-page with a Markdown snippet. The original HTML is auto-saved in the extension’s local storage.
4. To manage your saved prompts, open the **WebsiteToPrompt Dashboard** either from the popup or the context menu ("Open WebsiteToPrompt Dashboard").
5. In the dashboard:
   - **Search** prompts by URL or text.
   - **Delete** selected prompts.
   - **Export** selected prompts in JSON format.

## Development & References

- This extension depends on [Turndown](https://github.com/domchristie/turndown) for HTML-to-Markdown conversion.
- **New**: Integrated basic [Google Analytics 4](https://analytics.google.com/) event tracking using the Measurement Protocol.
- Compare with other prompt generation or data-collection techniques for advanced usage.
