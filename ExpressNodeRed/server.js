// ----------- IMPORTS -----------

// Imports for JSON database management
const JSONdb = require('simple-json-db');
//const db = new JSONdb('./db.json');
const db_auth = new JSONdb('./database/credentials.json');
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

// Import dotvenv file
require('dotenv').config();
const config = process.env

// Other Imports
const fs = require('fs');

// Import custom modules
const apiRouter = require('./modules/apiRouter');
const prmsRequest = require('./modules/helper');

// -------------------------------

// Initialize the Express server
var app = express();
var server = http.createServer(app);

app.use(function (req, res, next) {
  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

  // Pass to next layer of middleware
  next();    
});

// Body parser middleware config
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Use custom modules
app.use('/node-red', nodeRedRouter);
app.use('/api', apiRouter);

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
        if (reel_password != password){
            console.log('Failed to authorize : ' + username);
            return done(null, false);
        } 
        else{
            console.log('Authorized : ' + username);
            let authenticated_user = { "id": username};
            return done (null, authenticated_user);
        }  
    }
));

passport.serializeUser( (userObj, done) => {
    done(null, userObj)
});

passport.deserializeUser((userObj, done) => {
    done (null, userObj )
});

checkAuthenticated = (req, res, next) => {
    console.log("Authenticating for access to " + req.originalUrl + "...")
    if (req.isAuthenticated()) { 
        console.log("Authentication done for access to " + req.originalUrl);
        return next(); 
    }
    res.redirect("/login")
}


// Node-RED config
var settings = {
    httpAdminRoot:"/red",
    httpNodeRoot: "/#/api",
    userDir: __dirname + "/../flows",
    flowFile:'flows.json',
    editorTheme: {
    tours: false,
    },
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
    passport.authenticate('local', { failureMessage: "true" }),
    async (req, res) => {
        res.redirect('/profile/' + req.user.id);
    }
);

app.post('/logout', function(req, res){
    req.logout(function(err) {
    if (err) { return next(err); }
        res.redirect('/login');
    });
});

app.get('/myflow', checkAuthenticated, async(req,res)=>{
    //const id = req.user.id;
    // TEMP LINE //
    const id = "Get Fitbit Profile";
    // --------- //
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
        if (req.params.id !== req.user.id){ //the id in the url ==== the id of the session
            res
            .send('Action forbidden: You can only access your own profile.')
            .status(403);
        }
        else {
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
            "id": req.params.id,
            "default": teacher.default,
            "tracking": teacher.tracking
        }); 
    }
);

app.post('/update-states', checkAuthenticated, function(req, res) {
    const id = req.user.id;
    const states = req.body.states;
    const defaults = req.body.default;
    if (!db_staff.has(id)) {
        res.send("No user found").status(404);
    }
    else {
        const user = db_staff.get(id);
        user.states = states;
        user["default"] = defaults;
        db_staff.set(id, user);
        res.send("OK").status(200);
    }
    return res;
});


app.post('/tracker/update', checkAuthenticated, function(req, res) {
    const id = req.user.id;
    const state = req.body.state;
    if (!db_staff.has(id)) {
        res.send("No user found").status(404);
    }
    else {
        const user = db_staff.get(id);
        user.tracking = state;
        db_staff.set(id, user);
        res.json({new: state}).status(200);
    }
    return res;
});

app.get('/', checkAuthenticated, (req,res) => {
    res.redirect("/profile/" + req.user.id);
});

app.get('/error/:code', async(req,res)=>{
    const code = req.params.code;
    const message = req.query.msg || "An error has occurred. Please report it to an administrator.";
    res.render(__dirname + '/pages/error.html', {
        "code": code,
        "msg": message
    });
});

app.get('*', function(req, res){
    res.redirect("/error/404?msg=Page not found.");
});

// Start the server
console.log('\x1b[33m%s\x1b[0m', "Starting server on port " + config.PORT + "...");
console.log("");
server.listen(config.PORT);

// Start the Node-RED runtime
console.log('\x1b[33m%s\x1b[0m', "Starting Node-RED runtime...");
RED.start();
