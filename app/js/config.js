'use strict';

//this is checked in to git as default
//nothing sensitive should go here (since it will be published via web server anyway)
//contrib

angular.module('app.config', [])
.constant('appconf', {

    title: 'EMCenter Data Archive',

    default_redirect_url: '/emca/#!/search',  //don't start with #

    jwt_id: 'jwt',
    iucas_url: 'https://cas.iu.edu/cas/login',

    jwt_whitelist: ['youngmd6.sca.iu.edu'], //list of domains to allow jwtInterceptor to send jwt to

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


