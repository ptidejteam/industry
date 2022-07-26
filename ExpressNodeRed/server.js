// Initialize the database
const JSONdb = require('simple-json-db');
const db = new JSONdb('./db.json');

// Initialize the Express server
var http = require('http');
var express = require("express");
const bodyParser = require('body-parser');
var RED = require("node-red");
const fs = require('fs');
const queryString = require('query-string');

const nodeRedRouter = require('./modules/nodeRedRouter');
const authRouter = require('./modules/authRouter');

var app = express();
var server = http.createServer(app);

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

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Pug template engine init for Demo page
const path = require("path");
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));




app.use('/node-red', nodeRedRouter);
app.use('/auth', authRouter);


app.get('/myflow',async(req,res)=>{
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

app.get('/',async(req,res)=>{
  var resp = ""
  console.log('server-test')
  res.send("Server OK");
});

server.listen(8000);

// Start the runtime
RED.start();
