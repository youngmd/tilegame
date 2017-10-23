var express = require('express');
var request = require('request');
var path = require('path');
var winston = require('winston');
var jwt = require('express-jwt');
const jsonwt = require('jsonwebtoken');
var clone = require('clone');
var multer  = require('multer')
var config = require('./config');
var fs = require("fs");
var path = require("path");

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




function issue_jwt(user, cb) {
    var claim = {
        iss: config.auth.iss,
        exp: (Date.now() + config.auth.ttl)/1000,
        //"iat": (Date.now())/1000, //this gets set automatically
        profile: {
            username: user.username,
        },
    };
    // console.log( jsonwt.sign(claim, config.auth.secret));
    cb(null, jsonwt.sign(claim, config.auth.secret));

}

function imagex_jwt(paths, cb){
    var claim = {
        "scopes": {"imagex": paths},
        "aud": "imagex.sca.iu.edu",
        "iat": Date.now(),
        "exp": (Date.now() + config.auth.ttl)/1000
    };

    // console.log( jsonwt.sign(claim, config.auth.imagex_secret, { algorithm: 'RS256'}));
    cb( jsonwt.sign(claim, config.auth.imagex_secret, { algorithm: 'RS256'}));
}

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

    app.get('/iucascb.html', function (req, res) {
        res.sendFile(__dirname + '/iucascb.html'); // load the file to handle iucas redirect
    });


    app.get('/token/:exptype/:eid', function (req, res) {
        var paths = ['/tiles/'+req.params.exptype+'/'+req.params.eid];
        imagex_jwt(paths, function(token){
            res.json(token);
        })
    });

    app.get('/tokennew/:eid', function (req, res) {
        var paths = ['/'+req.params.eid];
        imagex_jwt(paths, function(token){
            res.json(token);
        })
    });


    app.get('/verify', jwt({secret: "shhhhhhared-secret", credentialsRequired: false}), function(req, res, next) {
        var ticket = req.query.casticket;

        //guess casurl using referer - TODO - should I use cookie and pass it from the UI method begin_iucas() instead?
        //var casurl = config.iucas.home_url;
        if(!req.headers.referer) return next("Referer not set in header..");
        casurl = req.headers.referer;
        request({
            url: 'https://cas.iu.edu/cas/validate?cassvc=IU&casticket='+ticket+'&casurl='+casurl,
            timeout: 1000*5, //long enough?
        }, function (err, response, body) {
            if(err) return next(err);
            logger.info("verify responded", response.statusCode, body);
            if (response.statusCode == 200) {
                var reslines = body.split("\n");
                if(reslines[0].trim() == "yes") {
                    var uid = reslines[1].trim();

                    logger.info("iucas authentication successful. iu id:"+uid);
                    var user = {
                        username:uid};
                    issue_jwt(user, function(err, jwt) {
                        if(err) return next(err);
                        console.log("issued token", jwt);
                        res.json({jwt:jwt});
                    });
                } else {
                    logger.error("IUCAS failed to validate");
                    res.sendStatus("403");//Is 403:Forbidden appropriate return code?
                }
            } else {
                //non 200 code...
                next(body);
            }
        })
    });

    // application -------------------------------------------------------------
    app.get('/*', function (req, res) {
        res.sendFile(__dirname + '/index.html'); // load the single view file (angular will handle the page changes on the front-end)
    });
};
