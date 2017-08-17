// set up ======================================================================
var express = require('express');
var io = require('socket.io');
var http = require('http');
var app = express();
var server = http.createServer(app);
var io = io.listen(server);
var path = require('path');
var port = process.env.PORT || 8080; 				// set the port	// load the database config
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

// configuration ===============================================================

app.use('/public', express.static(path.join(__dirname + '/public')));
app.use(bodyParser.urlencoded({'extended': 'true'})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({type: 'application/vnd.api+json'})); // parse application/vnd.api+json as json
app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request

// routes ======================================================================
require('./app/routes.js')(app);

// set up our socket server
require('./sockets/base')(io);

// listen (start app with node server.js) ======================================
server.listen(port);

io.set('log level', 1000);
console.log("Simple-Angular App listening on port " + port);
