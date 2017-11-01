var express = require('express');
var request = require('request');
var path = require('path');
var winston = require('winston');
var clone = require('clone');
var multer  = require('multer')
var config = require('./config');
var fs = require("fs");
var reload = require('require-reload')(require);

var logger = new winston.Logger(config.logger.winston);

var storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        var dir = './uploads/'+req.params.group;
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        //var datetimestamp = Date.now();
        //cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
        cb(null, file.originalname);
    }
});

var upload = multer({ //multer settings
    storage: storage
}).single('file');


module.exports = function (app) {

    app.use('/node_modules', express.static(path.join(__dirname, '/../node_modules')));
    app.use('/js', express.static(path.join(__dirname, 'js')));
    app.use('/t', express.static(path.join(__dirname, 't')));
    app.use('/images', express.static(path.join(__dirname, 'images')));


    /** API path that will upload the files */
    app.post('/upload/:group', function(req, res) {
        upload(req,res,function(err){
            if(err){
                res.json({error_code:1,err_desc:err});
                return;
            }
            console.log(req.file.filename);
            res.json({error_code:0,err_desc:null});
        })
    });

    app.post('/include', function(req, res) {
        var results = reload("../images.json");
        var choices = req.body;
        console.log(choices);
        for(var choice of choices){
            results.forEach(function (img) {
                if(img.filename === choice){
                    img.include_votes++;
                }
            });
        }

        fs.writeFile('./images.json', JSON.stringify(results), "utf8", (err) => {
            if (err) throw err;
            res.json({error_code: 0, err_desc: null});
        });
    });

    app.post('/cover', function(req, res) {
        var results = reload("../images.json");
        var choices = req.body;
        console.log(choices);
        for(var choice of choices){
            results.forEach(function (img) {
                if(img.filename === choice){
                    img.cover_votes++;
                }
            });
        }

        fs.writeFile('./images.json', JSON.stringify(results), "utf8", (err) => {
            if (err) throw err;
            res.json({error_code: 0, err_desc: null});
        });
    });

    app.get('/resetPoll', function(req, res) {
        var results = reload("../images.json");
        results.forEach(function (img) {
            img.include_votes = 0;
            img.cover_votes = 0;
        });

        fs.writeFile('./images.json', JSON.stringify(results), "utf8", (err) => {
            if (err) res.json({error_code: 1, err_desc: err});
            res.json(results);
        });
    });

    app.get('/pollUpdate', function(req, res) {
        var images = req.body;

        fs.writeFile('./images.json', JSON.stringify(images), "utf8", (err) => {
            if (err) res.json({error_code: 1, err_desc: err});
            res.json(images);
        });
    });


    app.get('/pollImages', function (req, res) {

        var images = reload("../images.json");
        if (images.length >= 1) {
            res.json(images);
        } else {
            fs.readdir('./public/images/poll', (err, files) => {
                files.forEach(function (img) {
                    var newimg = {
                        'filename': img,
                        'author': 'Unknown',
                        'include_votes': 0,
                        'cover_votes': 0,
                        'student': true
                    };
                    images.push(newimg);
                });

                fs.writeFile('./images.json', JSON.stringify(images), "utf8", (err) => {
                    if (err) throw err;
                    res.json(images);
                });
            });

        };
    });

    app.get('/download/:filename', function(req, res){
        var file = './public/images/poll/' + req.params.filename;
        res.download(file); // Set disposition and send it.
    });

    // application -------------------------------------------------------------
    app.get('/*', function (req, res) {
        res.sendFile(__dirname + '/index.html'); // load the single view file (angular will handle the page changes on the front-end)
    });
};
