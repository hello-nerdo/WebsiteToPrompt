(function() {
  console.log('WebsiteToPrompt content script loaded.');

  let selectionMode = false;
  let highlightOverlay = null;

  const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
    emDelimiter: '_',
    strongDelimiter: '**',
    linkStyle: 'inlined',
    linkReferenceStyle: 'full',
    preformattedCode: true
  });

  function htmlToMarkdown(html) {
    return turndownService.turndown(html);
  }

  // Inject minimal CSS for .website-to-prompt-container & controls
  injectStyles();

  /**
   * Toggle Inspect Mode message from popup.
   */
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

    // Prevent normal page interactions
    e.preventDefault();
    e.stopPropagation();

    // Convert + replace the clicked element
    transformElement(e.target);

    // Disable selection after one click
    disableSelectionMode();
    selectionMode = false;
  }

  /**
   * Convert the clicked element to Markdown, store original HTML, and replace in DOM.
   */
  function transformElement(element) {
    const originalHTML = element.outerHTML;
    const selectorPath = getElementSelectorPath(element);
    const uniqueId = window.location.pathname + '//' + selectorPath;

    // Store the original HTML
    localStorage.setItem(uniqueId, originalHTML);

    // -------------------------------------------------------------------
    // 3) Convert using Turndown
    // -------------------------------------------------------------------
    const markdown = htmlToMarkdown(originalHTML);

    // Create container to display the Markdown
    const container = document.createElement('div');
    container.className = 'website-to-prompt-container';
    container.setAttribute('data-wtp-id', uniqueId);
    container.setAttribute('contenteditable', 'true');
    container.textContent = markdown;

    // Add the control buttons (Copy, Revert)
    const controls = document.createElement('div');
    controls.className = 'website-to-prompt-controls';
    controls.setAttribute('contenteditable', 'false'); // Prevent editing controls
    controls.style.cursor = 'default';

    const copyBtn = document.createElement('button');
    copyBtn.textContent = 'Copy';
    copyBtn.style.cssText = 'padding: 4px 8px; margin: 0 4px; cursor: pointer; border: 1px solid #ccc; border-radius: 4px; background: #fff; color: black !important;';
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(container.textContent).then(() => {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        copyBtn.style.backgroundColor = '#e6ffe6';
        setTimeout(() => {
          copyBtn.textContent = originalText;
          copyBtn.style.backgroundColor = '#fff';
        }, 1500);
      }).catch(err => {
        console.warn('Copy failed', err);
        copyBtn.textContent = 'Copy failed';
        copyBtn.style.backgroundColor = '#ffe6e6';
        setTimeout(() => {
          copyBtn.textContent = 'Copy';
          copyBtn.style.backgroundColor = '#fff';
        }, 1500);
      });
    });

    const revertBtn = document.createElement('button');
    revertBtn.textContent = 'Revert';
    revertBtn.style.cssText = 'padding: 4px 8px; margin: 0 4px; cursor: pointer; border: 1px solid #ccc; border-radius: 4px; background: #fff; color: black !important;';
    revertBtn.addEventListener('click', () => {
      const originalText = revertBtn.textContent;
      revertBtn.textContent = 'Reverting...';
      revertBtn.style.backgroundColor = '#fff3e6';
      setTimeout(() => {
        revertElement(container);
      }, 300);
    });

    controls.appendChild(copyBtn);
    controls.appendChild(revertBtn);
    container.appendChild(controls);

    // Replace original element with the new container
    element.parentNode.replaceChild(container, element);
  }

  /**
   * Restore the original HTML from localStorage, removing the Markdown container.
   */
  function revertElement(container) {
    const uniqueId = container.getAttribute('data-wtp-id');
    const originalHTML = localStorage.getItem(uniqueId);
    if (originalHTML) {
      container.insertAdjacentHTML('beforebegin', originalHTML);
      container.remove();
      localStorage.removeItem(uniqueId);
    }
  }

  /**
   * Build a (somewhat) unique selector path for the element.
   */
  function getElementSelectorPath(el) {
    if (!el || el.nodeType !== Node.ELEMENT_NODE) return '';
    if (el.tagName.toLowerCase() === 'html') return 'html';

    let path = '';
    let current = el;
    while (current && current.nodeType === Node.ELEMENT_NODE) {
      let subSelector = current.tagName.toLowerCase();

      // If it has an ID, use #id
      if (current.id) {
        subSelector += `#${current.id}`;
      }
      // Else, if it has classes, use .class1.class2...
      else if (current.className) {
        const classes = current.className.trim().split(/\s+/).join('.');
        if (classes.length) {
          subSelector += `.${classes}`;
        }
      }

      // Find element index among siblings for :nth-child()
      if (current.parentNode) {
        const siblings = Array.from(current.parentNode.children);
        const index = siblings.indexOf(current) + 1;
        subSelector += `:nth-child(${index})`;
      }

      path = path ? (subSelector + '>' + path) : subSelector;
      current = current.parentElement;
    }

    return path;
  }

  /**
   * Creates the highlight overlay (blue-ish rectangle).
   */
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

  /**
   * Inject the basic CSS for the Markdown container and controls.
   */
  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .website-to-prompt-container {
        position: relative;
        font-family: monospace;
        white-space: pre-wrap;
        padding: 1em;
      }
      .website-to-prompt-controls {
        position: absolute;
        top: 5px;
        right: 5px;
      }
    `;
    document.head.appendChild(style);
  }
})();
