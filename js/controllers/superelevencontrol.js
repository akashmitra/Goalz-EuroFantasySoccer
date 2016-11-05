var app = angular.module('goalzApp', ['ui.bootstrap','ngDragDrop','LocalStorageModule', 'ngIdle']);

app.constant('moment', moment);

app.controller('superelevenCtrl', ['$scope','$http', '$timeout', '$filter', '$window', 'moment', 'localStorageService', 'Idle', 'Keepalive', function(sc, $http, $timeout, $filter, $window,moment, localStorageService, Idle, Keepalive) {

   if (localStorageService.length() == 0) {
    $window.location.href = "\login";
    return;
}

sc.$on('IdleTimeout', function() {
    localStorageService.clearAll();
    $window.location.href = "\login";
});

sc.navbarCollapsed = false;
sc.showLeaderboard = false;
sc.activeTab = 0;
sc.predictedValues = [];
sc.existingPrediction = [];


//Pagination
    sc.currentPage = 1;
  sc.totalItems_FWD = 7;
  sc.totalItems_MID = 11;
  sc.totalItems_DEF = 9;
 
  sc.itemsPerPage = 3;

  sc.setPage = function (pageNo) {
    $scope.currentPage = pageNo;
  };

  sc.pageChanged = function() {
    console.log('Page changed to: ' + sc.currentPage);
  };

sc.setItemsPerPage = function(num) {
  $scope.itemsPerPage = num;
  $scope.currentPage = 1; //reset to first paghe
}




    //function to toggle tabs
    sc.toggleTabs = function(index){
        sc.activeTab = index;
    };


    //Data to populate dropdown
    sc.positions = [{'id': 'FWD' , 'name': 'Forward'},
    {'id': 'MID' , 'name': 'Midfielder'},
    {'id': 'DEF' , 'name': 'Defender'},
    {'id': 'GK' , 'name': 'Goalkeeper'}];

    //fetch login response from local storage
    sc.loginresp = localStorageService.get('loginresp');
    sc.userId = localStorageService.get('userId');
    console.log("activeTab"+sc.activeTab);
    

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
            sc.userCannotPlayWarning = "Oops! You have just missed this game";
        }
    });



    var req = {
        method: 'GET',
        url: './json/superelevenres.json'
    }

    sc.postpromise = $http(req)
    .success(function(response) {
        console.log(response);
        sc.teamPoints = response.userPointsVO.teamPoints;
        sc.playerPoints = response.userPointsVO.playerPoints;
        sc.results = response.fixtureVOList;
        sc.prediction = response.userPointsVO.superPlayerPredictionVO;
        sc.currentMatchId = sc.results[0].matchId;
        sc.search=null;


    angular.forEach(sc.results, function(result, index){
        sc.predictedPlayers = [];
        var matchId = result.matchId;

        sc.mygk = [{'predictedPlayerId':null,'player':{'playerId' : null}},
        {'predictedPlayerId':null, 'player': {'playerId' : null}}
        ];
        sc.mydef = [{'predictedPlayerId':null,'player':{'playerId' : null}},
        {'predictedPlayerId':null,'player':{'playerId' : null}},
        {'predictedPlayerId':null,'player':{'playerId' : null}},
        {'predictedPlayerId':null,'player':{'playerId' : null}},
        {'predictedPlayerId':null,'player':{'playerId' : null}}
        ];
        sc.mymid = [{'predictedPlayerId':null,'player':{'playerId' : null}},
        {'predictedPlayerId':null,'player':{'playerId' : null}},
        {'predictedPlayerId':null,'player':{'playerId' : null}},
        {'predictedPlayerId':null,'player':{'playerId' : null}},
        {'predictedPlayerId':null,'player':{'playerId' : null}}
        ];
        sc.myfwd = [{'predictedPlayerId':null,'player':{'playerId' : null}},
        {'predictedPlayerId':null,'player':{'playerId' : null}},
        {'predictedPlayerId':null,'player':{'playerId' : null}},
        {'predictedPlayerId':null,'player':{'playerId' : null}}
        ];

        sc.myplayerLists = {
            'mygk' : sc.mygk,
            'mydef' : sc.mydef,
            'mymid' : sc.mymid,
            'myfwd' : sc.myfwd
        };

        result.myplayerLists = sc.myplayerLists;

        angular.forEach(sc.myfwd, function(myfwd)
        {
            sc.predictedPlayers.push(myfwd);
        });
        angular.forEach(sc.mymid, function(mymid)
        {
            sc.predictedPlayers.push(mymid);
        });
        angular.forEach(sc.mydef, function(mydef)
        {
            sc.predictedPlayers.push(mydef);
        });
        angular.forEach(sc.mygk, function(mygk)
        {
            sc.predictedPlayers.push(mygk);
        });



        console.log('sc.predictedPlayers' +sc.predictedPlayers);

        sc.predictedValues = {
            'predictionId' : null,
            "fixture": {
                "matchId": matchId
            },
            "predictedPlayers" : sc.predictedPlayers
        };

        sc.existingPrediction.push({
            [matchId]: sc.predictedValues });


        if (sc.prediction.length > 0) {

            angular.forEach(sc.prediction, function(matchPredict) {

                if (matchPredict.fixture.matchId == matchId) {

                    sc.existingPrediction[index][matchId] = {
                        'predictionId': matchPredict.predictionId,
                        'fixture': {
                            'matchId': matchPredict.fixture.matchId
                        },
                        "predictedPlayers": matchPredict.predictedPlayers
                    };
                }
            });
            console.log('Predicted match values::'+sc.existingPrediction[index][matchId]);
        } 

    });


console.log('existing prediction' +sc.existingPrediction);
});
        //function to set selected matchID
        sc.setMatchId = function(matchid){
            sc.currentMatchId = matchid
        };

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

    //function for logout
    sc.logout = function() {
        localStorageService.clearAll();
        if (localStorageService.length() == 0) {
            $window.location.href = "\login";
        }
    };

    // sc.matcher1 = function (playerLists){
    //     console.log('inside matcher1 filter');
    //     sc.predictedIds = [];
    //     var filteredTeam1 = []
    //     angular.forEach(sc.results, function(result, index){
    //         angular.forEach(sc.existingPrediction[index][result.matchId].predictedPlayers, function(predictedPlayer){
    //             sc.predictedIds.push(predictedPlayer.player.playerId);
    //         });
    //     });


    //     angular.forEach(playerLists, function(player){
    //         if(sc.predictedIds.indexOf(player.playerId) === -1)
    //         {
    //             filteredTeam1.push(player);
    //         }
    //     });
    //     return filteredTeam1;
    // };

    sc.filterPlayerList = function(result, index, search) {
        console.log('inside filterPlayerList');
        var matchId = result.matchId;
          sc.predictedIds = [];
          sc.filteredTeam1 =[];
            sc.filteredTeam2 = [];
            angular.forEach(sc.existingPrediction[index][matchId].predictedPlayers, function(predictedPlayer){
                sc.predictedIds.push(predictedPlayer.player.playerId);
            });
            console.log('sc.predictedIds'+sc.predictedIds);


              angular.forEach(result.team1.playerLists, function(player){
                if((player.position == search) && (sc.predictedIds.indexOf(player.playerId) == -1))
                {   
                    sc.filteredTeam1.push(player);
                }
            });
              angular.forEach(result.team2.playerLists, function(player){
                if((player.position == search) && (sc.predictedIds.indexOf(player.playerId) == -1))
                {
                    sc.filteredTeam2.push(player);
                }
            });

console.log('sc.filteredTeam1'+sc.filteredTeam1);
console.log('sc.filteredTeam2'+sc.filteredTeam2);
          

          return 0;
      };
          

    sc.submitPrediction = function(){

        var superPlayerPredictionVOList = [];
        sc.newAllocPoints = [];
        sc.totalAllocPoints = 0;

        try{
            sc.exceptionMsg = "";
            sc.errorMsg = "";
        //
        angular.forEach(sc.results, function(result, index){
           var matchId = result.matchId;
           if(sc.existingPrediction[index][matchId].predictionId == null){

            angular.forEach(sc.existingPrediction[index][matchId].predictedPlayers,function(predictedPlayer){
                if(predictedPlayer.player.playerId != null){
                    angular.forEach(sc.existingPrediction[index][matchId].predictedPlayers,function(predictedPlayer){
                        if(predictedPlayer.player.playerId == null && predictedPlayer.userAllocPoints == null) throw "err_1";
                    });
                    angular.forEach(sc.existingPrediction[index][matchId].predictedPlayers,function(predictedPlayer){
                     if(predictedPlayer.player.playerId != null && predictedPlayer.userAllocPoints == null) throw "err_2";
                 });
                }
            });

        }

    });

        //Populate superPlayerPredictionVOList with existing prediction and new prediction
        angular.forEach(sc.results, function(result, index) {
            var matchId = result.matchId;
            if(sc.existingPrediction[index][matchId].predictionId != null){
                superPlayerPredictionVOList.push(sc.existingPrediction[index][matchId]);
            }
            else if(sc.existingPrediction[index][matchId].predictionId == null && sc.existingPrediction[index][matchId].predictedPlayers[index].userAllocPoints != null){
                superPlayerPredictionVOList.push(sc.existingPrediction[index][matchId]);
            }      

        });


        //Make an array of all the user allocated points of new prediction
        angular.forEach(superPlayerPredictionVOList, function(superPlayerPrediction) {
            if (superPlayerPrediction.predictionId == null) {
                angular.forEach(superPlayerPrediction.predictedPlayers, function(players){
                   sc.newAllocPoints.push(players.userAllocPoints);                    
               });
            }
        }); 

        angular.forEach(sc.newAllocPoints, function(newPoints) {
            sc.totalAllocPoints = sc.totalAllocPoints + newPoints;
        });

     //checking if total points exceeds available 
     if (sc.totalAllocPoints > sc.playerPoints) throw "err_3";

         //checking if total points within available 
         else {
            sc.errorMsg = "";
        //request data
        sc.finalRequest = {
            'userPointsVO' : {
                'userId' : sc.userId
            },
            'superPlayerPredictionVOList' : superPlayerPredictionVOList
        }
        console.log("final request is :: "+sc.finalRequest);

        var req = {
            method: 'POST',
            url: './json/superelevenres.json',
                // data : sc.finalRequest
            }
            sc.postpromise = $http(req)
            .success(function(response) {
                $window.alert('Supereleven prediction successful ::');
                $window.location.reload();
            });

        };


    }catch(e) {
        // statements
        if(e == "err_1"){
            sc.exceptionMsg = "* Please select 16 players to complete your squad";
        }
        else if(e == "err_2"){
            sc.exceptionMsg = "* Please allocate points to all the players in your squad";
        }
        else if(e == "err_3"){
            sc.errorMsg = "You do not have sufficient Player Points. please enter a lesser value"; 
        }
    }
};

    
sc.resetGK= function(){
        sc.mygk = [{'predictedPlayerId':null,'player':{'playerId' : null}},
        {'predictedPlayerId':null, 'player': {'playerId' : null}}
        ];
    };

}]);


app.run(['Idle', function(Idle) {
  Idle.watch();
}]);




// app.filter('matcher1', function () {
//         return function(playerLists, predictedPlayerLists){
//             var filteredTeam1 = [];
//             angular.forEach(playerLists, function(player){
//                     if(predictedPlayerLists.indexOf(player.playerId) === -1)
//                         filteredTeam1.push(player);
//             });
//             return filteredTeam1;
//         }

//     });