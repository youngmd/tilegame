'use strict';

myapp.controller('PollController', function ($scope, $http, $filter, $modal, $timeout, $location, $cookies, appconf, toaster) {
    $scope.images = [];
    $scope.selectedCount = 0;
    $scope.limit = appconf.voteFor;
    $scope.showme = true;
    $scope.covervote = false;
    $scope.showCounter = false;

    $scope.visited = $cookies.get('visited');


    $scope.updateSelected = function(img) {
        $scope.selected = [];
        img.selected = !img.selected;
        var count = 0;
        angular.forEach($scope.images, function(img){
           if(img.selected) {
               count++;
               $scope.selected.push(img.filename);
           }
        });
        $scope.selectedCount = count;

        if($scope.covervote) {
            $http({
                method: "POST",
                url: '/cover',
                data: $scope.selected
            }).then(function(res) {
                $scope.visited = true;
                $cookies.put('visited', $scope.visited);
                $scope.modalDone();
            }, function(err) {
                console.dir(err);
            });
        };

        if($scope.selectedCount >= $scope.limit){
            var counter = 1;

            $scope.images.sort(function (a, b) {
                return Math.random() - 0.5;
            });

            angular.forEach($scope.images, function(img){
                if (img.selected && img.student) {
                    counter++;
                    img.selected = false;
                    img.showme = false;
                    $timeout(function () {
                        img.showme = true;
                    }, counter * 300);
                } else {
                    img.showme = false;
                }
            });

            console.log($scope.selected);
            $http({
                    method: "POST",
                    url: '/include',
                    data: $scope.selected
                }).then(function(res) {

                    $scope.title = "Which of your favorites would make the best cover?";
                    $scope.showCounter = false;
                    $scope.covervote = true;

                }, function(err) {
                    console.dir(err);
                });
        };

    };

    $scope.getImages = function() {
        $http({
            method: "GET",
            url: "/pollImages"
        }).then(function (res) {
            $scope.images = res.data;
            $scope.images.sort(function (a, b) {
                return Math.random() - 0.5;
            });
            var counter = 1;
            angular.forEach($scope.images, function (img) {
                counter++;
                img['url'] = "/public/images/poll/" + img.filename + "?dim=1024x1024";
                img['thumb'] = "/public/images/poll/" + img.filename + "?dim=256x256";
                img['tile'] = "/public/images/poll/" + img.filename + "?dim=128x128";
                img['title'] = img.filename;
                img['selected'] = false;
                img['showme'] = false;
                $timeout(function () {
                    img.showme = true;
                }, counter * 100);
            });
        }, function (err) {
            console.dir(err);
        });
    };

    $scope.modalview = function (imgurl) {

        console.log(imgurl);
        $modal.open({
            template: '<modal-dialog><img class="img-responsive" src="{{url}}"></modal-dialog>', // loads the template
            backdrop: true, // setting backdrop allows us to close the modal window on clicking outside the modal window
            windowClass: 'modal', // windowClass - additional CSS class(es) to be added to a modal window template
            controller: function ($scope, $modalInstance) {
                $scope.url = imgurl;
                $scope.size = 'lg';
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            },
            resolve: {}
        });//end of modal.open
    }; // end of scope.open functionnd of scope.open function

    $scope.modalDone = function() {
        var images = $scope.images;
        $scope.visited = true;
        $modal.open({
            template: '<modal-dialog>' +
            '<h3 class="text-warning">Look for the final coloring book in the ASE Store in December.</h3><br>' +
            '<h4 ng-if="!download">Select one of your favorites to download a full-resolution version.</h4>' +
            '<div class="row">' +
            '<div class="col-xs-3" ng-repeat="img in images" ng-if="img.showme"><a class="thumbnail" ng-click="downloadfull(img);"> ' +
            '<img src="{{img.tile}}" alt="{{img.title}}"> ' +
            '</a></div>' +
            '<h4 ng-if="download">Your image is downloading...</h4></div>' +
            '</modal-dialog>', // loads the template
            windowClass: 'modal', // windowClass - additional CSS class(es) to be added to a modal window template
            backdrop: false,
            controller: function ($scope, $modalInstance, $window) {
                $scope.size = 'lrg';
                $scope.images = images;
                $scope.download = false;
                $scope.dialogTitle = 'Thank you for voting!';
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
                $scope.downloadfull = function(img){

                    $scope.download = true;
                    angular.forEach($scope.images, function(img){
                        img.showme = false;
                    });

                    var url = '/download/'+img.filename;

                    $window.location.assign(url);
                };
            },
            resolve: {}
        });//end of modal.open
    }; // end of scope.open functionnd of scope.open function

    if($scope.visited !== undefined && $scope.visited){
        $scope.title = "Poll Completed";
    } else {
        $scope.title = "Select your "+$scope.limit+" favorite images";
        $scope.showCounter = true;
        $scope.getImages();
    };

});

myapp.controller('SigninController', function ($scope, $http, $location, toaster, appconf, AuthService) {

    $scope.login = function() {
        if ($scope.username == "") {
            toaster.pop('error', 'Invalid or empty username', "Please enter a valid email");
        } else {
            AuthService.login($scope.username, $scope.password, function (res) {
                if (res) {
                    var redirect = sessionStorage.getItem('auth_redirect');
                    if (redirect == "" || redirect == undefined) redirect = appconf.auth_redirect_url;
                    // toaster.pop('success', 'Redirect', "Redirecting to " + redirect);
                    AuthService.getRoles(function(res) {
                        // toaster.pop('success', 'Roles', res);
                        $location.path(redirect);
                    });
                } else {
                    toaster.pop('error', 'Login Failed', "Check username/password");
                }
            });
        }
    };
});

myapp.controller('AdminController', function ($scope, $http, $location, $modal, toaster, appconf, AuthService) {

    $scope.images = [];
    $scope.details = true;
    $scope.includeCount = appconf.includeCount;

    $scope.coverTie = false;
    $scope.coverWinner = {
        cover_votes: 0
    };

    $scope.getImages = function() {
        $http({
            method: "GET",
            url: "/pollImages",
            params: { 'foobar': new Date().getTime() }
        }).then(function (res) {
            $scope.images = res.data;
            angular.forEach($scope.images, function(img){
                if(img.cover_votes > $scope.coverWinner.cover_votes){
                    $scope.coverTie = false;
                    $scope.coverWinner = img;
                }
                if(img.cover_votes == $scope.coverVotes){
                    $scope.coverTie = true;
                }
            });
        }, function (err) {
            console.dir(err);
        });
    };

    $scope.updateImages = function() {
        $http({
            method: "POST",
            url: "/pollUpdate",
            data: $scope.images
        }).then(function (res) {
            toaster.pop('info','Updated', 'Image array updated successfully');
            $scope.images = res.data;
        }, function (err) {
            toaster.pop('error','Unknown Error',err);
        });
    };

    $scope.resetPoll = function() {
        $modal.open({
            template: '<modal-dialog><h4>Are you sure?</h4><br><button class="btn btn-danger" ng-click="confirm()">Yes, Reset</button></modal-dialog>', // loads the template
            windowClass: 'modal', // windowClass - additional CSS class(es) to be added to a modal window template
            backdrop: false,
            controller: function ($scope, $modalInstance, toaster) {
                $scope.size = 'sm';
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };

                $scope.confirm = function () {
                    $http({
                        method: "GET",
                        url: "/resetPoll"
                    }).then(function (res) {
                        toaster.pop('info','Reset', 'The poll values have been reset');
                        $modalInstance.close();
                    }, function (err) {
                        toaster.pop('error','Unknown Error',err);
                    });
                }
            }
        }).result.then(function () {
            console.log("in here");
            $scope.images = [];
            $scope.getImages();
        }, function () {
            console.log("cancelled");
        });

    };

    $scope.getImages();
});

myapp.controller('ResultsController', function ($scope, $http, $location, toaster, appconf) {

    $scope.users = {};
    $scope.roles = {};

    var authToken = JSON.parse(localStorage.getItem(appconf.auth_token));
    $http({
        method: "GET",
        url: appconf.api_url+"/users?filter[include]=roles&access_token="+authToken.id
    }).then(function(res) {
        $scope.users = res.data;
        angular.forEach($scope.users, function(user){
            $http({
                method: "GET",
                url: appconf.api_url+"/users/"+user.id+"/getRolesById?&access_token="+authToken.id
            }).then(function(res) {
                console.dir(res);
                user.roles = res.data.payload.roles;
            }, function(err) {
                console.dir(err);
            });
        })
    }, function(err) {
        console.dir(err);
    });




});

myapp.controller('UploadController', function ($scope, $http, FileUploader, toaster, appconf, AuthService) {
    $scope.title = "ImageX";
    $scope.uploader = undefined;

    $scope.renderupload = false;
    AuthService.getRoles(function(roles){
        $scope.roles = roles;


        var uploader = $scope.uploader = new FileUploader({
            url: 'upload/'+$scope.roles[0]
        });

        // FILTERS

        uploader.filters.push({
            name: 'syncFilter',
            fn: function(item /*{File|FileLikeObject}*/, options) {
                console.log('syncFilter');
                return this.queue.length < 10;
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
            toaster.pop('error','Invalid Filetype','Please add a valid FITS or .fz compressed file')
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
        };
        uploader.onCompleteAll = function() {
            console.info('onCompleteAll');
        };

        $scope.renderupload = true;
    });


});
