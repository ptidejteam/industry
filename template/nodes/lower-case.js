var smallest = require('smallest')

module.exports = function(RED){
    function LowerCaseNode(config){
        RED.nodes.createNode(this,config);
        var node = this;
        node.on('input', function(msg) {
            msg.payload = msg.payload.toLowerCase() + smallest(1, 2, 4, 3).toString();
            node.send(msg);
        });
    }
    RED.nodes.registerType("lower-case",LowerCaseNode);
}
