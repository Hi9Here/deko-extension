chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  // If the received message has the expected format...
  if (msg.text === 'report_back') {
    var meta = document.getElementsByTagName('meta')
    sendResponse({meta: meta, images: document.images, url: msg.url, title: document.title })
  }
})
