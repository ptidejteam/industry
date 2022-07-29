var express = require("express");
const prmsRequest = require('./helper');
var path = require('path');
const filterRouter = require("./filterRouter");

// DB config
const JSONdb = require('simple-json-db');

// Import dotvenv file
require('dotenv').config();
const config = process.env;

//Ipfilter config
const ipfilter = require('express-ipfilter').IpFilter;
const ipfilterConfig = {
    mode: "allow",
    logLevel: "deny"
};
const authorizedIPs = [config.REMOTE_WEBSERVER_IP];

const apiRouter = express.Router();

apiRouter.use("/filter", filterRouter)

apiRouter.get('/pp/:pp',async(req,res)=>{
    res.sendFile("/pp/" + req.params.pp, {'root': __dirname + "/.."});
});

apiRouter.get('/states', ipfilter(authorizedIPs, ipfilterConfig), async(req,res)=>{
    const db_staff = new JSONdb('./database/staff.json');
    let states = {};
    try{
        states = db_staff.JSON();
    }
    catch (e){
        console.log(e);   
    }
    console.log(states);
    res.send(states).status(200);
});

apiRouter.get('/current-state/:id', ipfilter(authorizedIPs, ipfilterConfig), async (req,res)=>{
    const db_data = new JSONdb(path.resolve('./database/db.json'));
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