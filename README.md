# industry
project-showcase-industry4.0


### start server

starting node-red
```bash
$ cd /node-red
$ node red.js
```

starting node red with your own flow from github
```bash
$ cd /node-red
$ node red.js ../industry/path/to/your/folder
```

starting node red with express server with your own flow from github
```
$ cd ExpressNodeRed
$ node server.js /your/folder/like/template
```
__192.168.0.200/red for the ui__
[more command option](https://nodered.org/docs/getting-started/local#command-line-usage)


### Basic folder structure: 
MyFolder/
* flows.json
* package.json
* nodes/
* * name_of_your_node.js
* * name_of_your_node.html

After init/adding/updating things use `$ npm install` inside the current folder
