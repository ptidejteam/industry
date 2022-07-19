var simple_json_db = require('simple-json-db')

module.exports = function(RED){
    function db(config){
        RED.nodes.createNode(this,config);
        var node = this;

        node.on('input', function(msg) {
            try {
                const method = config.method || "set";
                const key = config.key || msg.payload.key;
                const keytype = config.keytype;
                let data = config.data || msg.payload.data;
                const datatype = config.datatype;
                const file = config.file || msg.payload.file;
                const fs = require('fs');
                if (!fs.existsSync(`${__dirname}/database/${file}`)) {
                    throw 'Database file doesn\'t exists';
                }

                var json_db = new simple_json_db(`${__dirname}/database/${file}`);
                
                msg.payload.method = method;
                switch (method) {
                    case "set":
                        if (datatype == "json") {
                            data = JSON.parse(data)
                        }
                        msg.payload.data = json_db.set(key, data);
                        break;
                    case "get":
                        msg.payload.data = json_db.get(key);
                        break;
                    case "has":
                        msg.payload.data = json_db.has(key);
                        break;
                    case "delete":
                        msg.payload.data = json_db.delete(key);
                        break;
                }
                
            }
            catch(e){
                console.log("error");
                node.error(e, "Database file doesn\'t exists");
            } 
            finally {
                node.send(msg);
            }
        });
    }
    RED.nodes.registerType("db",db);
}
