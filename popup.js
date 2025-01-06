console.log('Popup script loaded.');

let selectionEnabled = false;

document.addEventListener('DOMContentLoaded', () => {
  const toggleSelectionBtn = document.getElementById('toggleSelectionBtn');
  const copyBtn = document.getElementById('copyBtn');
  const clearBtn = document.getElementById('clearBtn');
  const resultArea = document.getElementById('resultArea');

  // Toggle "Inspect Mode"
  toggleSelectionBtn.addEventListener('click', () => {
    selectionEnabled = !selectionEnabled;
    toggleSelectionBtn.textContent = selectionEnabled ? 'Disable Inspect Mode' : 'Enable Inspect Mode';

    // Tell the content script to enable/disable selection
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: 'TOGGLE_SELECTION_MODE',
        enabled: selectionEnabled,
      });
    });
  });

  // Copy contents of resultArea to clipboard
  copyBtn.addEventListener('click', () => {
    if (resultArea.value.trim() !== '') {
      resultArea.select();
      document.execCommand('copy');
      copyBtn.textContent = 'Copied!';
      setTimeout(() => {
        copyBtn.textContent = 'Copy';
      }, 1500);
    }
  });

  // Clear stored elements
  clearBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'CLEAR_SELECTED_ELEMENTS' }, (response) => {
      if (response.status === 'cleared') {
        resultArea.value = '';
      }
    });
  });

  // Request existing elements on load (in case we already had selections)
  chrome.runtime.sendMessage({ type: 'GET_SELECTED_ELEMENTS' }, (response) => {
    if (response && response.elements) {
      updateResultArea(response.elements);
    }
  });

  // Listen for auto-updates from background
  chrome.runtime.onMessage.addListener((request) => {
    if (request.type === 'ELEMENTS_UPDATED') {
      updateResultArea(request.elements);
    }
  });
});

/**
 * Rebuild the XML snippet whenever elements change.
 */
function updateResultArea(elements) {
  const xml = buildXML(elements);
  const resultArea = document.getElementById('resultArea');
  resultArea.value = xml;
}

/**
 * Create XML from the selected elements, embedding the *Markdown* text.
 */
function buildXML(elements) {
  let xmlOutput = '<website-elements>\n';
  elements.forEach((el, index) => {
    xmlOutput += `  <element index="${index}" tagName="${el.tagName}" time="${el.timestamp}">\n`;

    // Insert the Markdown, escaped for XML
    const safeMD = escapeXML(el.markdown);
    xmlOutput += `    ${safeMD}\n`;

    xmlOutput += '  </element>\n';
  });
  xmlOutput += '</website-elements>';
  return xmlOutput;
}

/**
 * Escape special XML characters.
 */
function escapeXML(rawStr) {
  return rawStr
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
