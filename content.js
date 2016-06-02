chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  // If the received message has the expected format...
  if (msg.text === 'report_back') {
    var meta = document.getElementsByTagName('meta')
    sendResponse({meta: meta, images: [].slice.apply(document.getElementsByTagName('img'), null), url: msg.url, title: document.title })
  }
})
