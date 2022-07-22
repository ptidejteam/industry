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
userdir = args[2];

// Create the settings object - see default settings.js file for other options
var settings = {
    httpAdminRoot:"/red",
    httpNodeRoot: "/api",
    userDir:__dirname+userdir,
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

app.get('/fitbit',async(req,res)=>{
  var resp = ""
  try{
      let resp_str = await prmsRequest('http://192.168.0.200:8000/api/states');
      let resp = JSON.parse(resp_str.data);
  }
  catch (e){
      console.log(e);
  }
  res.send(resp);
});

app.get('/',async(req,res)=>{
  var resp = ""
  console.log('server-test')
  res.send("Server OK");
});

server.listen(8000);

// Start the runtime
RED.start();
