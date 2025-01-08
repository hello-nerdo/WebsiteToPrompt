console.log('Popup script loaded.');

// Only keep the Selection Mode toggle; remove old data-gathering logic
document.addEventListener('DOMContentLoaded', () => {
  const toggleSelectionBtn = document.getElementById('toggleSelectionBtn');
  let selectionEnabled = false;

  // Update initial button text to match design
  toggleSelectionBtn.textContent = 'Enable Selection';

  // Ask the background script for the current Selection Mode state
  chrome.runtime.sendMessage({ type: 'REQUEST_INSPECT_MODE_STATUS' }, (response) => {
    if (response && typeof response.enabled === 'boolean') {
      selectionEnabled = response.enabled;
      toggleSelectionBtn.textContent = selectionEnabled ? 'Disable Selection' : 'Enable Selection';
    }
  });

  // Listen for updates from background (e.g., if toggled via context menu)
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'INSPECT_MODE_STATUS') {
      selectionEnabled = message.enabled;
      toggleSelectionBtn.textContent = selectionEnabled ? 'Disable Selection' : 'Enable Selection';
    }
  });

  // When user clicks the toggle, notify the background script
  toggleSelectionBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({
      type: 'TOGGLE_SELECTION_MODE',
      enabled: !selectionEnabled,
    });
  });

  // NEW: Open Dashboard from popup
  const openDashboardBtn = document.getElementById('openDashboardBtn');
  openDashboardBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html') });
  });

  // NEW: GitHub repository link
  const githubLink = document.getElementById('githubLink');
  githubLink.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: 'https://github.com/path-find-er/WebsiteToPrompt' });
  });
});
