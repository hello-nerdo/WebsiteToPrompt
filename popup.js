console.log('Popup script loaded.');

// Extract toggle functionality into reusable function
function toggleSelection(toggleButton, enabled) {
  const newState = enabled ?? !selectionEnabled; // Allow passing state or toggling
  selectionEnabled = newState;
  toggleButton.textContent = newState ? 'Disable Inspect Mode' : 'Enable Inspect Mode';
  
  // Notify content script
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      type: 'TOGGLE_SELECTION_MODE',
      enabled: newState,
    });
  });
}

// Use it in the DOMContentLoaded handler
document.addEventListener('DOMContentLoaded', () => {
  const toggleSelectionBtn = document.getElementById('toggleSelectionBtn');
  
  // Enable automatically on popup open
  toggleSelection(toggleSelectionBtn, true);
  
  // Keep click handler for manual toggling
  toggleSelectionBtn.addEventListener('click', () => {
    toggleSelection(toggleSelectionBtn);
  });
});
