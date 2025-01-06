console.log('WebsiteToPrompt background script running...');

// Simple in-memory store of selected elements (each contains HTML + Markdown).
let selectedElements = [];

/**
 * A naive approach to convert basic HTML to Markdown.
 * Replace this with a library like Turndown for richer conversions.
 */
function htmlToMarkdown(html) {
  return html
    // Replace <br> and <br/> with newline
    .replace(/<br\s*\/?>/gi, '\n')
    // Replace <p> and <p/> with double-newline
    .replace(/<p\s*\/?>/gi, '\n\n')
    // Remove *all* remaining HTML tags
    .replace(/<[^>]+>/g, '')
    // Normalize whitespace - collapse multiple spaces/tabs to single
    .replace(/[ \t]+/g, ' ')
    // Collapse multiple newlines to single newline
    .replace(/\n{2,}/g, '\n')
    .trim();
}

/**
 * Listen for messages from content scripts or the popup.
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'ELEMENT_SELECTED') {
    // Convert HTML to Markdown and store
    const html = request.payload.html;
    const markdown = htmlToMarkdown(html);

    selectedElements.push({
      html: html,
      markdown: markdown,
      tagName: request.payload.tagName,
      timestamp: request.payload.timestamp
    });

    // Notify the popup that elements have changed
    chrome.runtime.sendMessage({
      type: 'ELEMENTS_UPDATED',
      elements: selectedElements
    });

    // Attempt to reopen the extension popup
    // (Requires Chrome 106+ / Manifest V3)
    chrome.action.openPopup().catch(err => {
      console.warn('Could not reopen popup:', err);
    });

    sendResponse({ status: 'ok' });
  } 
  else if (request.type === 'GET_SELECTED_ELEMENTS') {
    // Return the currently stored elements
    sendResponse({ elements: selectedElements });
  } 
  else if (request.type === 'CLEAR_SELECTED_ELEMENTS') {
    selectedElements = [];
    sendResponse({ status: 'cleared' });
  }
});
