

//Use javascript array of objects to represent words and their locations
let words = []
words.push({word: "   ", x: 50, y: 50 })

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

    if(data.word.includes("[")){
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

  // Stop propagation of the event // TODO:  stop any default
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
            //words.push({word: "I", x: 50, y: 50 })
            words.push({word: responseObj.wordArray[i][j], x: startingx, y:startingy})
            startingx+=stringWidth(responseObj.wordArray[i][j])+11

            songParaStr+=responseObj.wordArray[i][j]+"  "

          }    
          startingy+=40
          startingx = 10
          songParaStr+="</p>"
        }

        fillSongParagraph(songParaStr)
      }
      else{
        let str = "Not Found: " + responseObj.text
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


/*wrapping for both directions = 
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
  //walk through words and checking for "["
  for (let i = 0; i < words.length; i++) {
    for (let j = 0; j < words[i].word.length; j++) {
      let sharpFlatNote = 2
      if (words[i].word.charAt(j)=="["){
        //console.log("Before: " + words[i].word)
        if(words[i].word.includes("#") || words[i].word.includes("b")){
          sharpFlatNote = 3
        }
        for (let k =0; k<semitones.length;k++) {
          //console.log(words[i].word.substring(1,2))
          if (words[i].word.substring(1,sharpFlatNote)==semitones[k].chord) {
            //console.log(semitones[k].chord)
            //console.log(semitones[(k+1)%12].chord)
            words[i].word = words[i].word.replace(semitones[k].chord, semitones[((k+modeOption)+12)%12].chord)
            //console.log("after replace: "+words[i].word)
            break
          }
        }    
      }
    }
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
