var urlsToList = ['https://hi9.uk/']
var idle = []
var userInfo
var db = new PouchDB('hi9')

chrome.idle.onStateChanged.addListener(function (v) {
  var d = new Date()
  var n = d.getTime()

  var onStateChanged = []
  var onUpdated = []
  var onActivated = []
  var onHighlighted = []
  var del_ids = []
  var start = 0

  if (v === "idle") {
    function logThis(element, index, array) {
      if (element.doc.hasOwnProperty("onStateChanged")) {
        onStateChanged.push(element.doc.onStateChanged)
        if (index === 0) {
          start = element.doc.onStateChanged[0]
        }
        del_ids.push(element.id)
      }
      if (element.doc.hasOwnProperty("onUpdated")) {
        onUpdated.push(element.doc.onUpdated) // open
        if (index === 0) {
          start = element.doc.onUpdated[0]
        }
        del_ids.push(element.id)
      }
      if (element.doc.hasOwnProperty("onActivated")) {
        onActivated.push(element.doc.onActivated)
        if (index === 0) {
          start = element.doc.onActivated[0]
        }
        del_ids.push(element.id)
      }
      if (element.doc.hasOwnProperty("onHighlighted")) {
        onHighlighted.push(element.doc.onHighlighted)
        if (index === 0) {
          start = element.doc.onHighlighted[0]
        }
        del_ids.push(element.id)
      }
      if ((index+1) === array.length) {
        var myFirebaseRef = new Firebase('https://hi9site.firebaseio.com/users/google:'+userInfo.id+"/log/")
        myFirebaseRef.push({'time': getTotalTime(onStateChanged), 'sites': getSites(onUpdated, onActivated), 'id': userInfo.id, 'end': n, 'start': start}, deleteOld())
        // myFirebaseRef = null // clear up
      }
      function deleteOld() {
        del_ids.forEach(deleteId)
        onStateChanged = []
        onUpdated = []
        onActivated = []
        onHighlighted = []
        del_ids = []
        start = 0
      }
      function deleteId(id) {
        db.get(id).then(function(doc) {
          return db.remove(doc);
        }).then(function (result) {
          console.log(result)
        }).catch(function (err) {
          console.log(err)
        })
      }
    }
    function getTotalTime(changed) {
      totalTime=0 
      changed.sort(function(a, b) {
        return a[0] - b[0];
      })
      // from active to idle
      for (var index = 0; index+1 < changed.length; index = index + 1) {
        if (changed[index][1] === "active" && changed[index+1][1] === "idle") {
          totalTime = totalTime + ((changed[index+1][0] - changed[index][0]) / 60 / 1000)
        }
      }
      return Math.round(totalTime)
    }
    function getSites(opened, activate) {
      sites = {} 
      opened.sort(function(a, b) {
        return a[0] - b[0];
      })
      activate.sort(function(a, b) {
        return a[0] - b[0];
      })
      // from active to idle
      for (var index = 0; index < opened.length; index = index + 1) {
        var key =  encodeURIComponent(opened[index][2]).replace(/\./g, '%2E')
        if (sites.hasOwnProperty(key)) {
          sites[key] = 1 + sites[key]
        } else {
          sites[key] = 1 
        }
      }
      return sites
    }
    db.allDocs({
      include_docs: true
    }).then(function(doc) {
      doc.rows.forEach(logThis)
    })

  } else {
    console.log('idle ', v)
  }
  if (v !== "locked") {
    db.post({onStateChanged: [n, v]}).catch(function (err) {
      console.log(err);
    });
  } 
  // compial data 
    // get data
    // time on facebook/github/hi9/other
    //  
  // try to save data to hi9site
    // firebaseio post 
  // if good del local data
})

chrome.tabs.onDetached.addListener(function (v) {
  var d = new Date()
  var n = d.getTime()

  db.post({onDetached: [n, v]})
  console.log('onDetached tab', v)
})

chrome.tabs.onHighlighted.addListener(function (v) {
  var d = new Date()
  var n = d.getTime()

  db.post({onHighlighted: [n, v.tabIds[0]]})
  console.log('onHighlighted tab', v.tabIds[0])
})

chrome.tabs.onActivated.addListener(function (v) {
  var d = new Date()
  var n = d.getTime()

  db.post({onActivated: [n, v]})
  console.log('Activated tab', v)
})

chrome.tabs.onUpdated.addListener(function (id, o, t) {
  chrome.tabs.getSelected(null, function (tab) {
    var d = new Date()
    var n = d.getTime()
    for (var i = 0; i < urlsToList.length; ++i) {
      if (tab.url.substring(0, urlsToList[i].length) === urlsToList[i] || 
          tab.url.substring(0, urlsToList[i].length + 8) === "https://" + urlsToList[i] ||
          tab.url.substring(0, urlsToList[i].length + 7) === "http://" + urlsToList[i] || 
          tab.url.substring(0, urlsToList[i].length + 12) === "https://www." + urlsToList[i] ||
          tab.url.substring(0, urlsToList[i].length + 11) === "http://www." + urlsToList[i]) {
        db.post({onUpdated: [n, id, urlsToList[i]]})
      }
    }
  })
})

chrome.identity.getProfileUserInfo(function (user) {
  userInfo = user
  db.get(userInfo.id).then(function(doc) {
    return db.put({
      _id: userInfo.id,
      _rev: doc._rev,
      user: userInfo
    });
  }).then(function(response) {
    console.log("response",response)
    // handle response
  }).catch(function (err) {
    console.log("err",err)
    db.put({
      _id: userInfo.id,
      user: userInfo
    })
  })
  // load if you can
  db.get("whiteList").then(function(doc) {
    return doc.whiteList
  }).then(function(response) {
    urlsToList = response
  }).catch(function (err) {
    console.log("err",err)
  })

  var firebaseWhiteList = new Firebase('https://hi9site.firebaseio.com/users/google:'+userInfo.id+"/white-list/")
  // Basic usage of .once() to read the data located at firebaseRef.
  firebaseWhiteList.once('value', function(dataSnapshot) {
    var whiteList = dataSnapshot.val()
    urlsToList = []
    Object.keys(whiteList).forEach(function(key) {
      urlsToList.push(whiteList[key].link)
    })
    db.get("whiteList").then(function(doc) {
      return db.put({
         _id: "whiteList",
         _rev: doc._rev,
         whiteList: whiteList
      });
    }).then(function(response) {
      console.log("response",response)
      // handle response
    }).catch(function (err) {
      console.log("err",err)
      db.put({
         _id: "whiteList",
         whiteList: whiteList
      })
    })
  })
})

// A function to use as callback
function doStuffWithDom(domContent) {
  alert('I received the following DOM content:\n' + domContent);
}

// When the browser-action button is clicked...
chrome.browserAction.onClicked.addListener(function (tab) {
  // ...check the URL of the active tab against our pattern and...
  chrome.tabs.sendMessage(tab.id, {text: 'report_back'}, doStuffWithDom)
})
