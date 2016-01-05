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
  console.log('it works! your ', v)
  console.log('idle ', idle)
  var d = new Date()
  var n = d.getTime()

  db.post({idle: [n, v]})
  console.debug('idle :', idle)
})
chrome.tabs.onActivated.addListener(function (v) {
  var d = new Date()
  var n = d.getTime()

  db.post({onActivated: [n, v]})
  console.log('Activated tab', v)
})
chrome.tabs.onUpdated.addListener(function (id, o, t) {
  chrome.tabs.getSelected(null, function (tab) {
    for (var i = 0; i < urlsToList.length; ++i) {
      if (tab.url.substring(0, urlsToList[i].length) === urlsToList[i]) {
        console.log('logging this one', urlsToList[i])
        
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
  })
})


