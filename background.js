(function() {
  // send event to content_scripts to run a script on history change
  chrome.webNavigation.onHistoryStateUpdated.addListener(function (event) {
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, function(tabs) {
        if (!tabs.length) {
          return;
        }
        chrome.tabs.sendMessage(tabs[0].id, {}, function(response) {
          // The content script only runs on the console, and it never calls
          // sendResponse, so both "receiving end does not exist" and "message
          // port closed" are expected here. Read lastError to mark it handled.
          void chrome.runtime.lastError;
        });
    });
  });
})();
