'use strict';


myapp.controller('SearchController', function ($scope, $http, $filter, $modal, appconf, jwtHelper, toaster) {

    $scope.username = jwtHelper.decodeToken(localStorage.getItem(appconf.jwt_id)).profile.username;

    $scope.title = "EMCenter Data Archive";
    $scope.formData = {};
    $scope.exposures = [];
    $scope.searchText = "";

    $scope.getexposures = function() {
        $scope.selected = 0;
        if(typeof $scope.formData.obsdate == 'undefined') {
            toaster.pop('error', 'Bad Date', "Enter a valid date to search");
            return;
        }

        var obsdate = $filter('date')($scope.formData.obsdate, "yyyyMMdd_");
        var expsearch = "filter[where][exp_id][like]=" + obsdate;

        $http.get("http://localhost:3000/api/info22/?"+expsearch+"&&access_token=abcd").
        then(function(res) {
            $scope.exposures = res.data;
            angular.forEach($scope.exposures, function(value, key) {
                $scope.exposures[key]['selected'] == false;
            })
        });
    }

    $scope.today = function() {
        return new Date();
    };
    $scope.maxdate = $scope.today();
    $scope.format = 'yyyy-MM-dd';

    $scope.dateopen = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.opened = true;
    };

    $scope.selectall = false;

    $scope.toggleselectall = function() {
        console.log("in here");
        console.log($scope.selectall);
        angular.forEach($scope.exposures, function(value, key) {
            $scope.exposures[key]['selected'] = $scope.selectall;
        });
        $scope.countselected();
    };

    $scope.toggleselectexposure = function(id) {
        $scope.exposures[id]['selected'] = !$scope.exposures[id]['selected'];
        $scope.countselected();
    };

    $scope.selected = 0;
    $scope.countselected = function() {
        $scope.selected = 0;
        angular.forEach($scope.exposures, function(value, key) {
            if($scope.exposures[key]['selected']) { $scope.selected++;}
        })
    };

    $scope.download = function() {
        var files = [];
        angular.forEach($scope.exposures, function(value, key) {
            if($scope.exposures[key]['selected']) {
                files.push($scope.exposures[key]['exp_id']);
            }
        });

        $http({
            method: "POST",
            url: "http://localhost:3000/api/downloads?access_token=abcd",
            data: {
                files: files,
                size: files.length * 72000000,
                status: "new",
                url: ''
            }}).
        then(function(res) {
            toaster.pop('info','response', res.data);
        });

    };

    $scope.infodump = function (expid) {

        var info = $scope.exposures[expid]['infofile'][0];
        var exp = $scope.exposures[expid]['exp_id']
        $modal.open({
            templateUrl: 'myModalContent.html', // loads the template
            backdrop: true, // setting backdrop allows us to close the modal window on clicking outside the modal window
            windowClass: 'modal', // windowClass - additional CSS class(es) to be added to a modal window template
            controller: function ($scope, $modalInstance) {
                $scope.items = info;
                $scope.title = "Metadata for " + exp;
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            },
            resolve: {
                user: function () {
                    return $scope.user;
                }
            }
        });//end of modal.open
    }; // end of scope.open functionnd of scope.open function

});

myapp.controller('DownloadController', function ($scope, $http) {
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

myapp.controller('ActivityController', function ($scope, $http) {
    $scope.title = "EMCenter Data Archive";
    $scope.processes = [];
});

myapp.controller('SigninController', function ($scope, $http, toaster, appconf) {
    $scope.appconf = appconf;
    $scope.title = "EMCenter Data Archive";
    $scope.username = "";
    $scope.requestAccess = function() {
        if ($scope.username == "") {
            toaster.pop('error', 'Invalid or empty username', "Please enter a valid IU username");
        } else {
            toaster.pop('success', 'Access Request for ' + $scope.username, "The EMCenter Admin has been notified.  You will receive an email when access is granted.");
        }
    }

    $scope.begin_iucas = function() {
        //I can't pass # for callback somehow (I don't know how to make it work, or iucas removes it)
        //so let's let another html page handle the callback, do the token validation through iucas and generate the jwt
        //and either redirect to profile page (default) or force user to setup user/pass if it's brand new user
        var casurl = window.location.origin+window.location.pathname+'iucascb.html';
        window.location = $scope.appconf.iucas_url+'?cassvc=IU&casurl='+casurl;
    }



});
