chrome.idle.onStateChanged.addListener(function(v) {

  console.log("it works! your ",v);

});
chrome.tabs.onActivated.addListener(function(v) {

    console.log("Your url is", v);

})
chrome.tabs.onUpdated.addListener(function(id,o,t) {

    console.log("Your o.url", o.url);

})
