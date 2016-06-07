var tabs

chrome.tabs.onUpdated.addListener(function (id, o, t) {
  
})

chrome.webRequest.onBeforeRequest.addListener(function (details) {
  console.log(details)
  return {cancel: true}
}, {urls:["https://auth-c5e05.firebaseapp.com/"]}, ['blocking'] )
