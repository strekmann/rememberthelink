function checkForValidUrl(tabId, changeInfo, tab) {
  if (tab.url.indexOf('http') === 0 &&
      tab.url.indexOf('rememberthelink.com') !== 7) {
    chrome.pageAction.show(tabId);
  }
}

// Listen for any changes to the URL of any tab.
chrome.tabs.onUpdated.addListener(checkForValidUrl);

chrome.pageAction.onClicked.addListener(function(tab) {
  var url = 'http://rememberthelink.com/new?url=' + tab.url;
  chrome.tabs.update(tab.id, { url: url });
});
