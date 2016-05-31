

document.addEventListener('DOMContentLoaded', function() {
  var addMe = {}

  function doStuffWithDom(data) {
    if (data) {
      getDoc(data.html, data.url)
      var titleH2 = document.getElementById("title")
      titleH2.innerText = data.title
      addMe.title = data.title
    }
  }
  function getCurrentTabUrl(callback) {
    var queryInfo = {
      active: true,
      currentWindow: true
    }
    chrome.tabs.query(queryInfo, function(tabs) {
      var tab = tabs[0]
      var url = tab.url
      console.assert(typeof url == 'string', 'tab.url should be a string')

      callback(url)
      addMe.url = url
      chrome.tabs.sendMessage(tab.id, {text: 'report_back', url: url}, doStuffWithDom)
    })
  }

  function getHTML(link, callback) {
    function getBase(theUrl) {
      var re = /(https?:\/\/[^\/]*)/gi
      var res = theUrl.match(re)
      if (Array.isArray(res) && res.length > 0) {
        return res[0]
      }
    }
    function makeHttpObject() {
      try {return new XMLHttpRequest()}
      catch (error) {}
      try {return new ActiveXObject("Msxml2.XMLHTTP")}
      catch (error) {}
      try {return new ActiveXObject("Microsoft.XMLHTTP")}
      catch (error) {}
  
      throw new Error("Could not create HTTP request object.")
    }
    var request = makeHttpObject();
    request.open("GET", link, true);
    request.send(null);
    request.onreadystatechange = function() {
      if (request.readyState === 3) {
        callback(request.responseText, link)
      }
    }
    var requestB = makeHttpObject();
    requestB.open("GET", getBase(link), true);
    requestB.send(null);
    requestB.onreadystatechange = function() {
      if (requestB.readyState === 3) {
        callback(requestB.responseText, getBase(link))
      }
    }
  }
  function getBase(theUrl) {
    var re = /(https?:\/\/[^\/]*)/gi
    var res = theUrl.match(re)
    if (Array.isArray(res) && res.length > 0) {
      return res[0]
    }
  }
  var loadDocument
  function getDoc(html, url) {
    parser = new DOMParser()
     
    loadDocument = parser.parseFromString(html, "text/html")
    getImages(getBase(url), loadDocument.images, html)
    getFavicon(url, loadDocument)

    // var descP = document.getElementById("desc")
    addMe.data = getDescription(loadDocument)
  }
  function getImages(url, got, html) {
    var images = [].slice.call(got)
    if (images.length) {
      html = ""
      var output = []
      for (var i = 0; i < images.length; i++) {
        html = html + images[i].outerHTML
      }
    }
    var re = /<img[^>]+src="([^">]+)"/gi 
    while ((m = re.exec(html)) !== null) {
      if (m.index === re.lastIndex) {
        re.lastIndex++;
      }
      loadImage(getUrl(m[1], url))
    }
  }
  function getDescription(doc) {
    var meta = doc.getElementsByTagName('meta'); 
    for (var i = 0; i < meta.length; i++) {
      if (meta[i].getAttribute("property") == "description") {
        return metas[i].getAttribute("content")
      }
    }
    return ""
  }
  function getFavicon (url, doc) {
    var html = doc.children[0]
    var head = html.childNodes.item('head')
    var meta = [].slice.call(head.childNodes)
    for (var i = 0; i < meta.length; i++) {
      console.log("next 1", meta[i].nodeName)
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
  }
  getCurrentTabUrl(function(url) {
    getHTML(url, getDoc)
  })
  function loadFav(theUrl) {
    var img = new Image()
    var fav = document.getElementById("fav");
    var canvas = document.getElementById("canvas");
    var imageAsUrl = document.getElementById("imageAsUrl")
    var gotFav = false
    img.src = theUrl
    img.onload = function () {
      if (!gotFav && img.width < 120 || theUrl.endsWith(".ico")) {
        gotFav = true
        fav.height = fav.width = 32
        var octx = fav.getContext('2d')
        octx.drawImage(img, 0, 0, fav.width, fav.height)
        addMe.fav = fav.toDataURL("image/jpeg")
      } else {
        canvas.height = canvas.width * (img.height / img.width)
        var octx = canvas.getContext('2d')
        octx.drawImage(img, 0, 0, fav.width, fav.height)
        if (!Array.isArray(addMe.alt)) {
          addMe.alt = []
        }
        if (addMe.alt.indexOf(""+canvas.toDataURL("image/jpeg")) === -1) {
          addMe.alt.push(""+canvas.toDataURL("image/jpeg"))
        }
      }
    }
  }
  function loadImage(theUrl) {
    var img = new Image()
    var fav = document.getElementById("fav");
    var canvas = document.getElementById("canvas");
    var imageAsUrl = document.getElementById("imageAsUrl")
    var gotIt = false
    img.src = theUrl

    img.onload = function () {
      if (!gotIt && img.width > 120 && !theUrl.endsWith(".ico")) {
        gotIt = true
        canvas.height = canvas.width * (img.height / img.width)
        var octx = canvas.getContext('2d')
        octx.drawImage(img, 0, 0, canvas.width, canvas.height)
        addMe.image = ""+canvas.toDataURL("image/jpeg")
      } else {
        canvas.height = canvas.width * (img.height / img.width)
        var octx = canvas.getContext('2d')
        octx.drawImage(img, 0, 0, fav.width, fav.height)
        if (!Array.isArray(addMe.alt)) {
          addMe.alt = []
        }
        if (addMe.alt.indexOf(""+canvas.toDataURL("image/jpeg")) === -1) {
          addMe.alt.push(""+canvas.toDataURL("image/jpeg"))
        }
      }
    }
  }
  var imageUrl = document.getElementById("imageUrl")

  var myBtn = document.getElementById("myBtn")
  myBtn.addEventListener("click", function(){
    console.log("https://auth-c5e05.firebaseapp.com/add/#" + encodeURIComponent(JSON.stringify(addMe)))
    console.log(addMe)
  })
  function getUrl(url, theurlOfImage) {
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
})
