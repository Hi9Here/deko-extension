chrome.idle.onStateChanged.addListener(function(v) {

  console.log("it works! your idle",v);

});
chrome.tabs.onActivated.addListener(function(v) {

  console.log("it works! onActivated  ", v);

})
