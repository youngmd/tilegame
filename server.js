// set up ======================================================================
var express = require('express');
var app = express(); 						// create our app w/ express
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

// listen (start app with node server.js) ======================================
app.listen(port);
console.log("Simple-Angular App listening on port " + port);
