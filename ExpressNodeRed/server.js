// ----------- IMPORTS -----------

// Imports for JSON database management
const JSONdb = require('simple-json-db');
//const db = new JSONdb('./db.json');
const db_auth = new JSONdb('./database/db_auth.json');
const db_staff = new JSONdb('./database/staff.json');

// Imports for Web Server management
var http = require('http');
var express = require("express");
const bodyParser = require('body-parser');
const queryString = require('query-string');
var path = require('path');
// Import for Node-RED management
var RED = require("node-red");

// Import for Mustache management
const mustacheExpress = require('mustache-express');

// Other Imports
const fs = require('fs');

// Import custom modules
const nodeRedRouter = require('./modules/nodeRedRouter');
const authRouter = require('./modules/authRouter');
const prmsRequest = require('./modules/helper');

// -------------------------------

// Initialize the Express server
var app = express();
var server = http.createServer(app);

// Body parser middleware config
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Use custom modules
app.use('/node-red', nodeRedRouter);
//app.use('/auth', authRouter);

// Passport config
const passport = require('passport');
const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy

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
  }
));

passport.serializeUser( (userObj, done) => {
  console.log("oooo");done(null, userObj)
});

passport.deserializeUser((userObj, done) => {
  console.log('desere');
  done (null, userObj )
});

checkAuthenticated = (req, res, next) => {
  console.log("auth...")
  if (req.isAuthenticated()) { return next() }
  res.redirect("/login")
}


// Node-RED config

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

// Mustache config
app.engine('html', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', __dirname + '/pages');

// Static files config
app.use(express.static(__dirname + '/static'));

// API Routes
app.get('/login', async (req,res) => {
  res.sendFile(path.resolve('./pages/login.html'));
})

app.post('/login',
  passport.authenticate('local', { failureRedirect: '/login', failureMessage: true }),
  async (req, res) => {
      res.redirect('/profile/' + req.user.id);
});

app.get('/myflow', checkAuthenticated, async(req,res)=>{
  const params = queryString.parse(req.url.split('?')[1]);
  const id = params["id"];
  try {
    const rawFlows = fs.readFileSync(__dirname + '/../flows/flows.json');
    const flows = JSON.parse(rawFlows);
    const flow = flows.filter(it => it.name === id)
    const type = flow[0].type;
    const flowId = type.split(":")[1];
    res.json({id: flowId}).status(200);
  }
  catch (e) {
    res.status(404).send(e);
  }

  return res;
});

app.get('/profile/:id', checkAuthenticated,
  async (req,res,next)=>{
    if(req.params.id !== req.user.id){ //the id in the url ==== the id of the session
      res
        .send('Action forbidden: You can only access your own profile.')
        .status(403);
    }
    else{
      return next();
    }
  },
  async (req,res)=>{
    var teacher = await db_staff.get(req.params.id);
    Object.keys(teacher.states).forEach(key => {
        teacher.states[key].id = key;
    });

    res.render(__dirname + '/pages/profile.html', {
      "pp": teacher.pp, 
      "name": teacher.firstName + " " + teacher.lastName,
      "states": Object.values(teacher.states),
      "id": req.params.id
  }); 
});

app.get('/dashboard', checkAuthenticated,
  async (req, res) => {
  let all_states = await prmsRequest("http://" + config.NODE_RED_EXPRESS + "/states");
  all_states = JSON.parse(all_states);
  console.log(all_states)
  let arrayDB = Object.values(db.JSON());
  console.log(arrayDB);
  arrayDB.forEach(e => {
      
      //reduce first name
      if(e.firstName.includes(" ")){
          fn = e.firstName.split(' ')
          fn = fn.reduce((a,aa)=>{return (  a + "." + aa[0]) },"");
          e.firstName = fn.slice(1);
      }
      
      if(all_states[e.id]){
          state = all_states[e.id];
          console.log(state)
          e.st_msg = e.states[state].msg;
          e.st_color = e.states[state].color;
      }
      else{
          e.status = "undefined";
          e.state = "";
      }
  });
  console.log(arrayDB);
  res.render(__dirname + '/pages/home.html', {"articles":arrayDB});
});



/*     server as API     */

app.get('/api/pp/:pp',async(req,res)=>{
  res.sendFile(__dirname + "/pp/" + req.params.pp);
});
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

app.get('/', checkAuthenticated,
  async(req,res)=>{
    res.redirect("/dashboard");
});

app.get('/error/:code',
  async(req,res)=>{
    const code = req.params.code;
    const message = req.body.msg || "An error has occurred";
    console.log(code);
    console.log(message);
    res.render(__dirname + '/pages/error.html', {
      "code": code,
      "msg": message
    });
});

server.listen(8000);

// Start the runtime
RED.start();
