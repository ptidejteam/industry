const express = require('express');
let prmsRequest = require('./helper');

const nodeRedRouter = express.Router();

// nodeRedRouter.get('/fitbit',async function(req,res) {
//     var resp = ""
//     try{
//         resp = await prmsRequest('http://localhost:8000/api/fitbit');
//     }
//     catch (e){
//         console.log(e);
//     }
//     res.send(resp);
// });

module.exports = nodeRedRouter;