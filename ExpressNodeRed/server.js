// Initialize the database
const JSONdb = require('simple-json-db');
const db = new JSONdb('./db.json');
const db_auth = new JSONdb('./db_pwd.json');
// Initialize the Express server
var http = require('http');
var express = require("express");
const bodyParser = require('body-parser');
var RED = require("node-red");

const passport = require('passport')
const session = require('express-session')
const LocalStrategy = require('passport-local').Strategy
var request = require('request');

var app = express();
var server = http.createServer(app);

const args = process.argv;
userdir = args[2];







app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


// passport
app.use(session({
  secret: "secret",
  resave: false ,
  saveUninitialized: true 
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(
  (username, password, done) => {
      let reel_password = db_auth.get(username);
      console.log("rpwd = " + reel_password);
      if (reel_password != password){
        console.log('failes auth')
        return done(null, false);
      } 
      else{
        console.log('auth ok')
        let authenticated_user = { "id": username};
        return done (null, authenticated_user);
      }  
  },
));

passport.serializeUser( (userObj, done) => {console.log("oooo");done(null, userObj)});
passport.deserializeUser((userObj, done) => {
  console.log('desere');
  done (null, userObj )});



checkAuthenticated = (req, res, next) => {
  console.log("auth...")
  if (req.isAuthenticated()) { return next() }
  res.redirect("/login")
}



// NODE RED
var settings = {
  httpAdminRoot:"/red",
  httpNodeRoot: "/#/api",
  userDir: __dirname + "/../flows",
  flowFile:'flows.json',
  functionGlobalContext: { }    // enables global context
};

RED.init(server,settings);
//app.use(settings.httpNodeRoot,RED.httpNode);
app.use("/red",checkAuthenticated,RED.httpAdmin);







// Pug template engine init for Demo page


const path = require("path");
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));


function prmsRequest(url){
    return new Promise(function (resolve, reject) {
        request(url, function (error, res, body) {
          if (res.statusCode == 200) {
            resolve(body);
          } else {
            console.log('wrongStatus :' + res.statusCode )
            reject(error);
          }
        });
    })
}





/****tempalte */
app.get('/profile/:id',checkAuthenticated,
(req,res,next)=>{
  if(req.params.id === req.user.id){ //the id in the url ==== the id of the session
    res.send('error');
  }
  return next();
},
(req,res)=>{
  res.sendFile("profile.html");
});


app.get('/login', async(req,res)=>{
  res.sendFile(__dirname + 'login.html');
})
/*****/

app.post('/login',
  passport.authenticate('local', { failureRedirect: '/login', failureMessage: true }),
  function(req, res) {
    res.redirect('/profile'+req.user.id);
  });



/*     server as API     */
app.get('/api/states',async(req,res)=>{
  var resp = ""
  try{
      var resp_str = await prmsRequest('http://localhost:8000/api/states');
      resp = JSON.parse(resp_str).data;
  }
  catch (e){
      console.log(e);
  }
  res.send(resp);
});

app.get('/fitbit',async(req,res)=>{
  var resp = ""
  try{
      resp = await prmsRequest('http://localhost:8000/api/fitbit');
  }
  catch (e){
      console.log(e);
  }
  res.send(resp);
});

app.get('/',async(req,res)=>{
  res.send("/");
});

server.listen(8000);

// Start the runtime
RED.start();
