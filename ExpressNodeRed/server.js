// Initialize the database
const JSONdb = require('simple-json-db');
const db = new JSONdb('./db.json');

// Initialize the Express server
var http = require('http');
var express = require("express");
const bodyParser = require('body-parser');
var RED = require("node-red");

var request = require('request');
var app = express();
var server = http.createServer(app);

const args = process.argv;
console.log(args)
userdir = args[2];

// Create the settings object - see default settings.js file for other options
var settings = {
    httpAdminRoot:"/red",
    httpNodeRoot: "/api",
    userDir:"../"+userdir,
    flowFile:'flows.json',
    functionGlobalContext: { }    // enables global context
};

// Initialise the runtime with a server and settings
RED.init(server,settings);

// Serve the editor UI from /red
app.use(settings.httpAdminRoot,RED.httpAdmin);

// Serve the http nodes UI from /api
app.use(settings.httpNodeRoot,RED.httpNode);

// Body parser middleware
app.use(bodyParser.json({ extended: true }));

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

app.get('/test',async(req,res)=>{
    var resp = ""
    console.log('test')
    try{
        resp = await prmsRequest('http://192.168.0.200:8000/api/test');
        console.log(resp)
    }
    catch (e){
        console.log(e);
    }
    res.send("Hello");
});

app.get('/',async(req,res)=>{
  var resp = ""
  console.log('server-test')
  res.send("Server OK");
});

let lastFitbitData = "";


app.post('/fitbit',async(req,res)=>{
  let data = {};
  if (db.has("fitbit-" + lastFitbitData)){
    data = db.get("fitbit-" + lastFitbitData);
  } else {
    data = {
      status: "",
      location: {
        latitude: "",
        longitude: ""
      },
      presence: "",
      acceleration: {
        x: "",
        y: "",
        z: ""
      },
      lastSyncTime: "",
      heartRate: "",
      batteryLevel: "",
      charge: ""
    };
  }
 
  let input = req.body;

  if (input.hasOwnProperty("status")) {
    data.status = input.status;
  } else if (input.hasOwnProperty("location")) {
    data.location.latitude = input.location.latitude;
    data.location.longitude = input.location.longitude;
  } else if (input.hasOwnProperty("presence")) {
    data.presence = input.presence;
  } else if (input.hasOwnProperty("acceleration")) {
    data.acceleration.x = input.acceleration.x;
    data.acceleration.y = input.acceleration.y;
    data.acceleration.z = input.acceleration.z;
  } else if (input.hasOwnProperty("lastSyncTime")) {
    data.lastSyncTime = input.lastSyncTime;
  } else if (input.hasOwnProperty("heartRate")) {
    data.heartRate = input.heartRate;
  } else if (input.hasOwnProperty("batteryLevel")) {
    data.batteryLevel = input.batteryLevel;
  } else if (input.hasOwnProperty("charge")) {
    data.charge = input.charge;
  }

  lastFitbitData = new Date().getTime();
  data.timestamp = lastFitbitData;
  console.log(data);
  db.set("fitbit-" + data.timestamp,data);
  res.status(200).send("Data received - Current profile : " + JSON.stringify(data));
});

app.get("/demo",async(req,res)=>{
  let data = {};
  console.log(lastFitbitData);
  if (db.has("fitbit-" + lastFitbitData)){
    data = db.get("fitbit-" + lastFitbitData);
  } else {
    data = {
      error: "No data found"
    }
  }
  res.render(__dirname + "/demo/demo", { info: JSON.stringify(data, null, 2) });
});


server.listen(8000);

// Start the runtime
RED.start();