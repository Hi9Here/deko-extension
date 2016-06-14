chrome.webRequest.onBeforeRequest.addListener( function (details) {
  chrome.tabs.query({url:"*://auth-c5e05.firebaseapp.com/"}, function(tabs) {
    if (tabs.length) {
      chrome.tabs.remove(details.tabId, function() {})
      chrome.tabs.highlight({'tabs': tabs[0].index, windowId: tabs[0].windowId}, function() {
         // update
      })
      chrome.tabs.update(tabs[0].id, {url: details.url})
    } 
  })
},{urls:["*://auth-c5e05.firebaseapp.com/+.html*"]})


