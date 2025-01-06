(function() {
  console.log('WebsiteToPrompt content script loaded.');

  let selectionMode = false;
  let highlightOverlay = null;

  // Listen for messages (e.g., toggle selection mode)
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'TOGGLE_SELECTION_MODE') {
      selectionMode = request.enabled;
      if (selectionMode) {
        enableSelectionMode();
      } else {
        disableSelectionMode();
      }
      sendResponse({ status: 'selectionModeUpdated', enabled: selectionMode });
    }
  });

  function enableSelectionMode() {
    console.log('Enabling selection mode...');
    document.addEventListener('mouseover', handleMouseOver, true);
    document.addEventListener('mouseout', handleMouseOut, true);
    document.addEventListener('click', handleClick, true);
    createOverlayElement();
  }

  function disableSelectionMode() {
    console.log('Disabling selection mode...');
    document.removeEventListener('mouseover', handleMouseOver, true);
    document.removeEventListener('mouseout', handleMouseOut, true);
    document.removeEventListener('click', handleClick, true);
    removeOverlayElement();
  }

  function handleMouseOver(e) {
    if (!highlightOverlay) return;
    const target = e.target;
    const rect = target.getBoundingClientRect();

    highlightOverlay.style.display = 'block';
    highlightOverlay.style.width = rect.width + 'px';
    highlightOverlay.style.height = rect.height + 'px';
    highlightOverlay.style.top = rect.top + window.scrollY + 'px';
    highlightOverlay.style.left = rect.left + window.scrollX + 'px';
  }

  function handleMouseOut() {
    if (!highlightOverlay) return;
    highlightOverlay.style.display = 'none';
  }

  function handleClick(e) {
    if (!selectionMode) return;

    // Prevent the default click
    e.preventDefault();
    e.stopPropagation();

    const target = e.target;
    const timeStamp = new Date().toISOString();
    const elementHTML = target.outerHTML;

    // Send to background for storage
    chrome.runtime.sendMessage({
      type: 'ELEMENT_SELECTED',
      payload: {
        html: elementHTML,
        tagName: target.tagName,
        timestamp: timeStamp
      }
    }, (response) => {
      if (response.status === 'ok') {
        console.log('Element info stored in background script.');
      }
    });

    // Immediately disable selection mode after the single click
    disableSelectionMode();
    selectionMode = false;
  }

  function createOverlayElement() {
    highlightOverlay = document.createElement('div');
    highlightOverlay.id = 'websiteToPrompt_highlightOverlay';
    highlightOverlay.style.position = 'absolute';
    highlightOverlay.style.zIndex = 9999;
    highlightOverlay.style.backgroundColor = 'rgba(135,206,235, 0.3)';
    highlightOverlay.style.pointerEvents = 'none';
    highlightOverlay.style.border = '2px solid #00f';
    highlightOverlay.style.display = 'none';
    document.body.appendChild(highlightOverlay);
  }

  function removeOverlayElement() {
    if (highlightOverlay) {
      highlightOverlay.remove();
      highlightOverlay = null;
    }
  }
})();
