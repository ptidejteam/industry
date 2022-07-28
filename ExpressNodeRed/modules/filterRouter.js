var express = require("express");
var path = require('path');

// DB config
const JSONdb = require('simple-json-db');
const db_staff = new JSONdb(path.resolve('./database/staff.json')); 

const filterRouter = express.Router({mergeParams: true});

filterRouter.get('/department',async(req,res)=>{
    let staff = {};
    let departments = [];
    try{
        staff = db_staff.JSON();
        Object.values(staff).forEach(it => {
            if (!departments.includes(it.department)) { departments.push(it.department)};
        });
    }
    catch (e){
        console.log(e);   
    }
    res.json(departments).status(200);
});

filterRouter.get('/building',async(req,res)=>{
    let staff = {};
    let buildings = [];
    try{
        staff = db_staff.JSON();
        Object.values(staff).forEach(it => {
            if (!buildings.includes(it.building)) { buildings.push(it.building)};
        });
    }
    catch (e){
        console.log(e);   
    }
    res.json(buildings).status(200);
});

module.exports = filterRouter;