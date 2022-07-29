const request = require('request');

async function prmsRequest(url){
    return new Promise(function (resolve, reject) {
        var options = {
            url: url,
            timeout: 3000
        } 

        request(options, function (error, res, body) {
            if (error) {
                reject(error);     
            } else if (res.statusCode == 200) {
                resolve(body);
            } else {
                console.log('wrongStatus :' + res.statusCode )
                reject(error);
            }
        });
    });
}

module.exports = prmsRequest;