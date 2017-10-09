'use strict';

//this is checked in to git as default
//nothing sensitive should go here (since it will be published via web server anyway)
//contrib

angular.module('app.config', [])
.constant('appconf', {

    title: 'ImageX UI',

    default_redirect_url: '/imagex/#!/signin',  //don't start with #

    jwt_id: 'jwt',
    iucas_url: 'https://cas.iu.edu/cas/login',

    api_url: 'http://172.18.0.3:3001/imagex-api/',
    jwt_whitelist: ['imagex.sca.iu.edu'], //list of domains to allow jwtInterceptor to send jwt to
    title: 'ImageX UI',

    default_redirect_url: '/#!/signin',  //don't start with #

    auth_token: 'auth_token',
    user: 'ix_user',
    iucas_url: 'https://cas.iu.edu/cas/login',

    api_url: '/imagex-api',
    jwt_whitelist: ['imagex.sca.iu.edu'], //list of domains to allow jwtInterceptor to send jwt to

        //show/hide various login options
        show: {
            //local and ldap shouldn't be used at the same time
            local: false,
            //ldap: true,

            x509: false,
            google: false,
            github: false,
            facebook: false,
            iucas: true,
            orcid: false,

            oidc: false, //cilogon openid-connect service
            oidc_selector: false, //show idp selector

            signup: true,
        },
    });


