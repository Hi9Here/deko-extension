var tabList = {};
var urlsToList = ["https://github.com/","chrome-devtools://devtools"];
chrome.idle.onStateChanged.addListener(function(v) {

  console.log("it works! your ",v);

});
chrome.tabs.onActivated.addListener(function(v) {

    console.log("Activated tab", v);

})
chrome.tabs.onUpdated.addListener(function(id,o,t) {

  chrome.tabs.getSelected(null,function(tab) {
    console.log("Your url is",  tab.url);
    for (var i = 0; i < urlsToList.length; ++i) { 
      if (tab.url.substring(0, urlsToList[i].length) == urlsToList[i]) {
         console.log("logging this one")
      }
    }
  });

})
