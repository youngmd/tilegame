/**
 * Created by youngmd on 8/17/17.
 */
var winston = require('winston');
var fs = require('fs');

exports.auth = {
    //default user object when registered
    admin_user: 'cyoung',
    admin_pass: 'cc03e747a6afbbcbf8be7668acfebee5',


    //allow_signup: false, //prevent user from signing in (set false if not using local auth)
};

exports.logger = {
    winston: {
        //hide headers which may contain jwt
        requestWhitelist: ['url', /*'headers',*/ 'method', 'httpVersion', 'originalUrl', 'query'],
        transports: [
            //display all logs to console
            new winston.transports.Console({
                timestamp: function() {
                    var d = new Date();
                    return d.toString(); //show timestamp
                },
                level: 'info',
                colorize: true
            }),
        ]
    }
}