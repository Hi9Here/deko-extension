var tabList = {};
var urlsToList = ["https://hi9.uk/","https://github.com/","chrome-devtools://devtools"];
var idle = [];
      var myFirebaseRef = new Firebase("https://hi9site.firebaseio.com/testing");
      var authData = myFirebaseRef.getAuth();
      function authHandler(error, authData) {
        if (error) {
          console.log("Login Failed!", error);
        } else {
          console.log("Authenticated successfully with payload:", authData);
        }
      }
      if (authData) {
        console.log("User " + authData.uid + " is logged in with " +  authData.provider);
        var data = {}
        data[authData.uid] = authData.google.email;
        myFirebaseRef.set(data);
      } else {
        console.log("User is logged out");
       
        myFirebaseRef.authWithOAuthPopup("google", authHandler, {
          remember: "sessionOnly",
          scope: "email"
        });
      }

chrome.idle.onStateChanged.addListener(function(v) {

	console.log("it works! your ",v);
	console.log("idle ", idle);
	var d = new Date();
	var n = d.getTime();

	idle.push([n ,v])
	chrome.storage.local.set({
		'idle': idle
	});
	chrome.storage.local.get(['idle'], function(result) {
		var idle_loaded = result.idle;
		console.debug('idle loaded:', idle_loaded);
	});
	console.debug('idle :', idle);
});
chrome.tabs.onActivated.addListener(function(v) {

	console.log("Activated tab", v);
	chrome.storage.local.set({
		'channels': [1, 2, 3],
		'keywords': ['a', 'b', 'c']
	});

	chrome.storage.local.get(['channels', 'keywords'], function(result) {
		var channels = result.channels;
		var keywords = result.keywords;
		console.debug('channels :', channels);
		console.debug('keywords :', keywords);
	});

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
	chrome.storage.local.set({
		'channels': [1, 2, 3],
		'keywords': ['a', 'b', 'c']
	});

	chrome.storage.local.get(['channels', 'keywords'], function(result) {
		var channels = result.channels;
		var keywords = result.keywords;
		console.debug('channels :', channels);
			console.debug('keywords :', keywords);
	});
});

