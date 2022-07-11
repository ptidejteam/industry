# industry
project-showcase-industry4.0


## start server

starting node-red
```bash
$ ./node-red
```

edit the flow with the UI 
```plaintext
on a web browser -> http://192.168.0.200:1880/
```

_It is also possible to create your own flow and import it with git. Then you can launch your own flow_


# create a node :

all custom neuds should be made in a separate folder (to know more about how to create a node: [first node](https://nodered.org/docs/creating-nodes/first-node)).

To implement the custom node in the node-red palette: 
```bash
$ npm install industry/path/to/your/node/folder 
```
