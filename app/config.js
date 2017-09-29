/**
 * Created by youngmd on 8/17/17.
 */
var winston = require('winston');
var fs = require('fs');
var imagex = fs.readFileSync(__dirname + '/imagex.key')

exports.auth = {
    //default user object when registered
    default: {
        //scopes can be empty.. but don't remove it! (a lot of app expects scopes object to exist)
        scopes: {
            sca: ["user"],
            mca: ["user"], //needed by mca
            dicom: ["user"], //needed by dicom
        },
        gids: [ 1 ],
    },

    //isser to use for generated jwt token
    iss: "https://youngmd6.sca.iu.edu/emca",
    //ttl for jwt
    ttl: 24*3600*1000, //1 day

    //TODO - fix this
    secret: 'shhhhhhared-secret',
    imagex_secret : imagex

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