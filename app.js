const express = require("express")
const https = require('https');
const ejs = require('ejs')
const bodyParser = require('body-parser')
require('dotenv').config()

const app = express();
 
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static("public"))


//global variables for access
let recipeDatas = []
let searchName =""

//home route
app.get('/', (req, res) => {
   res.render('home')   
})

//search route where request to api happens
app.get('/search', (req, res, next) => {
  
  const id = process.env.API_ID
  const key = process.env.API_KEY
  const url = `https://api.edamam.com/search?q=${searchName}&app_id=${id}&app_key=${key}`
  
  https.get(url, (resp) => {
    let data = '';
    resp.on('data', (chunk) => {
      data += chunk;
    });
  
    resp.on('end', () => {  
      const dishData = JSON.parse(data)
      recipeDatas = dishData.hits
        res.render('searchResults', {recipeDatas: recipeDatas})
    });
  
  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });
  
})

//post search route for when user enter text in search box
app.post('/search' , (req, res, next) => {
    searchName = req.body.foodName
    res.redirect('/search')
})


//this route is for when user click view on search results
app.get("/search/:foodName", (req, res, next) => {  
    const foodName = req.params.foodName  //requested foodName
    //get the labels from the recipeDatas array
    const labels = recipeDatas.map(r => r.recipe.label)
    //find the index of matching names
    const index = labels.findIndex((l) => l===foodName)
    const ingredientDetails = recipeDatas[index]
   res.render('detail',{ingredientDetails: ingredientDetails})
})

//about route
app.get("/about", (req, res, next) => {
  res.render('about')
})

//if user tries to get unknown page
app.get('*', function(req, res, next) {
  let err = new Error('Page Not Found');
  err.statusCode = 404;
  next(err);
});

//error-handling middleware 
app.use(function(err, req, res, next) {
  let errorMessage = "Sorry, something went wrong"
  if (err.statusCode == 404){
    errorMessage = err.message
  } 
  if (!err.statusCode) {
    err.statusCode = 500; // If err has no specified error code, set error code to 'Internal Server Error (500)'
  }
  res.render('error', {errorMessage: errorMessage})
});

app.listen(process.env.PORT || 3000, () =>
   console.log("server is running on port 3000")
)