var express = require('express');
var request = require('request');
var path = require('path');
var winston = require('winston');
var jwt = require('express-jwt');
const jsonwt = require('jsonwebtoken');
var clone = require('clone');

var config = require('./config');
var logger = new winston.Logger(config.logger.winston);

function issue_jwt(user, cb) {
    var claim = {
        iss: config.auth.iss,
        exp: (Date.now() + config.auth.ttl)/1000,
        //"iat": (Date.now())/1000, //this gets set automatically

        profile: {
            username: user.username,
        },
    };
    console.log( jsonwt.sign(claim, config.auth.private_key, config.auth.sign_opt));
    cb(null, jsonwt.sign(claim, config.auth.private_key, config.auth.sign_opt));

}


module.exports = function (app) {


    // // application -------------------------------------------------------------
    // app.get('/search', function (req, res) {
    //     res.sendFile(__dirname + '/html/emcenter/index.html'); // load the single view file (angular will handle the page changes on the front-end)
    // });
    //
    // app.get('/download', function (req, res) {
    //     res.sendFile(__dirname + '/html/emcenter/download.html'); // load the single view file (angular will handle the page changes on the front-end)
    // });
    //
    // app.get('/activity', function (req, res) {
    //     res.sendFile(__dirname + '/html/emcenter/activity.html'); // load the single view file (angular will handle the page changes on the front-end)
    // });
    //
    // app.get('/navbar', function (req, res) {
    //     res.sendFile(__dirname + '/html/navbar.html'); // load the single view file (angular will handle the page changes on the front-end)
    // });

    app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));
    app.use('/js', express.static(path.join(__dirname, 'js')));
    app.use('/t', express.static(path.join(__dirname, 't')));
    app.use('/images', express.static(path.join(__dirname, 'images')));

    app.get('/iucascb.html', function (req, res) {
        res.sendFile(__dirname + '/iucascb.html'); // load the file to handle iucas redirect
    });

    app.get('/verify', jwt({secret: "abcdefg", credentialsRequired: false}), function(req, res, next) {
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
