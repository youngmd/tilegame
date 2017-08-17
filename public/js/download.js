myapp.controller('downloadController', function ($scope, $http) {
    $scope.title = "EMCenter Data Archive";
    $scope.downloads = [];

    $scope.getdownloads = function() {

        $http.get("http://localhost:3000/api/downloads?access_token=abcd").
        then(function(res) {
            $scope.downloads = res.data;
        });
    }

    $scope.getdownloads();
});