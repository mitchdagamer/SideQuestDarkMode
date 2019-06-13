var currentPath = "./storage/self/primary"
var pastPath;
function listFiles(){
  const {app, BrowserWindow, Menu} = require('electron');
            var x = ""
  var Promise = require('bluebird')
  var client = adb.createClient()
  var myNode = document.getElementById("songList");
while (myNode.firstChild) {
    myNode.removeChild(myNode.firstChild);
}
client.listDevices()
  .then(function(devices) {
    return Promise.map(devices, function(device) {
      return client.readdir(device.id, currentPath)
        .then(function(files) {
          // Synchronous, so we don't have to care about returning at the
          // right time
          if(!files){
            document.querySelector("#songList").innerHTML = "Uh no. Nothing here!"
          }
          files.forEach(function(file) {
            if (file.isFile()) {
              if(file.name.includes(".mp4")){var i = "video_library"}else if(file.name.includes(".jpg")){var i = "photo"}
              document.querySelector("#songList").insertAdjacentHTML('beforeend',`<li class="collection-item avatar" type="not">
                  <i class="material-icons circle green">${i}</i>
                  <span class="title">${file.name}</span>
                  <p>${Math.round(Number(Number(file.size)/1000000))} MB<br>
                  </p>
                  <a href="#!" class="secondary-content"><i class="material-icons">file_download</i></a>
                </li>`);
            }else{
              document.querySelector("#songList").insertAdjacentHTML('beforeend',`<li onclick="updatePath('${file.name}')"class="collection-item avatar" type="not">
                  <i class="material-icons circle green">folder</i>
                  <span class="title">${file.name}</span>
                </li>`)
            }
          })

        })
    })
  })
  .then(y = x)
  .catch(function(err) {
    console.error('Something went wrong:', err.stack)
  })
    console.log(x)
}
function updatePath(path){

  var myNode = document.getElementById("songList");
while (myNode.firstChild) {
    myNode.removeChild(myNode.firstChild);
}
var myNode = document.getElementById("fileTree");
while (myNode.firstChild) {
  myNode.removeChild(myNode.firstChild);
}
  var Promise = require('bluebird')
  var adb = require('adbkit')
  var client = adb.createClient()
  currentPath = currentPath + "/" + path
  var b = currentPath.replace("./storage/self/primary","")
  var b = b.split('/')
  b[0] = "Quest"
  var i;
  for(i in b){
    if(i === 0){
      document.querySelector("#fileTree").insertAdjacentHTML('beforeend',`<a href="#!" onclick="('/')" class="breadcrumb">Home</a>`)
    }else {
      document.querySelector("#fileTree").insertAdjacentHTML('beforeend',`<a href="#!" class="breadcrumb">${b[i]}</a>`)
    }
  }
  client.listDevices()
    .then(function(devices) {
      return Promise.map(devices, function(device) {
        return client.readdir(device.id, currentPath)
          .then(function(files) {
            // Synchronous, so we don't have to care about returning at the
            // right time
            files.forEach(function(file) {
              if (file.isFile()) {
              if(file.name.includes(".mp4")){var i = "video_library"}else if(file.name.includes(".jpg")){var i = "photo"}
              document.querySelector("#songList").insertAdjacentHTML('beforeend',`<li class="collection-item avatar" type="not">
                  <i class="material-icons circle green">${i}</i>
                  <span class="title">${file.name}</span>
                  <p>${Math.round(Number(Number(file.size)/1000000))} MB<br>
                  </p>
                  <a href="#!" class="secondary-content"><i class="material-icons">file_download</i></a>
                </li>`);
            }else{
              document.querySelector("#songList").insertAdjacentHTML('beforeend',`<li class="collection-item avatar" onclick="updatePath('${file.name}')"type="not">
                  <i class="material-icons circle green">folder</i>
                  <span class="title">${file.name}</span>
                </li>`)
            }
            })
          })
      })
    })
    .catch(function(err) {
      console.error('Something went wrong:', err.stack)
    })
}
