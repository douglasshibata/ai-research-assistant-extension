// Listen for messages from the background script or side panel
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'GET_SELECTION') {
    const selection = window.getSelection()?.toString() || '';
    sendResponse({ selection });
  } else if (message.type === 'GET_PAGE_CONTEXT') {
    // Basic context extraction: get the body text
    const context = document.body.innerText;
    sendResponse({ context: context.slice(0, 10000) }); // Limit context size
  }
  return true;
});

// Notify the side panel when text is selected
document.addEventListener('mouseup', () => {
    const selection = window.getSelection()?.toString().trim();
    if (selection) {
        chrome.runtime.sendMessage({ type: 'SELECTION_CHANGE', selection });
    }
});

export {};
