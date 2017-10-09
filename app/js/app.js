/**
 * Created by youngmd on 8/11/17.
 */
var myapp = angular.module('myapp', [
    'app.config',
    'ngRoute',
    'ngAnimate',
    'ngCookies',
    'toaster',
    'angular-loading-bar',
    'angularFileUpload',
    'angular-jwt',
    'ui.bootstrap',
    'ui.gravatar',
    'ui.select'
]);

myapp.factory('AuthService', function(appconf, $http) {
    console.log(localStorage.getItem(appconf.user));
    var user = JSON.parse(localStorage.getItem(appconf.user));
    var authToken = JSON.parse(localStorage.getItem(appconf.auth_token));

    return {
        user: function() { return user; },
        token: function() { return authToken},
        login: function(username, password, cb) {
            localStorage.removeItem(appconf.user);
            localStorage.removeItem(appconf.auth_token);
            $http({
                method: "POST",
                url: appconf.api_url+"/users/login",
                data: {"email": username, "password": password}
            }).
            then(function(res) {
                authToken = res.data;
                authToken.created = new Date(authToken.created);
                authToken['expiration'] = authToken.created + authToken.ttl;
                $http({
                    method: "GET",
                    url: appconf.api_url+"/users/"+authToken.userId+"?access_token="+authToken.id
                }).then(function(res) {
                    user = res.data;
                    localStorage.setItem(appconf.auth_token, JSON.stringify(authToken));
                    localStorage.setItem(appconf.user, JSON.stringify(user));
                    cb(true);
                }, function(err) {
                    console.dir(err);
                    cb(false);
                });
            }, function(err) {
                console.dir(err);
                cb(false);
            });
        },
        logout: function(cb) {
            $http({
                method: "POST",
                url: appconf.api_url+"/users/logout?access_token="+authToken.id
            }).then(function(res) {
                localStorage.removeItem(appconf.user);
                localStorage.removeItem(appconf.auth_token);
                cb(true);
            }, function(err) {
                console.dir(err);
                cb(false);
            });
        },
        isLoggedIn: function() { return (user.username != '');},
        checkToken: function() { return (authToken.id != '');}
    };
});

myapp.filter('bytes', function() {
    return function(bytes, precision) {
        if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
        if (typeof precision === 'undefined') precision = 1;
        var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
            number = Math.floor(Math.log(bytes) / Math.log(1024));
        return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) +  ' ' + units[number];
    }
});

myapp.filter('limitObjectTo', function() {
    return function(obj, limit) {
        var newObj = {}, i = 0, p;
        for (p in obj) {
            newObj[p] = obj[p];
            if (++i === limit) break;
        }
        return newObj;
    };
});

myapp.directive('navbar', function() {
    return {
        restrict: "E",
        replace: true,
        scope: {
            active: '@'
        },
        templateUrl: 't/navbar.html',
        controller: ['$scope', '$location','appconf', 'AuthService', 'toaster', function ($scope, $location, appconf, AuthService, toaster) {
            $scope.user = AuthService.user();
            $scope.username = $scope.user.username;
            console.dir($scope.user);
            $scope.title = appconf.title;
            $scope.logout = function() {
                AuthService.logout(function(res){
                    if(res){
                        $location.path("/signin");
                        toaster.pop('success', 'Logged Out', "Successfully logged out");
                    }
                });
            }
        }]
    };
});

myapp.directive('modalDialog', function() {
    return {
        restrict: 'E',
        replace: true,
        transclude: true,
        link: function(scope) {
            scope.cancel = function() {
                scope.$dismiss('cancel');
            };
        },
        template:
        "<div>" +
        "<div class='modal-header'>" +
        "<h3 ng-bind='dialogTitle'></h3>" +
        "<div ng-click='cancel()'>X</div>" +
        "</div>" +
        "<div class='modal-body' ng-transclude></div>" +
        "</div>"
    };
});


//configure route
myapp.config(['$routeProvider', 'appconf', function($routeProvider, appconf) {
    $routeProvider.
    when('/search', {
            templateUrl: 't/search.html',
            controller: 'SearchController',
            requiresLogin: true
        })
        .when('/download', {
            templateUrl: 't/download.html',
            controller: 'DownloadController',
            requiresLogin: true
        })
        .when('/activity', {
            templateUrl: 't/activity.html',
            controller: 'ActivityController',
            requiresLogin: true
        })
        .when('/signin', {
            templateUrl: 't/signin.html',
            controller: 'SigninController'
        })
        .when('/upload', {
            templateUrl: 't/upload.html',
            controller: 'UploadController',
            requiresLogin: true
        })
        .when('/imagex', {
            templateUrl: 't/imagex.html',
            controller: 'ImagexController',
            requiresLogin: true
        })
        .otherwise({
            redirectTo: '/signin'
        });
}]).run(['$rootScope', '$location', 'toaster', 'jwtHelper', 'appconf', 'AuthService', function($rootScope, $location, toaster, jwtHelper, appconf, AuthService) {
    $rootScope.$on("$routeChangeStart", function(event, next, current) {
        //redirect to /signin if user hasn't authenticated yet
        if(next.requiresLogin) {
            var authToken = AuthService.token();
            var today = new Date();
            if(authToken == null || (authToken.expiration > today )) {
                toaster.warning("Please sign in first");
                sessionStorage.setItem('auth_redirect', next.originalPath);
                $location.path("/signin");
                event.preventDefault();
            }
        }
    });
}]);

