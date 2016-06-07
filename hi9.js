chrome.webRequest.onBeforeRequest.addListener( function (details) {
  chrome.tabs.query({url:"*://auth-c5e05.firebaseapp.com/*"}, function(tabs) {
    if (tabs.length) {
      chrome.tabs.highlight({'tabs': tabs[0].index, windowId: tabs[0].windowId}, function() {
         // update
      })
      chrome.tabs.update(tabs[0].id, {url: details.url})
      for (var i = 1; i < tabs.length; ++i) {
        chrome.tabs.remove(tabs[i].id, function() {})
      }
      return {cancel: true}
    } 
  })
},{urls:["*://auth-c5e05.firebaseapp.com/+.html*"]},['blocking'])