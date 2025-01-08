console.log('WebsiteToPrompt background script running...');

// Track whether Inspect Mode is enabled
let inspectModeEnabled = false;

// Create the context menus when the extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  // 1) Inspect Mode menu
  chrome.contextMenus.create({
    id: 'toggleInspectMode',
    title: 'Inspect Mode',
    contexts: ['all'],
  });

  // 2) New menu item: Open the Prompt Dashboard
  chrome.contextMenus.create({
    id: 'openDashboard',
    title: 'Open Prompt Dashboard',
    contexts: ['all'],
  });
});

// Helper to update the context menu title based on current state
function updateContextMenuTitle() {
  const newTitle = 'Inspect Mode';
  chrome.contextMenus.update('toggleInspectMode', { title: newTitle });
}

// Toggle Inspect Mode and notify content script + popup
function toggleInspectMode(tabId, newState) {
  inspectModeEnabled = newState;
  updateContextMenuTitle();

  // Notify the content script in the current tab (if available)
  if (tabId !== undefined) {
    chrome.tabs.sendMessage(tabId, {
      type: 'TOGGLE_SELECTION_MODE',
      enabled: inspectModeEnabled,
    });
  }

  // Notify the popup (if it's open) so it can update its button text
  chrome.runtime.sendMessage({
    type: 'INSPECT_MODE_STATUS',
    enabled: inspectModeEnabled,
  });
}

// Listen for context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'toggleInspectMode') {
    toggleInspectMode(tab?.id, !inspectModeEnabled);
  } else if (info.menuItemId === 'openDashboard') {
    // Open the new dashboard page in a new tab
    chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html') });
  }
});

// Listen for messages from popup or any other script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'TOGGLE_SELECTION_MODE') {
    // Toggling from the popup
    toggleInspectMode(sender.tab?.id, request.enabled);
    sendResponse({ status: 'ok' });
  } else if (request.type === 'REQUEST_INSPECT_MODE_STATUS') {
    // Popup asking for the current Inspect Mode status
    sendResponse({ enabled: inspectModeEnabled });
  } else {
    // Currently unused/no-op
    sendResponse({ status: 'no-op' });
  }
});
