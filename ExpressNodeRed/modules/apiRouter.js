var express = require("express");
const prmsRequest = require('./helper');

// DB config
const JSONdb = require('simple-json-db');
const db_staff = new JSONdb('../database/staff.json');

const apiRouter = express.Router();


apiRouter.get('/pp/:pp',async(req,res)=>{
    res.sendFile("/pp/" + req.params.pp, {'root': __dirname + "/.."});
});

apiRouter.get('/states',async(req,res)=>{
  let states = {};
  try{
      states = db_staff.JSON();
  }
  catch (e){
      console.log(e);
  }
  res.send(states).status(200);
});

  
module.exports = apiRouter;