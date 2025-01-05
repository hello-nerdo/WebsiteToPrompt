# WebsiteToPrompt

A Chrome extension that lets you select HTML elements on a webpage (via a simple inspect-like tool) and compile them into a single XML prompt, ready for copy/paste into LLMs or other tools.

## Installation

1. Clone or download this repository.
2. Visit `chrome://extensions/` in Google Chrome (or any Chromium-based browser).
3. Toggle on Developer Mode.
4. Click "Load unpacked" and select this `WebsiteToPrompt` folder.
5. Pin the extension icon if desired.

## How to Use

1. Click the extension icon to open the popup.
2. Toggle "Inspect Mode" and hover/click on elements in the current tab.
3. Selected elements will be saved internally. Click "Generate XML" in the popup to see the collected elements in an XML snippet.
4. Copy and paste the snippet wherever you need it.

## References

- Compare with [CodebaseToPrompt](../CodebaseToPrompt/) for additional ideas on storing tree structures, advanced parsing, or UI design.
