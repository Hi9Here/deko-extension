chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  // If the received message has the expected format...
  if (msg.text === 'report_back') {
    var got = document.getElementsByTagName('meta')
    
    function getDescription(got) {
      var metas = [].slice.call(got)
      if (metas.length)
      for (var i = 0; i < metas.length; i++) {
        var desc = ""
        if (metas[i].name) {
          desc = ""+ metas[i].name
        } else {
          desc = ""+ metas[i].getAttribute("property")
        }
        
        if (desc.endsWith("escription")) {
          return metas[i].getAttribute("content")
        }
      }
      var meta = document.querySelector("meta[name=\'description\']")
      if (meta) {
        return meta.getAttribute("content")
      } else {
        return document.title
      }
    }
    function getImages() {
      var output = []
      if (document.images) {
        images = [].slice.apply(document.images, null)
      } else {
        images = [].slice.apply(document.getElementsByTagName('img'), null)
      }
      if (images.length > 0){
        if (images.length > 9) {
          var gotImages = 0
          for (var i = 0; i < images.length && (gotImages < 5); i++) {
            if (images[i] !== undefined && images[i].src && !images[i].src.endsWith("svg") && ((images[i].width > 130 || images[i].width === 0) || images.length < 10))  {
              output.push( {src: images[i].src,width: images[i].width})
              gotImages++
            }
          }
        } else {
          for (var i = 0; i < images.length; i++) {
            if (images[i] !== undefined && images[i].src && ((images[i].width > 130 || images[i].width === 0) || images.length < 10))  {
              output.push( {src: images[i].src,width: images[i].width})
            }
          }
        }
      }
      return output
    }
    sendResponse({
      meta: got,
      description: getDescription(got), 
      images: getImages(), 
      fav: msg.fav, 
      url: msg.url, 
      title: msg.title 
    })
  }
})

document.hi9 = {
  sortUrls: function(request, sendResponse) {
    var processVisits = function(url, visitItems, sendResponse) {
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
        onAllVisitsProcessed(sendResponse)
      }
    }
    // Maps URLs to a count of the number of times the user typed that URL into
    // the response.
    var urlToCount = {}
    var urlArray = [];
    
    // This function is called when we have the final list of URls.
    var onAllVisitsProcessed = function(sendResponse) {
      for (var url in urlToCount) {
        urlArray.push(url);
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
      var processVisitsWithUrl = function(url, sendResponse) {
        // We need the url of the visited item to process the visit.
        // Use a closure to bind the  url into the callback's args.
        return function(visitItems) {
          processVisits(url, visitItems, sendResponse)
        }
      }
      chrome.history.getVisits({url: url}, processVisitsWithUrl(url, sendResponse));
      numRequestsOutstanding++
    }
  }
}