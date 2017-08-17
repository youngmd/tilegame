/**
 * Created by youngmd on 8/10/17.
 */
myapp.directive('navbar', function() {
    return {
        restrict: "E",
        replace: true,
        scope: {
            title: '@',
            active: '@'
        },
        templateUrl: '/navbar'
    };
})