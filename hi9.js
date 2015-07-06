chrome.idle.onStateChanged.addListener(function(v) {

  console.log("it works! your idle",v);

});
chrome.tabs.onActivated.addListener(function(v) {

  // Get the current active tab in the lastly focused window
  chrome.tabs.query({
    active: true,
    lastFocusedWindow: true
  }, function(tabs) {
    // and use that tab to fill in out title and url
    var tab = tabs[0];
    console.log(tabs);
  });
})
