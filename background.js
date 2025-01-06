console.log('WebsiteToPrompt background script running...');

/**
 * This background script is minimal now, as all HTML-to-Markdown
 * transformations and data storage happen in the content script.
 * 
 * We leave it here for potential future use (e.g., if you need
 * to manage extension-level messaging or pass data across tabs).
 */

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Currently unused, but you can handle background-level messages here.
  sendResponse({ status: 'no-op' });
});
