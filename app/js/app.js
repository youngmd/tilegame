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
            title: '@',
            active: '@',
            username: '@',
            loggedin: '@'
        },
        templateUrl: 't/navbar.html'
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
            controller: 'UploadController'
        })
        .otherwise({
            redirectTo: '/signin'
        });
}]).run(['$rootScope', '$location', 'toaster', 'jwtHelper', 'appconf', function($rootScope, $location, toaster, jwtHelper, appconf) {
    $rootScope.$on("$routeChangeStart", function(event, next, current) {
        //redirect to /signin if user hasn't authenticated yet
        if(next.requiresLogin) {
            var jwt = localStorage.getItem(appconf.jwt_id);
            console.dir(jwt);
            if(jwt == null || jwtHelper.isTokenExpired(jwt)) {
                toaster.warning("Please sign in first");
                sessionStorage.setItem('auth_redirect', '#!'+next.originalPath);
                $location.path("/signin");
                event.preventDefault();
            }
        }
    });
}]);

