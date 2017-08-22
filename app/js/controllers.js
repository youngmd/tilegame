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

        $http.get("/api/exposures/?"+expsearch+"&&access_token=abcd").
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
        var size = 0;
        angular.forEach($scope.exposures, function(value, key) {
            if($scope.exposures[key]['selected']) {
                files.push($scope.exposures[key]['path']);
                size = size + $scope.exposures[key]['size'];
            }
        });

        $http({
            method: "POST",
            url: "/api/downloads?access_token=abcd",
            data: {
                files: files,
                size: size,
                status: "new",
                url: ''
            }}).
        then(function(res) {
            toaster.pop('info','', 'Your download request has been submitted');
            $scope.selectall = false;
            $scope.toggleselectall();
        });

    };

    $scope.infodump = function (expid) {

        var info = $scope.exposures[expid]['infofile'][0];
        var exp = $scope.exposures[expid]['exp_id']
        $modal.open({
            templateUrl: 't/infodump.html', // loads the template
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

        $http.get("/api/downloads?access_token=abcd").
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
        console.log(casurl);
        window.location = $scope.appconf.iucas_url+'?cassvc=IU&casurl='+casurl;
    }



});

myapp.controller('UploadController', function ($scope, $http, FileUploader, toaster) {
    $scope.title = "EMCenter Data Archive";

    $scope.rows = [];
    var uploader = $scope.uploader = new FileUploader({
        url: 'upload'
    });

    // FILTERS

    // a sync filter
    uploader.filters.push({
        name: 'csvFilter',
        fn: function(item /*{File|FileLikeObject}*/, options) {
            console.log('syncFilter');
            return this.queue.length < 10;
        }
    });

    uploader.filters.push({
        name: 'csvFilter',
        fn: function(item /*{File|FileLikeObject}*/, options) {
            var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
            return '|csv|tsv|txt|'.indexOf(type) !== -1;
        }
    });

    // an async filter
    uploader.filters.push({
        name: 'asyncFilter',
        fn: function(item /*{File|FileLikeObject}*/, options, deferred) {
            console.log('asyncFilter');
            setTimeout(deferred.resolve, 1e3);
        }
    });

    // CALLBACKS

    uploader.onWhenAddingFileFailed = function(item /*{File|FileLikeObject}*/, filter, options) {
        console.info('onWhenAddingFileFailed', item, filter, options);
        toaster.pop('error','Invalid Filetype','Please add a valid csv or tsv file')
    };
    uploader.onAfterAddingFile = function(fileItem) {
        console.info('onAfterAddingFile', fileItem);
    };
    uploader.onAfterAddingAll = function(addedFileItems) {
        console.info('onAfterAddingAll', addedFileItems);
    };
    uploader.onBeforeUploadItem = function(item) {
        console.info('onBeforeUploadItem', item);
    };
    uploader.onProgressItem = function(fileItem, progress) {
        console.info('onProgressItem', fileItem, progress);
    };
    uploader.onProgressAll = function(progress) {
        console.info('onProgressAll', progress);
    };
    uploader.onSuccessItem = function(fileItem, response, status, headers) {
        console.info('onSuccessItem', fileItem, response, status, headers);
    };
    uploader.onErrorItem = function(fileItem, response, status, headers) {
        console.info('onErrorItem', fileItem, response, status, headers);
    };
    uploader.onCancelItem = function(fileItem, response, status, headers) {
        console.info('onCancelItem', fileItem, response, status, headers);
    };
    uploader.onCompleteItem = function(fileItem, response, status, headers) {
        console.info('onCompleteItem', fileItem, response, status, headers);
        $scope.rows = response.data;
        $scope.process_rows();
    };
    uploader.onCompleteAll = function() {
        console.info('onCompleteAll');
    };

    console.dir('uploader', uploader);

    $scope.process_rows = function() {

        angular.forEach($scope.rows, function(value, key){
            $scope.rows[key]['inserted'] = false;
            var tmpdata = $scope.rows[key];
            var data = {
                name: tmpdata['Customer Name'],
                lab: tmpdata['Customer Lab'],
                equipment: tmpdata['Equipment Name'],
                title: tmpdata['Customer Title'],
                scheduled_start: tmpdata['Scheduled Start'],
                scheduled_end: tmpdata['Scheduled End'],
                scheduled_hours: tmpdata['Scheduled Hours'],
                actual_start: tmpdata['Actual Start'],
                actual_end: tmpdata['Actual End'],
                actual_hours: tmpdata['Actual Hours'],
                creation_date: tmpdata['Creation Date']
            };

            $http({
                method: "POST",
                url: "/api/labs?access_token=abcd",
                data: data
            }).
            then(function(res) {
                $scope.rows[key]['inserted'] = true;
            });


        });
    };
});
