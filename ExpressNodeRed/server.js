var http = require('http');
var express = require("express");
var RED = require("node-red");

var request = require('request');

let bodyParser = require('body-parser');


var app = express();
var server = http.createServer(app);

app.use(bodyParser());
const args = process.argv;
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




app.get('/fit',async(req,res)=>{
  var resp = ""
  try{
      resp = await prmsRequest('http://localhost:8000/api/fit');
  }
  catch (e){
      console.log(e);
  }
  res.send(JSON.parse(resp).value);
});


server.listen(8000);

// Start the runtime
RED.start();