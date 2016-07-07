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

chrome.runtime.onMessageExternal.addListener(
  function(request, sender, sendResponse) {

    var processVisits = function(url, visitItems) {
      for (var i = 0, ie = visitItems.length; i < ie; ++i) {
        if (!urlToCount[url]) {
          urlToCount[url] = 0
        }
        urlToCount[url]++
      }

      // If this is the final outstanding call to processVisits(),
      // then we have the final results.  Use them to build the list
      // of URLs to show in the popup.
      if (!--numRequestsOutstanding) {
        onAllVisitsProcessed()
      }
    }
    // Maps URLs to a count of the number of times the user typed that URL into
    // the response.
    var urlToCount = {}

    // This function is called when we have the final list of URls.
    var onAllVisitsProcessed = function() {
      // Get the top scorring urls.
      var urlArray = []
      for (var url in urlToCount) {
        urlArray.push(url)
      }

      // Sort the URLs by the number of times the user typed them.
      urlArray.sort(function(a, b) {
        return urlToCount[b] - urlToCount[a];
      })

      sendResponse(urlArray)
    }
    
    // Track the number of callbacks from chrome.history.getVisits()
    // that we expect to get.  When it reaches zero, we have all results.
    var numRequestsOutstanding = 0;
    // For each history item, get details on all visits.
    for (var i = 0; i < request.length; ++i) {
      var url = request[i].url
      var processVisitsWithUrl = function(url) {
        // We need the url of the visited item to process the visit.
        // Use a closure to bind the  url into the callback's args.
        return function(visitItems) {
          processVisits(url, visitItems)
        }
      }
      chrome.history.getVisits({url: url}, processVisitsWithUrl(url));
      numRequestsOutstanding++
    }
    return true
  }
)
