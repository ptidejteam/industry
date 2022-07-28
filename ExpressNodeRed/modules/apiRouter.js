var express = require("express");
const prmsRequest = require('./helper');
var path = require('path');
const filterRouter = require("./filterRouter");

// DB config
const JSONdb = require('simple-json-db');
const db_staff = new JSONdb(path.resolve('./database/staff.json')); 
const db_data = new JSONdb(path.resolve('./database/db.json'));

const apiRouter = express.Router();

apiRouter.use("/filter", filterRouter)

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

apiRouter.get('/current-state/:id', async (req,res)=>{
    const id = req.params.id;
    if (db_data.has(id)){
        const currentState = await db_data.get(id);
        res.json({currentState: currentState}).status(200);
    } else {
        res.json({currentState: "undefined"}).status(200);
    }
    return res;
});

module.exports = apiRouter;