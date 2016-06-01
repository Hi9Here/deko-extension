document.addEventListener('DOMContentLoaded', function() {
  var addMe = {}
  var gotFav = false
  var gotIt = false
  var loadDocument
  var imageUrl = document.getElementById("imageUrl")

  function getBase(theUrl) {
    var re = /(https?:\/\/[^\/]*)/gi
    var res = theUrl.match(re)
    if (Array.isArray(res) && res.length > 0) {
      return res[0]
    }
  }

  function getImages(url, got, html) {
    var images = [].slice.call(got)
    if (images.length) {
      var output = []
      var gotImages = 0
      for (var i = 0; i < images.length || (gotImages > 5 && images.length > 9); i++) {
        if (images[i] !== undefined && images[i].src && ((images[i].width > 130 || images[i].width === 0) || images.length < 10))  {
          loadImage(getUrl(images[i].src, url))
          gotImages++
        }
      }
    } else {
      var re = /<img[^>]+src="([^">]+)"/gmi 
      while ((m = re.exec(html)) !== null) {
        if (m.index === re.lastIndex) {
          re.lastIndex++
        }
        loadImage(getUrl(m[1], url))
      }
    }
  }

  function getDescription(doc) {
    var meta = doc.getElementsByTagName('meta'); 
    for (var i = 0; i < meta.length; i++) {
      if (meta[i].getAttribute("property") == "description") {
        return meta[i].getAttribute("content")
      }
    }
    return ""
  }

  

  function loadFav(theUrl) {
    var img = new Image()
    var fav = document.getElementById("fav")
    
    img.src = theUrl
    img.onload = function () {
      if (!gotFav) {
        gotFav = true
        fav.height = fav.width = 32
        var octx = fav.getContext('2d')
        octx.fillStyle = "#FFF"
        octx.fillRect(0, 0, fav.width, fav.height)
        octx.drawImage(img, 0, 0, fav.width, fav.height)
        addMe.fav = fav.toDataURL("image/jpeg")
      }
    }
  }


  function getUrl(theurlOfImage, url) {
    if (theurlOfImage.startsWith("//")) {
      if (url.startsWith("https://")) {
        return "https:"+theurlOfImage
      } else {
        return "http:"+theurlOfImage
      }
    } else if (theurlOfImage.startsWith("/")) {
      return getBase(url) + theurlOfImage
    } else if (theurlOfImage.startsWith("http://")) {
      return theurlOfImage
    } else if (theurlOfImage.startsWith("https://")) {
      return theurlOfImage
    } else {
      var arrayUrl = url.split('/')
      arrayUrl.pop()
      return arrayUrl.join('/') + "/" + theurlOfImage
    }
  }
  function getFavicon (url, doc) {
    var html = doc.children[0]
    var head = html.childNodes.item('head')
    var meta = [].slice.call(head.childNodes)
    for (var i = 0; i < meta.length; i++) {
      if (meta[i].attributes) {
        for (var attr = 0; attr < meta[i].attributes.length; attr++) {
          if (meta[i].attributes[attr].textContent.split("?")[0].endsWith(".png") 
           || meta[i].attributes[attr].textContent.split("?")[0].endsWith(".ico")
           || meta[i].attributes[attr].textContent.split("?")[0].endsWith(".svg")) {
            loadFav(getUrl(meta[i].attributes[attr].textContent, url))
          }
        }
      }
    }
    loadFav(getBase(url) + "/favicon.ico")
  }
  function loadImage(theUrl) {
    var img = new Image()
    var canvas = document.getElementById("canvas")
    img.src = theUrl

    img.onload = function () {
      if (!gotIt && img.width > 120 && !theUrl.endsWith(".ico")) {
        gotIt = true
        canvas.height = canvas.width * (img.height / img.width)
        var octx = canvas.getContext('2d')
        octx.fillStyle = "#FFF"
        octx.fillRect(0, 0, canvas.width, canvas.height)
        octx.drawImage(img, 0, 0, canvas.width, canvas.height)
        addMe.image = ""+canvas.toDataURL("image/jpeg")
      } else {
        canvas.height = canvas.width * (img.height / img.width)
        var octx = canvas.getContext('2d')
        octx.fillStyle = "#FFF"
        octx.fillRect(0, 0, canvas.width, canvas.height)
        octx.drawImage(img, 0, 0, canvas.width, canvas.height)
        if (!Array.isArray(addMe.alt)) {
          addMe.alt = []
        }
        if (addMe.alt.indexOf(""+canvas.toDataURL("image/jpeg")) === -1) {
          addMe.alt.push(""+canvas.toDataURL("image/jpeg"))
        }
      }
    }
  }
  function getDoc(html, url) {
    parser = new DOMParser()
     
    loadDocument = parser.parseFromString(html, "text/html")
    getImages(url, loadDocument.images, html)
    getFavicon(url, loadDocument)

    // var descP = document.getElementById("desc")
    addMe.desc = getDescription(loadDocument)
    setTimeout(function(){
      chrome.tabs.create({ url: "https://auth-c5e05.firebaseapp.com/+.html#" + encodeURIComponent(JSON.stringify(addMe)) })
    }, 2000)
  }
  function doStuffWithDom(data) {
    if (data) {
      getDoc(data.html, data.url)
      var titleH2 = document.getElementById("title")
      titleH2.innerText = data.title
      addMe.title = data.title
    }
  }
  function getCurrentTabUrl() {
    var queryInfo = {
      active: true,
      currentWindow: true
    }
    chrome.tabs.query(queryInfo, function(tabs) {
      var tab = tabs[0]
      var url = tab.url
      addMe.url = url
      chrome.tabs.sendMessage(tab.id, {text: 'report_back', url: url}, doStuffWithDom)
    })
  }
  getCurrentTabUrl()
})
