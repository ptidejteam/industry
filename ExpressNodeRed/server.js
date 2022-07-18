var http = require('http');
var express = require("express");
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


server.listen(8000);

// Start the runtime
RED.start();