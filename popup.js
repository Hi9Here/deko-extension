
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
      callback(request.responseText, 0)
    }
  }
  var requestB = makeHttpObject();
  requestB.open("GET", getBase(link), true);
  requestB.send(null);
  requestB.onreadystatechange = function() {
    if (requestB.readyState === 3) {
      callback(requestB.responseText, 1)
    }
  }
}

document.addEventListener('DOMContentLoaded', function() {
  var addMe = {}
  function getBase(theUrl) {
    var re = /(https?:\/\/[^\/]*)/gi
    var res = theUrl.match(re)
    if (Array.isArray(res) && res.length > 0) {
      return res[0]
    }
  }
  getCurrentTabUrl(function(url) {
    var loadDocument
    function getDoc(html, base) {
      parser = new DOMParser()
      
      loadDocument = parser.parseFromString(html, "text/html")
      // getImages(getBase(url), loadDocument.images, html)
      if (base) {
        getFavicon(getBase(url), loadDocument)
      }
      if (!base) {
        var titleH2 = document.getElementById("title")
        titleH2.innerText = loadDocument.title
        addMe.title = loadDocument.title
        // var descP = document.getElementById("desc")
        addMe.data = "Getting Description"// "getDescription(loadDocument)"
      }
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
    // function getDescription(doc) {
      // var html = doc.children[0]
      // var head = html.childNodes.item('head')
      // var meta = [].slice.call(head.childNodes)
      // for (var i = 0; i < meta.length; i++) {
        // 
        // if (meta[i].attributes) {
          // for (var attr = 0; attr < meta[i].attributes.length; attr++) {
            // if (meta[i].attributes[attr].textContent) {
// 
            // }
          // }
        // }
      // }
      // return 
    // }
    function getFavicon (base, doc) {
      var html = doc.children[0]
      var head = html.childNodes.item('head')
      var meta = [].slice.call(head.childNodes)
      for (var i = 0; i < meta.length; i++) {
        console.log("next 1", meta[i].nodeName)
        if (meta[i].attributes) {
          for (var attr = 0; attr < meta[i].attributes.length; attr++) {
            
            if (meta[i].attributes[attr].textContent.split("?")[0].endsWith(".png")) {
              if (meta[i].attributes[attr].textContent.startsWith("//")) {
                loadImage("https:"+meta[i].attributes[attr].textContent)
                loadImage("http:"+meta[i].attributes[attr].textContent)
              } else if (meta[i].attributes[attr].textContent.startsWith("/")) {
                loadImage(base + meta[i].attributes[attr].textContent)
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
    function loadImage(theUrl) {
      var img = new Image()
      var canvas = document.getElementById("canvas");
      var imageAsUrl = document.getElementById("imageAsUrl")
      ctx = canvas.getContext("2d")
      var gotIt = false

      img.onload = function () {
        if (!gotIt && img.width > 120) {
          gotIt = true
          canvas.height = canvas.width * (img.height / img.width)
  
          var oc = document.createElement('canvas')
          var octx = oc.getContext('2d')
  
          oc.width = img.width * 0.5
          oc.height = img.height * 0.5

          octx.clearRect(0, 0, canvas.width, canvas.height)

          octx.drawImage(img, 0, 0, oc.width, oc.height);
          octx.drawImage(oc, 0, 0, oc.width * 0.5, oc.height * 0.5)

          ctx.drawImage(oc, 0, 0, oc.width * 0.5, oc.height * 0.5, 0, 0, canvas.width, canvas.height)
          
          addMe.image = canvas.toDataURL("image/jpeg")

        }
      }
      if (!gotIt) {
        img.src = theUrl
      }
    }

    getHTML(url, getDoc)
    
  })
  var myBtn = document.getElementById("myBtn")
  myBtn.addEventListener("click", function(){
    var firebaseIo = new Firebase('https://open-elements.firebaseio.com/all/marcus6666')
    firebaseIo.push(addMe) 
  })
})
