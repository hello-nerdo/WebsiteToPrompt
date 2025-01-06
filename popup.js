console.log('Popup script loaded.');

// Only keep the Inspect Mode toggle; remove old data-gathering logic
document.addEventListener('DOMContentLoaded', () => {
  const toggleSelectionBtn = document.getElementById('toggleSelectionBtn');
  let selectionEnabled = false;

  toggleSelectionBtn.addEventListener('click', () => {
    selectionEnabled = !selectionEnabled;
    toggleSelectionBtn.textContent = selectionEnabled
      ? 'Disable Inspect Mode'
      : 'Enable Inspect Mode';

    // Notify content script of the toggle
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: 'TOGGLE_SELECTION_MODE',
        enabled: selectionEnabled,
      });
    });
  });
});
