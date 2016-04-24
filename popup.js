
function getCurrentTabUrl(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {

    var tab = tabs[0];
    var url = tab.url;

    console.assert(typeof url == 'string', 'tab.url should be a string');

    callback(url);
  });
}

/**
 * @param {string} searchTerm - Search term for Google Image search.
 * @param {function(string,number,number)} callback - Called when an image has
 *   been found. The callback gets the URL, width and height of the image.
 * @param {function(string)} errorCallback - Called when the image is not found.
 *   The callback gets a string that describes the failure reason.
 */
function getHTML(link, callback) {
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
      callback(request.responseText)
    }
  }
}

document.addEventListener('DOMContentLoaded', function() {
  getCurrentTabUrl(function(url) {
    var loadDocument
    var images 
    var favicon
    function getDoc(html) {
      parser = new DOMParser()

      loadDocument = parser.parseFromString(html, "text/html")
      images = getImages(getBase(url), loadDocument.images, html)
      favicon = getFavicon(getBase(url), loadDocument)
      var titleH2 = document.getElementById("title")
      titleH2.innerText = loadDocument.title
    }
    function getBase(theUrl) {
      var re = /(https?:\/\/[^\/]*)/gi
      var res = theUrl.match(re)
      if (Array.isArray(res) && res.length > 0) {
        return res[0]
      }
    }
    function getImages(base, got, html) {
      var images = [].slice.call(got)
      if (images.length) {
        var output = []
        for (var i = 0; i < images.length; i++) {
          var re = /src="\//gi; 
          var subst = 'src="'+base+'/'; 
          output.push(images[i].outerHTML.replace(re, subst))
        }
      }
      var output = []
      var re = /<img[^>]+src="([^">]+)"/gi 
       
    }
    function getFavicon (base, doc) {
      var html = doc.children[0]
      var head = html.childNodes.item('head')
      var meta = [].slice.call(head.childNodes)
      for (var i = 0; i < meta.length; i++) {
        console.log("next 1", meta[i].nodeName)
        if (meta[i].attributes) {
          for (var attr = 0; attr < meta[i].attributes.length; attr++) {
            
            if (meta[i].attributes[attr].textContent.split("?")[0].endsWith(".png")) {
              console.log("png")
              if (meta[i].attributes[attr].textContent.startsWith("//")) {
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
            
            console.log("t",meta[i].attributes[attr].textContent)
            console.log("n",meta[i].attributes[attr].name)
            
          }
        }
      }
      return base+"/favicon.ico"
    }
    function loadImage(theUrl) {
      var img = new Image()
      var canvas = document.getElementById("canvas");
      var imageAsUrl = document.getElementById("imageAsUrl")
      ctx = canvas.getContext("2d")
      var gotIt = false

      img.onload = function () {
        if (!gotIt && img.width > 200) {
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
          
          img.setAttribute('crossOrigin', 'anonymous')
          imageAsUrl.value = canvas.toDataURL("image/jpeg")

        }
     }
     if (!gotIt) {
       img.src = theUrl
     }
    }

    // Put the image URL in Google search.
    getHTML(url, getDoc)
    
  })
})
