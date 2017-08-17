myapp.controller('mainController', function ($scope, $http, $modal) {
    $scope.title = "EMCenter Data Archive";
    $scope.formData = {};
    $scope.exposures = [];
    $scope.searchText = "";

    $scope.getexposures = function() {
        var expidsearch = "";
        if(typeof $scope.formData.expid !== 'undefined' && $scope.formData.expid.length > 0) {
            expidsearch = "filter[where][exp_id][like]=" + $scope.formData.expid;
        }
        $http.get("http://localhost:3000/api/info22/?"+expidsearch+"&&access_token=abcd").
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
        $scope.selectall = !$scope.selectall;
        angular.forEach($scope.exposures, function(value, key) {
            $scope.exposures[key]['selected'] = $scope.selectall;
        })
        $scope.countselected();
    }

    $scope.toggleselectexposure = function(id) {
        $scope.exposures[id]['selected'] = !$scope.exposures[id]['selected'];
        $scope.countselected();
    }

    $scope.selected = 0;
    $scope.countselected = function() {
        angular.forEach($scope.exposures, function(value, key) {
            if($scope.exposures[key]['selected']) { $scope.selected++;}
        })
    }

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

    $scope.addperson = function() {
        var person  = {name: $scope.formData.name, age: $scope.formData.age, gender: $scope.formData.gender};
        console.log(person);
        $scope.people.push(person);
    }
});

