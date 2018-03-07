'use strict';


myapp.controller('GameController', function($scope, $timeout, $window, $routeParams) {

    $scope.tokens = $routeParams.tokens !== undefined ? $routeParams.tokens : 5;
    $scope.starting_tokens = $routeParams.tokens !== undefined ? $routeParams.tokens : 5;

    $scope.delay = $routeParams.delay !== undefined ? parseInt($routeParams.delay) * 1000 : 3000;
    $scope.delay += 3000;
    $scope.round = 1;
    $scope.max_rounds = 5;
    $scope.free_corrector = true;
    $scope.selection = false;

    $scope.status = 'tiles';
    $scope.chosen_tile = false;

    $scope.selected = '';

    $scope.passcode = '';

    $scope.purchased = [];

    $scope.source;

    $scope.codes = [
        '',
        'zvhan9yafajhahajhck5',
        'kgkcgkgkckcg8b57bn4c',
        'txsrs3x1x9pop9pxao9p',
        'lyiolioy91qmp9ylm9ok',
        'b7mwb7mbw7wm907x2nm2m'
    ];

    $scope.tiletypes = [
        {'type' : 1, cost: 3, label: '$$$$', desc: 'Tiles marked with “$$$$” will give you a very high number of points. They cost 3 tokens.'},
        {label: '$$$', type: 2, cost: 2, desc: 'Tiles marked with “$$$” will give you a high number of points.They cost 2 tokens.'},
        {label: '$', type: 3, cost: 1, desc: 'Tiles marked with “$” will give you a low number of points.They cost 1 token.'},
        {label: '$$$$', label2: 'or NOTHING', type: 4, cost: 2, desc: 'Tiles marked with “$$$$ or NOTHING” will give you a very high number of points OR no points at all.They cost 2 tokens.'},
        {label: '?', type: 5, cost: 2, desc: 'This is a mystery tile. You do not know how many points a mystery tile will give you. Note: some mystery tiles cost 1 token and some cost 2 tokens. See each tile for the price.'}
    ];

    $scope.show_tiletypes = function() {
        $scope.status = 'tiletypes';
    }

    $scope.return_to_game = function() {
        $scope.status = 'tiles';
    }

    $scope.tiles = [
        [
            {id: 1, label: '$$$', bought: false, type: 2, cost: 2},
            {id: 2, label: '?', bought: false, type: 5, cost: 2},
            {id: 3, label: '$', bought: false, type: 3, cost: 1},
            {id: 4, label: '', bought: false, type: 6, cost: 0}
        ],
        [
            {id: 5, label: '$', bought: false, type: 3, cost: 1},
            {id: 6, label: '?', bought: false, type: 5, cost: 1},
            {id: 7, label: '$', bought: false, type: 3, cost: 1},
            {id: 8, label: '$', bought: false, type: 3, cost: 1}
        ],
        [
            {id: 9, label: '', bought: false, type: 6, cost: 0},
            {id: 10, label: '$$$', bought: false, type: 2, cost: 2},
            {id: 11, label: '$$$$', label2: 'or NOTHING', bought: false, type: 4, cost: 2},
            {id: 12, label: '', bought: false, type: 6, cost: 0}
        ],
        [
            {id: 13, label: '?', bought: false, type: 5, cost: 2},
            {id: 14, label: '$$$$', bought: false, type: 1, cost: 3},
            {id: 15, label: '$', bought: false, type: 3, cost: 1},
            {id: 16, label: '$$$$', label2: 'or NOTHING', bought: false, type: 4, cost: 2}
        ]
    ];

    $scope.clear_tiles = function() {
        if($scope.round == 3){
            if($scope.tiles[0][0].bought == false){
                $scope.tiles[0][0].type = 6;
            } else {
                $scope.tiles[2][1].type = 6;
            }
        }

        if($scope.round == 5){
            if($scope.tiles[0][2].bought == false){
                $scope.tiles[0][2].type = 6;
            } else {
                $scope.tiles[1][2].type = 6;
            }
        }
    };


    $scope.buyme = function(tile) {
        if(tile.type == 6 || tile.bought){
            return;
        }
        if(tile.cost > $scope.tokens){
            $scope.message = 'Insufficient funds!';
            return;
        } else {
            if($scope.selected !== '') $scope.selected.selected = '';
            $scope.selectmessage = 'You have selected tile '+tile.id;
            $scope.message = '';
            $scope.chosen_tile = tile;
            tile.selected = 'selected';
            $scope.selected = tile;
        }
    };

    $scope.confirm = function(tile) {

        console.log(tile);
        if(tile !== null && tile != false){
            $scope.tokens -= tile.cost;
            tile.bought = true;
            tile.selected = '';
            tile.type = 6;
        }

        if(tile == false) {
            $scope.message = 'Please select a tile.';
            return;
        }

        // $scope.source.postMessage( "Tile purchased: " + tile.id, '*');

        var purchased_id = tile !== null ? tile.id : null;
        $scope.purchased.push(purchased_id);
        $scope.chosen_tile = false;
        $scope.status = 'waiting';
        $timeout(function(){
            $scope.status = 'passcode2';
            $scope.message = '';
            $scope.selectmessage = '';
        }, Math.floor(Math.random() * $scope.delay));
    };

    $scope.next = function() {
        $scope.status = 'passcode2';
        $scope.reset_psub();
    };

    $scope.reset_psub = function() {
        $scope.pmessage = '';
        $scope.pready = false;
        $scope.buycorr = false;
        $scope.sub_asis = false;
        $scope.sub_free = false;
    };

    $scope.asis = function(pcode) {
        $scope.reset_psub();
        $scope.sub_asis = true;
        $scope.submit_passcode(pcode);
        //$scope.pmessage = 'You have selected to submit your code as it is';
    }

    $scope.usefree = function(pcode) {
        $scope.reset_psub();
        $scope.sub_free = true;
        $scope.submit_passcode(pcode);
        //$scope.pmessage = 'You have selected to use your one free "corrector".  This can only be used once.';
    }

    $scope.buy_corrector = function(pcode) {
        $scope.reset_psub();
        if($scope.tokens < 1){
            $scope.pmessage = 'Insufficient funds!';
        } else {
            $scope.buycorr = true;
            $scope.submit_passcode(pcode);
            //$scope.pmessage = 'You have selected to pay 1 token to fix up to 2 mistakes in your secret code';
        }
    }

    $scope.accuracy = {};

    $scope.submit_passcode = function(passcode) {
        if(passcode == ''){
            $scope.reset_psub();
            $scope.pmessage = 'Please type your secret code.';
            return;
        }
        console.log(passcode);
        if($scope.buycorr){
            $scope.tokens--;
        }

        $scope.accuracy['Round '+$scope.round] = $scope.similarity(passcode.split('').reverse().join(''), $scope.codes[$scope.round]);

        console.log($scope.accuracy);
        $scope.passcode = '';
        if($scope.sub_free){
            $scope.free_corrector = false;
        }
        $scope.status = 'waiting2';
        $scope.round++;
        $scope.clear_tiles();
        if($scope.round > 5){
            $scope.status = 'gameover';
            var results = {
                tiles_purchased : $scope.purchased,
                accuracy: $scope.accuracy,
                starting_tokens : $scope.starting_tokens,
                ending_tokens : $scope.tokens
            };
            $scope.source.postMessage( results, '*');

        } else {
            $timeout(function(){
                $scope.status = 'tiles';
                $scope.message = '';
            }, Math.floor(Math.random() * $scope.delay));
        }
    };

    $scope.similarity = function(s1, s2) {
        console.log((s1, s2));
        var longer = s1;
        var shorter = s2;
        if (s1.length < s2.length) {
            longer = s2;
            shorter = s1;
        }
        var longerLength = longer.length;
        if (longerLength == 0) {
            return 1.0;
        }
        return (longerLength - $scope.editDistance(longer, shorter)) / parseFloat(longerLength);
    };

    $scope.editDistance = function(s1, s2) {
        s1 = s1.toLowerCase();
        s2 = s2.toLowerCase();

        var costs = new Array();
        for (var i = 0; i <= s1.length; i++) {
            var lastValue = i;
            for (var j = 0; j <= s2.length; j++) {
                if (i == 0)
                    costs[j] = j;
                else {
                    if (j > 0) {
                        var newValue = costs[j - 1];
                        if (s1.charAt(i - 1) != s2.charAt(j - 1))
                            newValue = Math.min(Math.min(newValue, lastValue),
                                    costs[j]) + 1;
                        costs[j - 1] = lastValue;
                        lastValue = newValue;
                    }
                }
            }
            if (i > 0)
                costs[s2.length] = lastValue;
        }
        console.log(costs);
        return costs[s2.length];
    };

    $window.addEventListener('message', function(event) {
        console.dir(event.source);
        $scope.source = event.source;
        //console.log('Setting event source to '+event.source);
    });



});