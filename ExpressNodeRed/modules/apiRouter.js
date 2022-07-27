var express = require("express");

// DB config
const JSONdb = require('simple-json-db');

const apiRouter = express.Router();


apiRouter.get('/pp/:pp',async(req,res)=>{
    res.sendFile("/pp/" + req.params.pp, {'root': __dirname + "/.."});
  });

apiRouter.get('/states',async(req,res)=>{
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
  
module.exports = apiRouter;