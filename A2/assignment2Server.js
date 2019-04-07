let songs = []
/*songs.push("Peaceful Easy Feeling")
songs.push("Sister Golden Hair")
songs.push("Brown Eyed Girl")
songs.push("Never My Love")*/



//Server Code
const http = require("http"); //need to http
const fs = require("fs"); //need to read static files
const url = require("url"); //to parse url strings

const ROOT_DIR = "html"; //dir to serve static files from

const MIME_TYPES = {
  css: "text/css",
  gif: "image/gif",
  htm: "text/html",
  html: "text/html",
  ico: "image/x-icon",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  js: "application/javascript",
  json: "application/json",
  png: "image/png",
  svg: "image/svg+xml",
  txt: "text/plain"
}

const get_mime = function (filename) {
  //Use file extension to determine the correct response MIME type
  for (let ext in MIME_TYPES) {
    if (filename.indexOf(ext, filename.length - ext.length) !== -1) {
      return MIME_TYPES[ext]
    }
  }
  return MIME_TYPES["txt"]
}

http.createServer(function (request, response) {
  var urlObj = url.parse(request.url, true, false)
  console.log("\n============================")
  console.log("PATHNAME: " + urlObj.pathname)
  console.log("REQUEST: " + ROOT_DIR + urlObj.pathname)
  console.log("METHOD: " + request.method)

  var receivedData = ""

  //Event handlers to collect the message data
  request.on("data", function (chunk) {
    receivedData += chunk;
  })

  //Event handler for the end of the message
  request.on("end", function () {
    console.log("received data: ", receivedData)
    console.log("type: ", typeof receivedData)

    //check songs directory for any new song files
    fs.readdir(ROOT_DIR + "/songs/", function (err,files){
      if(err) throw err;
      else{
        songs = files
        //console.log(files)
        //console.log(songs)
      }
    

    //if it is a POST request then echo back the data.
    if (request.method == "POST") {
      //Handle POST requests
      var dataObj = JSON.parse(receivedData)
      console.log("received data object: ", dataObj)
      console.log("type: ", typeof dataObj)

      //return the words array that the client requested
      //if it exists
      console.log("USER REQUEST: " + dataObj.text)
      var returnObj = {}

    if(dataObj.type == "songFile"){
      console.log("USER REQUEST TYPE: "+ dataObj.type)

      if (songs.includes(dataObj.text+".txt")) {
        returnObj.isFound = true
        let songLines = ""
        let rawSongData

        fs.readFile(ROOT_DIR + "/songs/" + dataObj.text + ".txt", function (err, data) {
          if (err) throw err
          else {
            rawSongData = data.toString()
            //songLines = chordPro(rawSongData)
            //add spaces before and after chords [?]
           for (let i = 0; i < rawSongData.length; i++) {

              if (rawSongData.charAt(i) == "[") {
                songLines += " ["
              } else if (rawSongData.charAt(i) == "]") {
                songLines += "] "
              } else {
                songLines += rawSongData.charAt(i)
              }
            }
            //split based on "\n"
            songLines = songLines.split("\n")

            //split based on " "
            for (i = 0; i < songLines.length; i++) {
              songLines[i] = songLines[i].split(" ")
            }
            //console.log(songLines)

            returnObj.wordArray = songLines
            //object to return to client
            response.writeHead(200, {
              "Content-Type": MIME_TYPES["txt"]
            })
            response.end(JSON.stringify(returnObj)) //send just the JSON object as plain text
          }
        });



      } else {
        returnObj.isFound = false
        returnObj.text = dataObj.text

        //object to return to client
        response.writeHead(200, {
          "Content-Type": MIME_TYPES["txt"]
        })
        response.end(JSON.stringify(returnObj)) //send just the JSON object as plain text
      }
    }//if statement for dataOBJ.type == songFile ending brace
    if(dataObj.type == "save"){
      console.log("USER REQUEST TYPE: "+ dataObj.type)

      //OVERWRITE FILE
      if(songs.includes(dataObj.text+".txt")){
        fs.writeFile(ROOT_DIR + "/songs/" + dataObj.text + ".txt",dataObj.updatedSongData,function(err , data){
          if(err) throw err
          else{
            console.log("Save Successful!\n\tFile "+dataObj.text+" was overwriten with updated song data")
          }
          returnObj.saveStatus = "successful"
          returnObj.text = dataObj.text
          response.writeHead(200, {
            "Content-Type": MIME_TYPES["txt"]
          })
          response.end(JSON.stringify(returnObj)) //send just the JSON object as plain text
        })
       
        
      }
      //CREATE NEW FILE
      else if(!songs.includes(dataObj.text+".txt")){
        fs.writeFile(ROOT_DIR + "/songs/" + dataObj.text + ".txt",dataObj.updatedSongData,function(err , data){
          if(err) throw err
          else{
            console.log("Save Successful!\n\tNew file "+dataObj.text+" was created with song data")
            //have to add to songs[] arrays because new file was created
            //songs.push(dataObj.text)
          }
          returnObj.saveStatus = "successful"
          returnObj.text = dataObj.text
          response.writeHead(200, {
            "Content-Type": MIME_TYPES["txt"]
          })
          response.end(JSON.stringify(returnObj)) //send just the JSON object as plain text
        })
      }
      //WRITEFILE FAILURE
      else{
        console.log("Save Failure!\n\t"+dataObj.text)
        returnObj.saveStatus = "failure"
        returnObj.text = dataObj.text
        response.writeHead(200, {
          "Content-Type": MIME_TYPES["txt"]
        })
        response.end(JSON.stringify(returnObj)) //send just the JSON object as plain text
      
      }

    }//if statement for dataOBJ.type == save ending brace

    }//if statement for POST

    if (request.method == "GET") {
      //Handle GET requests
      //Treat GET requests as request for static file
      var filePath = ROOT_DIR + urlObj.pathname
      if (urlObj.pathname === "/") filePath = ROOT_DIR + "/index.html"

      fs.readFile(filePath, function (err, data) {
        if (err) {
          //report error to console
          console.log("ERROR: " + JSON.stringify(err))
          //respond with not found 404 to client
          response.writeHead(404)
          response.end(JSON.stringify(err))
          return
        }
        //respond with file contents
        response.writeHead(200, {
          "Content-Type": get_mime(filePath)
        })
        response.end(data)
      })
    }
  });//READDIR callback
  })//ON callback
}).listen(3000)//CREATESERVER callback

console.log("Server Running at PORT 3000  CNTL-C to quit")
console.log("To Test:")
console.log("http://localhost:3000/assignment2.html")