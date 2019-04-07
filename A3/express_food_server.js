/*
Example of a "static server implemented with the express framework
and express.js static Middleware.

PREREQUISITES:
install express module using the package.json file with command:
>npm install

TO TEST:
Use browser to view pages at http://localhost:3000/index.html.
*/
const express = require('express')
const logger = require('morgan')// request logger
const app = express()
let qstring = require('querystring')
const https = require('https')
const url = require('url')

const PORT = process.env.PORT || 3000
const ROOT_DIR = '/public' //root directory for our static pages
const API_KEY = '98510a94807fd52127fba87095533917'
//const API_KEY = '324b719af5fcd394bd14d3c07eebf479' secondary key

//Middleware
//use morgan logger to keep request log files
app.use( logger('dev'))

app.use(express.static(__dirname + ROOT_DIR )) //provide static server

//Routes
app.post('/getRecipes', function (req, res) {
  let reqData = ''
    req.on('data', function(chunk) {
      reqData += chunk
    })
    req.on('end', function() {
      let queryIngredient = JSON.parse(reqData);
      console.log("reqData:"+ queryIngredient);
      console.log("text: "+ queryIngredient.text)
      getRecipes(queryIngredient.text, res)
    })  
  
})

app.get('*', function(req,res){
  
    res.sendFile(__dirname + ROOT_DIR +"/recipes.html")
  
})

//start server
app.listen(PORT, err => {
  if (err) console.log(err)
  else {
    console.log(`Server listening on port: ${PORT} CNTL-C to Quit`)
    console.log('To Test')
    console.log('http://localhost:3000')
    console.log('http://localhost:3000/')
    console.log('http://localhost:3000/index.html')
    console.log('http://localhost:3000/recipes.html')
    console.log('http://localhost:3000/recipes')
  }
})

function sendResponse(foodData, res) {
  if (foodData) {
    page = foodData
  }
  console.log("foodData: "+foodData)
  res.end(foodData);
  
}

function parseData(apiResponse, res) {
  let foodData = ''
  apiResponse.on('data', function(chunk) {
    foodData += chunk
  })
  apiResponse.on('end', function() {
    sendResponse(foodData, res)
  })
}

function getRecipes(ingredient, res){

    //You need to provide an appid with your request.
    //Many API services now require that clients register for an app id.
     
      const options = {
         host: 'www.food2fork.com',
         path: `/api/search?q=${ingredient}&key=${API_KEY}`
      }
      https.request(options, function(apiResponse){
        parseData(apiResponse, res)
      }).end()
    } 