

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
      debugger
      return res[0]
    }
  }
  var loadDocument
  function getDoc(html, base) {
    parser = new DOMParser()
     
    loadDocument = parser.parseFromString(html, "text/html")
    // getImages(getBase(url), loadDocument.images, html)
    getFavicon(base, loadDocument)

    // var descP = document.getElementById("desc")
    addMe.data = getDescription(loadDocument)
  }
  function getImages(base, got, html) {
    var images = [].slice.call(got)
    if (images.length) {
      html = ""
      var output = []
      for (var i = 0; i < images.length; i++) {
        var re = /src="\//gi; 
        var subst = 'src="'+base+'/'; 
        html = html + images[i].outerHTML.replace(re, subst)
      }
    }
    var re = /<img[^>]+src="([^">]+)"/gi 
    while ((m = re.exec(html)) !== null) {
      if (m.index === re.lastIndex) {
        re.lastIndex++;
      }
      loadImage(m[1])
    }
  }
  function getDescription(doc) {
    var html = doc.children[0]
    var head = html.childNodes.item('head')
    var meta = [].slice.call(head.childNodes)
    for (var i = 0; i < meta.length; i++) {     
      if (meta[i].attributes) {
        for (var attr = 0; attr < meta[i].attributes.length; attr++) {
          
          if (meta[i].attributes[attr].ownerElement.name === "description" || meta[i].attributes[attr].textContent) {
debugger    
            addMe.description = meta[i].attributes[attr].textContent
          }
        }
      }
    }
    return 
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
            if (meta[i].attributes[attr].textContent.startsWith("//")) {
              loadImage("https:"+meta[i].attributes[attr].textContent)
              loadImage("http:"+meta[i].attributes[attr].textContent)
            } else if (meta[i].attributes[attr].textContent.startsWith("/")) {
              loadImage(getBase(url) + meta[i].attributes[attr].textContent)
            } else if (meta[i].attributes[attr].textContent.startsWith("http://")) {
              loadImage(meta[i].attributes[attr].textContent)
            } else if (meta[i].attributes[attr].textContent.startsWith("https://")) {
              loadImage(meta[i].attributes[attr].textContent)
            } else {
              var arrayUrl = url.split('/')
              arrayUrl.pop()
              loadImage(arrayUrl.join('/') + "/" + meta[i].attributes[attr].textContent)
            }
          }
        }
      }
    }
  }
  getCurrentTabUrl(function(url) {
    getHTML(url, getDoc)
  })
  function loadImage(theUrl) {
    var img = new Image()
    var fav = document.getElementById("fav");
    var canvas = document.getElementById("canvas");
    var imageAsUrl = document.getElementById("imageAsUrl")
    var gotIt = false
    var gotFav = false

    img.onload = function () {
      if (!gotIt && img.width > 120) {
        gotIt = true
        canvas.height = canvas.width * (img.height / img.width)
        var octx = canvas.getContext('2d')
        octx.drawImage(img, 0, 0, canvas.width, canvas.height)
        addMe.image = canvas.toDataURL("image/jpeg")
        if (!gotFav) {
          fav.height = fav.width * (img.height / img.width)
          var octx = fav.getContext('2d')
          octx.drawImage(img, 0, 0, fav.width, fav.height)
          addMe.fav = canvas.toDataURL("image/jpeg")
        }
      } else if (!gotFav && img.width < 120) {
        gotFav = true
        fav.height = fav.width * (img.height / img.width)
        var octx = fav.getContext('2d')
        octx.drawImage(img, 0, 0, fav.width, fav.height)
        addMe.fav = canvas.toDataURL("image/jpeg")
      } else {
        fav.height = fav.width * (img.height / img.width)
        var octx = fav.getContext('2d')
        octx.drawImage(img, 0, 0, fav.width, fav.height)
        if (!Array.isArray(addMe.alt)) {
          addMe.alt = []
        }
        addMe.alt.push(canvas.toDataURL("image/jpeg"))
      }
    }
    if (!gotIt) {
      img.src = theUrl
    }
  }
  var imageUrl = document.getElementById("imageUrl")
  
  imageUrl.addEventListener("change", function(){
    loadImage(imageUrl.value)
  })

  var myBtn = document.getElementById("myBtn")
  myBtn.addEventListener("click", function(){
    console.log(JSON.stringify(addMe))
  })
})
