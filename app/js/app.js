/**
 * Created by youngmd on 8/11/17.
 */

var myapp = angular.module('myapp', [
    'app.config',
    'ngRoute',
    'ngAnimate',
    'ngCookies'
]);


//configure route
myapp.config(['$routeProvider', 'appconf', function($routeProvider, appconf) {
    $routeProvider.
    when('/game/:tokens/:delay', {
        templateUrl: 't/game.html',
        controller: 'GameController'
    })
    .when('/game', {
        templateUrl: 't/game.html',
        controller: 'GameController'
    })
    .otherwise({
        redirectTo: '/game'
    });
}]).run(['$rootScope', '$location', '$window', '$routeParams', 'appconf', function($rootScope, $location, $window, $routeParams, appconf) {}]);

