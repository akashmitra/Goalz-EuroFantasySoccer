(function () {
    // Landing Controller
    // =============================================================================
    var app = angular.module('goalzApp', ['ui.bootstrap', 'LocalStorageModule', 'ngIdle']);

    app.controller('landingCtrl', ['$scope', '$http', '$window', 'localStorageService', 'Idle', 'Keepalive', function (sc, $http, $window, localStorageService, Idle, Keepalive) {

        if (localStorageService.length() == 0) {
            $window.location.href = "\login";
            return;
        }

        sc.$on('IdleTimeout', function () {
            localStorageService.clearAll();
            $window.location.href = "\login";
        });

        sc.navbarCollapsed = false;
        sc.showLeaderboard = false;
        sc.userId = localStorageService.get('userId');
        sc.userdata = localStorageService.get('loginresp');
        sc.teamPoints = sc.userdata.uservo.teamPoints;
        sc.playerPoints = sc.userdata.uservo.playerPoints;
        sc.serverCurrentTime = sc.userdata.serverCurrentTime;
        var matches = sc.matches = sc.userdata.fixtures;
        sc.active = 2;
        console.log(sc.userId);
        console.log(sc.userdata);

        //start of leaderboard functionality

        sc.leaderboard = {};

        var req = {
            method: 'GET',
            url: './json/leaderboardres.json'
        };

        sc.postpromise = $http(req)
            .success(function (response) {
                sc.leaderboard.superteam = response.superTeamVO.userPointsVO;
                // console.log('leaderboard.superteam' +sc.leaderboard.superteam);
                sc.leaderboard.supereleven = response.superElevenVO.userPointsVO;

            });

        //end of leaderboard functionality
        sc.logout = function () {
            localStorageService.clearAll();
            if (localStorageService.length() == 0) {
                $window.location.href = "\login";
            }
        };

    }]);

    app.run(['Idle', function (Idle) {
        Idle.watch();
    }]);


} ());


