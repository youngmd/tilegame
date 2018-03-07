var express = require('express');
var path = require('path');
var config = require('./config');


module.exports = function (app) {

    app.use('/node_modules', express.static(path.join(__dirname, '/../node_modules')));
    app.use('/js', express.static(path.join(__dirname, 'js')));
    app.use('/t', express.static(path.join(__dirname, 't')));
    app.use('/images', express.static(path.join(__dirname, 'images')));


    // application -------------------------------------------------------------
    app.get('/*', function (req, res) {
        console.log(req.url);
        res.sendFile(__dirname + '/index.html'); // load the single view file (angular will handle the page changes on the front-end)
    });
};
