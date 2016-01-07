var urlsToList = ['https://hi9.uk/', 'https://github.com/', 'chrome-devtools://devtools']
var idle = []
var userInfo
var myFirebaseRef = new Firebase('https://hi9site.firebaseio.com/testing')
var authData = myFirebaseRef.getAuth()
var db = new PouchDB('hi9')

function authHandler (error, authData) {
  if (error) {
    console.log('Login Failed!', error)
  } else {
    console.log('Authenticated successfully with payload:', authData)
  }
}

if (authData) {

  console.log('User ' + authData.uid + ' is logged in with ' + authData.provider)
  var data = {}
  data[authData.uid] = authData.google.email
  myFirebaseRef.set(data)

} else {

  console.log('User is logged out')

  myFirebaseRef.authWithOAuthPopup('google', authHandler, {
    remember: 'sessionOnly',
    scope: 'email'
  })
}

chrome.idle.onStateChanged.addListener(function (v) {
  var d = new Date()
  var n = d.getTime()

  db.post({onStateChanged: [n, v]})

  var onStateChanged = []
  var onUpdated = []
  var onActivated = []
  var onHighlighted = []
  
  if (v === "idle") {
    function logThis(element, index, array) {
      var totalTime
      var sites

      if (element.doc.hasOwnProperty("onStateChanged")) {
        onStateChanged.push(element.doc.onStateChanged)
      }
      if (element.doc.hasOwnProperty("onUpdated")) {
        onUpdated.push(element.doc.onUpdated) // open
      }
      if (element.doc.hasOwnProperty("onActivated")) {
        onActivated.push(element.doc.onActivated)
      }
      if (element.doc.hasOwnProperty("onHighlighted")) {
        onHighlighted.push(element.doc.onHighlighted)
      }
      if ((index+1) === array.length) {
        totalTime = getTotalTime(onStateChanged)
        sites = getSites(onUpdated)
        console.log(totalTime)
        console.log(sites) 
        console.log(array)
      }
    }
    function getTotalTime(changed) {
      totalTime =0 
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
    function getSites(opened) {
      sites = {} 
      opened.sort(function(a, b) {
        return a[0] - b[0];
      })
      // from active to idle
      for (var index = 0; index < opened.length; index = index + 1) {
        sites[opened[2]] = opened[2] 
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
      if (tab.url.substring(0, urlsToList[i].length) === urlsToList[i]) {
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
})


