'use strict';

myapp.controller('SearchController', function ($scope, $http, $filter, $modal, appconf, jwtHelper, toaster) {

    $scope.username = jwtHelper.decodeToken(localStorage.getItem(appconf.jwt_id)).profile.username;

    $scope.title = "ImageX";
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

myapp.controller('ImagexController', function ($scope, $http) {
    $scope.title = "ImageX";

    $scope.viewer = OpenSeadragon({
        id: "openseadragon1",
        preserveViewport: true,
        crossOriginPolicy: 'Anonymous',
        prefixUrl: "/imagex/node_modules/openseadragon/build/openseadragon/images/",
        imageLoaderLimit: 10
    });

    var viewer = $scope.viewer;

    $scope.selectoverlays = [];
    $scope.infooverlays = [];

    $scope.onViewerClick = function(event) {
        // $scope.viewer.addHandler('canvas-click', function(event) {
        for(var ov in $scope.selectoverlays){
            $scope.viewer.removeOverlay($scope.selectoverlays[ov]);
        }
        $scope.selectoverlays = [];
        // The canvas-click event gives us a position in web coordinates.
        var webPoint = event.position;

        // Convert that to viewport coordinates, the lingua franca of OpenSeadragon coordinates.
        var viewportPoint = $scope.viewer.viewport.pointFromPixel(webPoint);

        // Convert from viewport coordinates to image coordinates.
        //var imagePoint = $scope.viewer.TiledImage.viewportToImageCoordinates(viewportPoint);

        // Show the results.
        var hitfound = false;
        //console.dir(webPoint);
        console.dir($scope.viewer.viewport.getBounds());
        angular.forEach($scope.associations, function(image, imageid){
            if(hitfound){

                return;
            }
            //console.log(imageid);
            //console.dir(image);
            var pos = viewportPoint;
            var box = image.getBounds();
            var hit = (pos.x > box.x && pos.y > box.y && pos.x < box.x + box.width && pos.y < box.y + box.height);
            if(hit){
                console.dir(image);
                hitfound = true;
                var edges = image.getBounds();
                console.log(edges);
                var buffer = 0.2
                edges.x -= buffer;
                edges.y -= buffer*0.25;
                edges.width += buffer;
                edges.height += buffer*0.25;

                var elt = document.createElement("div");
                elt.id = "select-overlay"+imageid;
                $scope.selectoverlays.push(elt.id);
                elt.className = "infobox";
                elt.innerHTML = "<h4><span style='color: white'>"+imageid+"</span></h4>";
                var loc = image.getBounds();
                loc.x = loc.x - 0.8*buffer;
                loc.width = 0.9*buffer;
                loc.height = loc.height / 2;
                $scope.viewer.addOverlay({
                    element: elt,
                    location: loc
                });

                $scope.viewer.viewport.fitBounds(edges);
                console.log($scope.viewer.viewport.getBounds());


                var elt = document.createElement("div");
                elt.id = "select-overlay"+imageid;
                $scope.selectoverlays.push(elt.id);
                elt.className = "highlight";
                $scope.viewer.addOverlay({
                    element: elt,
                    location: box
                });
                console.log(imageid+': '+hit);
                $scope.associations[imageid].selected = true;
                $scope.$apply();
            }
        });
        if(hitfound){
            event.preventDefaultAction = true;
            event.stopBubbling = true;
        }
    }

    $scope.onViewerMove = function(event) {
        for(var ov in $scope.infooverlays){
            $scope.viewer.removeOverlay($scope.infooverlays[ov]);
        }
        $scope.infooverlays = [];
        // $scope.viewer.addHandler('canvas-click', function(event) {

        // The canvas-click event gives us a position in web coordinates.
        var webPoint = event.position;

        // Convert that to viewport coordinates, the lingua franca of OpenSeadragon coordinates.
        var viewportPoint = $scope.viewer.viewport.pointFromPixel(webPoint);

        //console.log([webPoint, viewportPoint]);
        // Convert from viewport coordinates to image coordinates.
        //var imagePoint = $scope.viewer.TiledImage.viewportToImageCoordinates(viewportPoint);

        // Show the results.
        var hitfound = false;
        angular.forEach($scope.viewer.world._items, function(image, imageid){
            if(hitfound){
                //console.dir(image);
                return;
            }
            //console.log(imageid);
            //console.dir(image);
            var pos = viewportPoint;
            var box = image.getBounds();
            var hit = (pos.x > box.x && pos.y > box.y && pos.x < box.x + box.width && pos.y < box.y + box.height);
            if(hit){
                hitfound = true;
                var elt = document.createElement("div");
                elt.id = "info-overlay"+imageid;
                $scope.infooverlays.push(elt.id);
                elt.className = "infobox";
                elt.innerHTML = "<h5><span style='color: white'>"+imageid+"</span></h5>";
                var loc = box;
                loc.x = loc.x + loc.width/10;
                loc.width = loc.width / 3;
                loc.height = loc.height / 3;
                $scope.viewer.addOverlay({
                    element: elt,
                    location: loc
                });
                console.log(imageid+': '+hit);
            }
        });
        if(hitfound){
            event.preventDefaultAction = true;
            event.stopBubbling = true;
        }
    }


    //var ovc = $scope.onViewerClick;
    $scope.viewer.addViewerInputHook({hooks: [
        {tracker: 'viewer', handler: 'moveHandler', hookHandler: $scope.onViewerMove},
        {tracker: 'viewer', handler: 'clickHandler', hookHandler: $scope.onViewerClick}
    ]});

    $scope.rebound = function(cb){
        $scope.viewer.viewport.fitBounds(new OpenSeadragon.Rect(-10000, -10000, 10000, 10000), true);
        console.log('rebounding!');
        cb();
    }

    //$scope.rebound(function(){});


    $scope.zoomout = function(){
        $scope.viewer.viewport.fitBounds(new OpenSeadragon.Rect(-1, -1, 2, 2), true);
    }
    // $scope.images = {
    //     '76591' :[198.2693375, 17.85726417, 0.3, 8217, 10057],
    //     '76590' :[198.2381333, 17.81203417, 0.3, 8217, 10057],
    //     '76589' :[198.2127083, 17.82992472, 0.3, 8217, 10057],
    //     '76586' :[198.2194375, 17.94030778, 0.3, 8217, 10057],
    //     '76585' :[198.2328083, 17.92626833, 0.3, 8217, 10057],
    //     '76584' :[198.2479625, 17.89997889, 0.3, 8217, 10057],
    //     '76583' :[198.2256583, 17.89136, 0.3, 8217, 10057]
    // }

    $scope.images = {
        // '68763' :[298.4472250,	18.56258194, 0.3, 8217, 10062],
        // '68761' :[298.4620792,	18.60341806, 0.3, 8217, 10062],
        // '68755' :[298.4601042,	18.60766528, 0.3, 8217, 10062],
        // '68764' :[298.5025375,	18.52309028, 0.3, 8217, 10062],
        // '68750' :[298.520200,	18.617455, 0.3, 8217, 10062],
        // '68754' :[298.5149542,	18.5768919, 0.3, 8217, 10062],
        // '68756' :[298.5395833,	18.58627444, 0.3, 8217, 10062],
        // '68753' :[298.5073167,	18.63271, 0.3, 8217, 10062],
        // '68760' :[298.5092833,	18.62676278, 0.3, 8217, 10062],
        // '68758' :[298.5224667,	18.61355722, 0.3, 8217, 10062],
        // '68748' :[298.534950,	18.59011556, 0.3, 8217, 10062],
        // '68767' :[298.5283333,	18.50608833, 0.3, 8217, 10062],
        // '68768' :[298.560075,	18.55153, 0.3, 8217, 10062],
        // '68746' :[298.5117167,	18.58038306, 0.3, 8217, 10062]
    }

    $scope.lookupName = function(namestr, cb){
        $http({
            url : '/imagex/api/ajax/resolve?q='+namestr,
            method : 'GET'
        }).then(
            function(res){
                cb(res.data);
            },
            function(err){
                console.dir(err);
            });
    }

    $scope.searchname = '';

    $scope.searchImages = function(cb){
        $scope.lookupName($scope.searchname, function(data){
            console.dir(data);
            $http({
                url : 'https://youngmd6.sca.iu.edu/imagex-api/exposures',
                method : 'GET'
            }).then(
                function(res){
                    angular.forEach(res.data, function(value, key){
                        console.dir(value);
                        var validWCS = checkHeader(value.header);
                        if(validWCS){
                            var testcoords = pix2world({'x':0,'y':0}, value.header);
                            console.log([value.ra0, value.dec0, testcoords]);
                        }
                        $scope.images[value.id] = [value.ra0, value.dec0, value.pixelscale, value.width, value.height, value.filter, value.header];
                    });
                    cb();
                },
                function(err){
                    console.dir(err);
                });
        })
    }


    $scope.zero = [];
    $scope.scalefactor = 0;

    $scope.widthrange = 0;
    $scope.heightrange = 0;

    $scope.getBoundaries = function(limit) {
        var ramax = 0;
        var ramin = 1000;
        var decmax = -1000;
        var decmin = 1000;

        var rmaxes = [ramax];
        var rmins = [ramin];
        var dmaxes = [decmax];
        var dmins = [decmin];

        var counter = 0;
        angular.forEach($scope.images, function(coords, imageid){
            if(counter > limit){ return }
            //console.log(coords);
            var rawidth = (coords[2] * coords[3]) / 3600.0;
            var decwidth = (coords[2] * coords[4]) / 3600.0;
            var rmin = coords[0];
            var rmax = rmin + rawidth;
            var dmin = coords[1];
            var dmax = dmin + decwidth;
            rmaxes.push(rmax);
            rmins.push(rmin);
            dmaxes.push(dmax);
            dmins.push(dmin);
            counter++;
        });

        var ramax = Math.max.apply(null,rmaxes);
        var ramin = Math.min.apply(null,rmins);
        var decmin = Math.min.apply(null,dmins);
        var decmax = Math.max.apply(null,dmaxes);

        $scope.zero = [ramin, decmax];
        //console.log([ramax-ramin, decmax - decmin]);

        $scope.widthrange = (ramax - ramin);
        $scope.heightrange = (decmax - decmin);
        //console.log($scope.viewer.viewport.getBounds());
        //console.log($scope.widthrange, $scope.heightrange);
        $scope.scalefactor = $scope.widthrange / $scope.heightrange;

        console.log($scope.zero);
        console.log($scope.scalefactor);
        console.log('done getting boundaries');
    }


    $scope.scaleImg = function(imageid){
        var image = $scope.images[imageid];
        // var width = ((image[2] * image[3]) / 3600.0);
        // var height = ((image[2] * image[4]) / 3600.0);
        // //console.log([width, height]);
        //
        // var posx = ((image[0] - 0.5*width - $scope.zero[0]) * $scope.scalefactor / $scope.widthrange);
        // var posy = ($scope.zero[1] - (image[1] + 0.5*height)) / $scope.heightrange;
        // //console.log([posx, posy]);
        //var pos = new OpenSeadragon.Rect(posx, posy, (width/$scope.widthrange), height / $scope.heightrange);
        var h = image[6];
        var xoffset = 0 - h.CRPIX1;
        var yoffset = 0 - h.CRPIX2;
        var width = image[3];
        var height = image[4];
        var pos = { x : xoffset,
                    y : yoffset,
                    width : width,
                    height : height};
        //console.log(pos);
        return pos;
    }

    $scope.getToken = function(etype, eid, cb) {
        $http({
            url: '/imagex/token/'+etype+'/'+eid
        }).then(
            function(res){
                cb(res.data)
            },
            function(err){
                console.dir(err);
            });
    }

    $scope.getTokenNew = function(eid, cb) {
        $http({
            url: '/imagex/tokennew/'+eid
        }).then(
            function(res){
                cb(res.data)
            },
            function(err){
                console.dir(err);
            });
    }


    $scope.addImages = function(){
        $scope.searchImages(function(){
            var limit = 60;
            $scope.getBoundaries(limit);
            var counter = 0;
            angular.forEach($scope.images, function(coords, imageid) {
                if(counter < limit){
                    $scope.images[imageid].shown = true;
                    //console.dir(imageid);
                    $scope.rebound(function(){$scope.addImage(imageid, counter+100)});
                    //setTimeout(function(){$scope.zoomout();}, 1000);
                    counter++;
                }
            });
        });
    }

    $scope.clear = function(){
        $scope.images = {};
        $scope.viewer.destroy();
        $scope.viewer = OpenSeadragon({
            id: "openseadragon1",
            preserveViewport: true,
            crossOriginPolicy: 'Anonymous',
            prefixUrl: "/imagex/node_modules/openseadragon/build/openseadragon/images/"
        });

        $scope.viewer.addViewerInputHook({hooks: [
            {tracker: 'viewer', handler: 'moveHandler', hookHandler: $scope.onViewerMove},
            {tracker: 'viewer', handler: 'clickHandler', hookHandler: $scope.onViewerClick}
        ]});


    }

    $scope.getCoords = function(imageid){
        return $scope.images[imageid];
    }

    $scope.getCenters = function(){
        $scope.getCenter();
        console.log($scope.centerRA);
        return [$scope.centerRA, $scope.centerDEC];
    }

    $scope.model = {};
    $scope.associations = {};

    $scope.addImage = function(imageid, counter){

        // var id = Math.floor(Math.random() * 10) + 77000
        //$scope.getToken('reduced',imageid, function(token){
        $scope.getTokenNew(imageid, function(token){
            var placement = $scope.scaleImg(imageid);
            //console.dir(placement);
            //console.log($scope.viewer.viewport.viewportToViewerElementRectangle(placement));
            //var source = "https://spitz.sca.iu.edu/odi/tiles/reduced/"+imageid+"/image.dzi?at="+token;
            var source = "https://youngmd6.sca.iu.edu/imagexdata/imagex/"+imageid+"/image.dzi?at="+token;
            //console.dir(imageid);
            $scope.viewer.addTiledImage({
                tileSource: source,
                index: parseInt(counter),
                x: placement.x,
                y: placement.y,
                width: placement.width,
                degrees: 0,
                success: function(event) {
                    $scope.associations[imageid] = event.item;
                    $scope.associations[imageid].selected = false;
                    $scope.associations[imageid].degrees = 0;
                }
            });
        });

        // $scope.viewer.addTiledImage({
        //     tileSource: "public/tiles/tiff_15/image.dzi",
        //     width: 0.1,
        //     success: $scope.moveImage
        // });
        // $scope.getToken();
    };

    $scope.visibleImages = [];

    $scope.deal = function(){
        angular.forEach($scope.associations, function(image, imageid){
            var tmppos = new OpenSeadragon.Point(0, 0);
            var tmprot = Math.random()*360;
            var edge = image.getBounds();
            var pos = new OpenSeadragon.Point(edge.x, edge.y);
            image.setPosition(tmppos);
            image.setRotation(tmprot);
            setTimeout(function(){image.setPosition(pos); image.setRotation(0);}, Math.random()*3000+1000);
        })
    };


    $scope.registerImage = function(imgObj){
        console.dir(imgObj.item);

        console.dir($scope.viewer.world.getIndexOfItem(imgObj.item));
        var idx = $scope.viewer.world.getIndexOfItem(imgObj.item);
        console.dir($scope.associations[idx]);
        var edges = imgObj.item.getBounds();
        //console.dir(imgObj.item);
        var pos = new OpenSeadragon.Point(edges.x, edges.y);
        var tmppos = new OpenSeadragon.Point(-100000, -100000);
        var obj = imgObj.item;
        obj.setPosition(tmppos);
        var hidden = false;
        for(var i in $scope.visibleImages){
            var r2 = $scope.visibleImages[i];
            var overlap = $scope.getOverlap(edges, r2);
            //console.log(overlap);
            if(overlap && overlap.fracr1 > 0.95){
                console.log(overlap);
                imgObj.item.setOpacity(0);
                hidden = true;
                console.log('Hidden!');
                break;
            }
        }
        if(!hidden){
            $scope.visibleImages.push(edges);
        }
        setTimeout(function(){obj.setPosition(pos)}, Math.random()*2000);

    };

    $scope.getOverlap = function(r1, r2){

        if(r1.x > r2.x + r2.width || r2.x > r1.x + r1.width || r1.y > r2.y + r2.height || r2.y > r1.y + r1.height) {
            return null;
        }

        var r1area = (r1.x + r1.width) * (r1.y + r1.height);
        var r2area = (r2.x + r2.width) * (r2.y + r2.height);

        var overlap = {
            x: Math.max(r1.x, r2.x),
            y: Math.max(r1.y, r2.y),
            width: Math.min(r1.x + r1.width, r2.x + r2.width) - Math.max(r1.x, r2.x),
            height: Math.min(r1.y + r1.height, r2.y + r2.height) - Math.max(r1.y, r2.y),
            fracr1: 0,
            fracr2: 0
        };

        var oarea = (overlap.x + overlap.width) * (overlap.y + overlap.height);

        overlap.fracr1 = oarea / r1area;
        overlap.fracr2 = oarea / r2area;

        return overlap;

    }

    $scope.overlays = [];


});

myapp.controller('ActivityController', function ($scope, $http, $interval, $rootScope, toaster) {
    $scope.title = "ImageX";

    $scope.comp_proc = {};
    $scope.curr_proc = {};
    $scope.pend_proc = {};


    $scope.getStatus = function(pid){
        if(!(pid in $scope.curr_proc)){
            var promise = $scope.watchers[pid];
            $interval.cancel(promise);
            return;
        }
        var process = $scope.curr_proc[pid];
        $http.get("/imagex-api/processes/"+process.id).
            then(function(res) {
                if(res.data.status == 'COMPLETE' || res.data.status == 'ERROR' || res.data.progress == 1.0){
                    var promise = $scope.watchers[pid];
                    $interval.cancel(promise);
                    //var index = $scope.curr_proc.indexOf(process);
                    delete $scope.curr_proc[pid];
                    $scope.comp_proc[pid] = res.data;
                } else {
                    $scope.curr_proc[pid] = res.data;
                }

        });
    };

    $scope.watchers = {};

    $scope.clear_curr_proc = function(proc) {
        var promise = $scope.watchers[proc.id];
        $http.delete("/imagex-api/processes/"+proc.id).
        then(function(res) {
            $interval.cancel(promise);
            delete $scope.curr_proc(proc);
            toaster.pop('success', '', "Active Process Removed");
        })
    }

    $scope.clear_comp_proc = function(proc) {
        $http.delete("/imagex-api/processes/"+proc.id).
        then(function(res) {
            var index = $scope.comp_proc.indexOf(proc);
            $scope.comp_proc.splice(index, 1);
            toaster.pop('success', '', "Completed Process Removed");
        })
    }

    $scope.getRecent = function() {
        var d = Date.now() - (24 * 60 * 60 * 1000);
        var procsearch = "filter[where][status][like]=COMPLETE&[filter[where][ended_at][gt]="+d;
        $http.get("/imagex-api/processes?"+procsearch).
            then(function(res) {
                console.dir(res);
                $scope.comp_proc = res.data;
                $scope.$applyAsync();
        });
    };

    $scope.getCurrent = function() {
        var where = "filter[where][progress][lt]=1";
        $http.get("/imagex-api/processes?"+where).
            then(function(res) {
                console.dir(res);
                if($scope.curr_proc == {}) {
                    $scope.curr_proc = res.data;
                    $scope.$applyAsync();
                    $scope.getUpdates();
                } else {
                    angular.forEach(res.data, function(value, pid){
                        if(!(pid in $scope.curr_proc)){
                            $scope.curr_proc[pid] = value;
                            $scope.watchProc(value.id, pid);
                            $scope.$applyAsync();
                        }
                    })
                }
        });
    };

    $scope.watchProc = function(id, key){
        $scope.watchers[id] = $interval(function() {
                $scope.getStatus(key);
            }, 3000);
            $scope.$on('$destroy',function(){
                if(promise)
                    $interval.cancel($scope.watchers[id]);
            });
    }

    $scope.getUpdates = function() {
        angular.forEach($scope.curr_proc, function(value, key){
            $scope.watchProc(value.id, key);
        });
    }

    $scope.getCurrent();
    $scope.getRecent();

    $scope.watchers['checkForNew'] = $interval(function() {
                $scope.getCurrent();
                //toaster.pop('info', '', "Checking for new processes");
                console.log('checking for new processes');
            }, 5000);

    $scope.$on('$destroy',function(){
        if(promise)
            $interval.cancel($scope.watchers['checkForNew']);
    });
});


myapp.controller('SigninController', function ($scope, $http, toaster, appconf, AuthService) {

    $scope.guestlogin = function() {
        $scope.username = 'guest@imagex.sca';
        $scope.password = 'demo';
        $scope.login();
    }

    $scope.login = function() {
        if ($scope.username == "") {
            toaster.pop('error', 'Invalid or empty username', "Please enter a valid email");
        } else {
            AuthService.login($scope.username, $scope.password, function (res) {
                if (res) {
                    var redirect = sessionStorage.getItem('auth_redirect');
                    if (redirect == "") redirect = appconf.default_redirect_url;
                    toaster.pop('success', 'Redirect', "Redirecting to " + redirect);
                } else {
                    toaster.pop('error', 'Login Failed', "Check username/password");
                }
            });
        }
    };
});

myapp.controller('UploadController', function ($scope, $http, FileUploader, toaster) {
    $scope.title = "ImageX";

    $scope.rows = [];
    var uploader = $scope.uploader = new FileUploader({
        url: 'upload'
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
