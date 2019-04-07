

//Use javascript array of objects to represent words and their locations
let words = []
words.push({word: "   ", x: 50, y: 50, type: "lyric" })

semitones = []//"A","A#","B","C","C#","D","D#","E","F","F#","G","G#"
semitones.push({chord:"A"})
semitones.push({chord:"A#", flat:"Bb"})
semitones.push({chord:"B"})
semitones.push({chord:"C"})
semitones.push({chord:"C#", flat:"Db"})
semitones.push({chord:"D"})
semitones.push({chord:"D#", flat:"Eb"})
semitones.push({chord:"E"})
semitones.push({chord:"F"})
semitones.push({chord:"F#", flat:"Gb"})
semitones.push({chord:"G"})
semitones.push({chord:"G#", flat:"Ab"})

let wordBeingMoved
let wordWidth

let deltaX, deltaY //location where mouse is pressed
const canvas = document.getElementById('canvas1'); //our drawing canvas

function getWordAtLocation(aCanvasX, aCanvasY) {

  for (let i = 0; i < words.length; i++) {
    wordWidth =  stringWidth(words[i].word)
    //console.log("wordWidth = " + wordWidth)
    
    if (Math.abs(words[i].x - aCanvasX ) < wordWidth &&
      Math.abs(words[i].y - aCanvasY) < 20) return words[i]

  }
  return null
}

//takes a string and returns the width of that string
function stringWidth(str){
  let context = canvas.getContext('2d')
  return context.measureText(str).width;
}

function drawCanvas() {

  let context = canvas.getContext('2d')

  context.fillStyle = 'white'
  context.fillRect(0, 0, canvas.width, canvas.height) //erase canvas

  for (let i = 0; i < words.length; i++) {
    let data = words[i]

    
      if (data.type == "chord") {
        context.font = '15pt Arial'
        context.fillStyle = 'blue'
        
      }
      else{
        context.font = '15pt Arial'
        context.fillStyle = 'black'
       
      }
    
    context.fillText(data.word, data.x, data.y);

  }
  context.stroke()
}

function handleMouseDown(e) {

  //get mouse location relative to canvas top left
  let rect = canvas.getBoundingClientRect()
  //var canvasX = e.clientX - rect.left
  //var canvasY = e.clientY - rect.top
  let canvasX = e.pageX - rect.left //use jQuery event object pageX and pageY
  let canvasY = e.pageY - rect.top
  console.log("mouse down:" + canvasX + ", " + canvasY)

  wordBeingMoved = getWordAtLocation(canvasX, canvasY)
  //console.log(wordBeingMoved.word)
  if (wordBeingMoved != null) {
    deltaX = wordBeingMoved.x - canvasX
    deltaY = wordBeingMoved.y - canvasY
    //document.addEventListener("mousemove", handleMouseMove, true)
    //document.addEventListener("mouseup", handleMouseUp, true)
    $("#canvas1").mousemove(handleMouseMove)
    $("#canvas1").mouseup(handleMouseUp)

  }

  // Stop propagation of the event 
  //stop any default
  // browser behaviour

  e.stopPropagation()
  e.preventDefault()

  drawCanvas()
}

function handleMouseMove(e) {

  console.log("mouse move")

  //get mouse location relative to canvas top left
  let rect = canvas.getBoundingClientRect()
  let canvasX = e.pageX - rect.left
  let canvasY = e.pageY - rect.top

  wordBeingMoved.x = canvasX + deltaX
  wordBeingMoved.y = canvasY + deltaY

  e.stopPropagation()

  drawCanvas()
}

function handleMouseUp(e) {
  console.log("mouse up")

  e.stopPropagation()

  //remove mouse move and mouse up handlers but leave mouse down handler
  $("#canvas1").off("mousemove", handleMouseMove) //remove mouse move handler
  $("#canvas1").off("mouseup", handleMouseUp) //remove mouse up handler

  drawCanvas() //redraw the canvas
}

const ENTER = 13

function handleKeyUp(e) {
  console.log("key UP: " + e.which)

  if (e.which == ENTER) {
    handleSubmitButton() //treat ENTER key like you would a submit
    //$('#userTextField').val('') //clear the user text field
  }

  e.stopPropagation()
  e.preventDefault()
}

function handleSubmitButton() {

  let userText = $('#userTextField').val(); //get text from user text input field
  if (userText && userText != '') {

    //user text was not empty
    let userRequestObj = {
      type: "songFile",
      text: userText
    } //make object to send to server
    let userRequestJSON = JSON.stringify(userRequestObj) //make JSON string
    $('#userTextField').val('') //clear the user text field

    //Prepare a POST message for the server and a call back function
    //to catch the server repsonse.
    //alert ("You typed: " + userText)
    $.post("userText", userRequestJSON, function(data, status) {
      console.log("data: " + data)
      console.log("typeof: " + typeof data)
      let responseObj = JSON.parse(data)
      words = []
      if(responseObj.isFound){
        //console.log(responseObj.wordArray)
        
        let songParaStr = ""

        let startingx = 10
        let startingy = 20
        for (let i = 0; i < responseObj.wordArray.length; i++) {
          songParaStr+="<p>"
          for (let j = 0; j < responseObj.wordArray[i].length; j++) {
            //words.push({word: "   ", x: 50, y: 50, type: "lyric" })
            //TODO:: fix spacing on longer chords
            if(responseObj.wordArray[i][j].includes("[")){
              songParaStr+=responseObj.wordArray[i][j]+"  "
              
              let temp = responseObj.wordArray[i][j].slice(responseObj.wordArray[i][j].indexOf("["),responseObj.wordArray[i][j].indexOf("]",responseObj.wordArray[i][j].indexOf("[")));
              temp = temp.replace("[","");

              if(temp.length>4){
                words.push({word: temp, x: startingx+10, y: startingy-20, type: "chord"})
              }
              else{
                words.push({word: temp, x: startingx-10, y: startingy-20, type: "chord"})
              }
            }
            else{
              words.push({word: responseObj.wordArray[i][j], x: startingx, y:startingy, type: "lyric"})
              startingx+=stringWidth(responseObj.wordArray[i][j])+11

              songParaStr+=responseObj.wordArray[i][j]+"  "
            }

          }    
          startingy+=60
          startingx = 10
          songParaStr+="</p>"
        }

        fillSongParagraph(songParaStr)
      }
      else{
        let str = "File Not Found: " + responseObj.text
        //console.log(str)
        fillSongParagraph(" ")
      }
    })
  }
}

function fillSongParagraph(str){
  let textDiv = document.getElementById("songParagraph")
  textDiv.innerHTML = str
}

/* wrapping for both directions = 
((chord index + transpose amount(+1 or -1)) + 12)% 12
((k+modeOption)+12)%12
*/
function handleTranspose(mode) {
  console.log("Transpose: "+mode)
  let modeOption
  if (mode=='up') {
    modeOption = 1
  }
  else if(mode=='down'){
    modeOption = -1
  }
  //walk through words and checking type chord
  for (let i = 0; i < words.length; i++) {
      let sharpFlatNote = 1
      
      if (words[i].type==="chord"){
      
        //console.log("Before: " + words[i].word)
        if(words[i].word.includes("#") || words[i].word.includes("b")){
          sharpFlatNote = 2
        }

        if(words[i].word.includes("/")){
          for(let j =0;j<semitones.length;j++){

            if (words[i].word.substring(words[i].word.indexOf("/")+1,words[i].word.length)==semitones[j].chord) {
              words[i].word = words[i].word.replace(semitones[j].chord,semitones[((j+modeOption)+12)%12].chord)
              break
            }
          }
        }

        for (let k =0; k<semitones.length;k++) {
          //console.log(words[i].word)
          if (words[i].word.substring(0,sharpFlatNote)==semitones[k].chord) {
            words[i].word = words[i].word.replace(semitones[k].chord, semitones[((k+modeOption)+12)%12].chord)
            break
          }
          else if (words[i].word.substring(0,sharpFlatNote)==semitones[k].flat) {
            words[i].word = words[i].word.replace(semitones[k].flat,semitones[((k+modeOption)+12)%12].chord)
            break
          }
          //console.log("after replace: "+words[i].word)
          }
      }    
  }
}

function changeChordsY (delta){
  for (let i = 0; i < words.length; i++) {
    if (words[i].type == "chord") {
      words[i].y+=delta;
    }
    
  }
}

function fixSongYSpacing (){
  //caluclate delta, subtract delta and add 60 to move to new line
  let delta = 0
  for (let i = 0; i < words.length; i++) {
  
    //delta=word[i].y-20%60==0,
    if (words[i].type == "lyric" && (words[i].y-20)%60!=0) {
      delta = (words[i].y-20)%60
      words[i].y = words[i].y-delta+60
    }
    //delta=word[i].y%60==0,
    else if(words[i].type == "chord" && (words[i].y)%60!=0){
      delta = (words[i].y)%60
      words[i].y = words[i].y-delta+60
    }
    
  }
}


function handleRefresh() {
  /* subtract y from chords to equal same y a lyrics then sort
   then create string 
   add y offset back to all chords
  might not need to add the chords to a temp list*/

  fixSongYSpacing()
  changeChordsY(20)
  words.sort(function (a,b){
    if(a.y===b.y){
      return a.x - b.x;
    }
    else{
      return a.y - b.y
    }
  });
  changeChordsY(-20)

  let str = "<p>"
  for(let i=0;i<words.length;i++){

    
    if(words[i].type=="chord"){
      str+="["+ words[i].word +"]"
    }
    else{
      //TODO:: fix newines by getting list without chords for this way to work
      str+=words[i].word+" "
      if(i<words.length-1 && (words[i].y!=words[i+1].y && words[i+1].type!="chord")){
        str+="</p><p>"
    
      }
    }
  }
  str+="</p>"
  fillSongParagraph(str);
  console.log(str)
  return str;
}


function handleSaveAs() {
  //call refresh
  let str = handleRefresh();
  //console.log(str)
  let userText = $('#userTextField').val(); //get text from user text input field
  if (userText && userText != '') {
    $('#userTextField').val('') //clear the user text field

    for (let i = 0; i < str.length; i++) {
      if(str.charAt(i)=="<"){
        
        str=str.replace("<p>","");
        str=str.replace("</p>","\n");
        
      }
    }


    //user text was not empty
    let userSaveRequestObj = {
      type: "save",
      text: userText,
      updatedSongData: str
    } //make object to send to server
    let userSaveRequestJSON = JSON.stringify(userSaveRequestObj) //make JSON string
    
    //Prepare a POST message for the server and a call back function
    //to catch the server repsonse.
    //alert ("You typed: " + userText)
    $.post("userText", userSaveRequestJSON, function(data, status) {
      console.log("data:" + data)
      console.log("typeof: " + typeof data)
      let responseObj = JSON.parse(data)
      console.log("Save Status: "+responseObj.saveStatus+"\nfor "+responseObj.text)

    });
  }
}



function handleTimer() {

    drawCanvas()
}

$(document).ready(function() {
  //This is called after the broswer has loaded the web page

  //add mouse down listener to our canvas object
  $("#canvas1").mousedown(handleMouseDown)

  //add key handler for the document as a whole, not separate elements.
  $(document).keyup(handleKeyUp)

  timer = setInterval(handleTimer, 100)

  drawCanvas()
})
