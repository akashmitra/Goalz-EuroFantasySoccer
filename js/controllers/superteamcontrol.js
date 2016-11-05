// Super Team Controller
// =============================================================================
var app = angular.module('goalzApp', ['ui.bootstrap', 'LocalStorageModule', 'ngIdle']);

app.constant('moment', moment);

app.controller('superteamCtrl', ['$scope', '$http', '$window', 'moment', 'localStorageService', 'Idle', 'Keepalive', function(sc, $http, $window, moment, localStorageService, Idle, Keepalive) {


    if (localStorageService.length() == 0) {
        $window.location.href = "\login.html";
        return;
    }

    sc.$on('IdleTimeout', function() {
    localStorageService.clearAll();
    $window.location.href = "\login";
    });

    sc.navbarCollapsed = false;
    sc.showLeaderboard = false;
    pointsError = false;
    sc.predictedValues = {};
    sc.existingPrediction = [];
    sc.newPrediction = [];

    //fetch login response from local storage
    sc.loginresp = localStorageService.get('loginresp');
    sc.userId = localStorageService.get('userId');
    sc.serverCurrentTime = sc.loginresp.serverCurrentTime;

    //To check if match starts within 2 hours from user login
    sc.fixtures = sc.loginresp.fixtures;
    sc.userCannotPlay = [];
    angular.forEach(sc.fixtures, function(fixture, index) {
        var matchDateTime = fixture.matchDateTime;
        var serverCurrentTime = sc.loginresp.serverCurrentTime
        var matchtime = moment(matchDateTime);
        var servertime = moment(serverCurrentTime);
        var differenceintime = (matchtime.diff(servertime)) / 3600000;

        if(differenceintime <= 2){
            sc.userCannotPlay.push(fixture.matchId);
            sc.userCannotPlayWarning = "You cannot predict for this game, the match starts within 2 hours";
        }
    });


    var req = {
        method: 'GET',
        url: './json/superteamres.json'
    }

    sc.postpromise = $http(req)
        .success(function(response) {
            sc.teamPoints = response.userPointsVO.teamPoints;
            sc.playerPoints = response.userPointsVO.playerPoints;
            sc.results = response.fixtureVOList;
            sc.prediction = response.userPointsVO.superTeamPredictionVO;

            angular.forEach(sc.results, function(result, index) {
                var matchId = result.matchId;
                sc.predictedValues = {
                    'superTeamPredictionId': null,
                    'teams': {
                        'teamId': null
                    },
                    "fixture": {
                        "matchId": matchId
                    },
                    'userAllocPoints': null
                };
                
                sc.existingPrediction.push({
                    [matchId]: sc.predictedValues });

                if (sc.prediction.length > 0) {

                    angular.forEach(sc.prediction, function(matchPredict) {

                        if (matchPredict.fixture.matchId == matchId) {

                            sc.existingPrediction[index][matchId] = {
                                'superTeamPredictionId': matchPredict.superTeamPredictionId,
                                'teams': {
                                    'teamId': matchPredict.teams.teamId
                                },
                                "fixture": {
                                    "matchId": matchPredict.fixture.matchId
                                },
                                'userAllocPoints': matchPredict.userAllocPoints

                            };

                        }

                    });
                }
            });
        });


    //start of leaderboard functionality

 sc.leaderboard={};

     var req = {
            method: 'GET',
            url: './json/leaderboardres.json'
        };

        sc.postpromise = $http(req)
        .success(function(response) {
            sc.leaderboard.superteam=response.superTeamVO.userPointsVO;
           // console.log('leaderboard.superteam' +sc.leaderboard.superteam);
            sc.leaderboard.supereleven=response.superElevenVO.userPointsVO;

        });

//end of leaderboard functionality

    // function for logout
    sc.logout = function() {
        localStorageService.clearAll();
        if (localStorageService.length() == 0) {
            $window.location.href = "\login";
        }
    };


    //function to submit match prediction
    sc.submitPrediction = function() {
        var superTeamPredictionVOList = [];
        sc.newAllocPoints = [];
        sc.totalAllocPoints = 0;

        angular.forEach(sc.results, function(result, index) {
            var matchId = result.matchId;

                if(sc.existingPrediction[index][matchId].superTeamPredictionId != null){
                    superTeamPredictionVOList.push(sc.existingPrediction[index][matchId]);
                }
                else if(sc.existingPrediction[index][matchId].superTeamPredictionId == null && sc.existingPrediction[index][matchId].userAllocPoints != null){
                    superTeamPredictionVOList.push(sc.existingPrediction[index][matchId]);
                }
            

        });

        console.log('new request data is :: ' + superTeamPredictionVOList);

        //validating if newly allocated points are less than available points
        angular.forEach(superTeamPredictionVOList, function(superTeamPrediction) {
            if (superTeamPrediction.superTeamPredictionId == null && superTeamPrediction.userAllocPoints != null) {
                sc.newAllocPoints.push(superTeamPrediction.userAllocPoints);
                console.log('newAlloc points formed');
            }
        });

        angular.forEach(sc.newAllocPoints, function(newPoints) {
            sc.totalAllocPoints = sc.totalAllocPoints + newPoints;
        });

        //checking if total points exceeds available

        try{

            if (sc.totalAllocPoints > sc.teamPoints) throw pointsError;
             //checking if total points within available 
        else {
            sc.pointsErrorMsg = "";

        //request data
            sc.finalRequest = {
                'userPointsVO' : {
                    'userId' : sc.userId
                },
                'superTeamPredictionVOList' : superTeamPredictionVOList
            }

            console.log("final request is :: "+sc.finalRequest);

            var req = {
                method: 'POST',
                url: './json/superteamres.json',
                // data : sc.finalRequest
            }
            sc.postpromise = $http(req)
                .success(function(response) {
                    $window.alert('Match prediction successful ::');
                     $window.location.reload();
                });

            }
        }

         catch(e){
            console.log('points error occured');
            sc.pointsErrorMsg = "You do not have sufficient Team Points. please enter a lesser value";
        }
       
    };

}]);


app.run(['Idle', function(Idle) {
  Idle.watch();
}]);
