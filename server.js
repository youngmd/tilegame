// set up ======================================================================
var express = require('express');
var http = require('http');
var app = express();
var server = http.createServer(app);
var path = require('path');
var port = process.env.PORT || 9002; 				// set the port	// load the database config
// configuration ===============================================================

app.use('/public', express.static(path.join(__dirname + '/public')));

app.get('/favicon.ico', function(req, res) {  //return no content for favicon
    res.status(204);
});

// routes ======================================================================
require('./app/routes.js')(app);

// listen (start app with node server.js) ======================================
server.listen(port);

console.log("TileGame listening on port " + port);
