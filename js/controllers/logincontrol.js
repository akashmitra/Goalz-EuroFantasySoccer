// =============================================================================
// Login Controller 
// =============================================================================
var app = angular.module('goalzApp', ['LocalStorageModule', 'ngIdle']);
app.constant('moment', moment);

app.controller('loginCtrl', ['$scope', '$http', '$window', 'moment','localStorageService', 'Encode', 'Idle', 'Keepalive', function(sc, $http, $window, moment, localStorageService, Encode, Idle, Keepalive) {

    sc.data = {};
    localStorageService.clearAll();

    sc.loginUser = function() {

        var logindata = {
            'userName': Encode.base64encode(sc.data.username),
            'password': Encode.base64encode(sc.data.password)
        }

        var req = {
            method: 'GET',
            url: './json/loginres.json'
        };

        sc.postpromise = $http(req)
        .success(function(response) {
            sc.loginresp = response;
            console.log(sc.loginresp);
            localStorageService.set('userId', sc.loginresp.uservo.userId);
            localStorageService.set('loginresp', sc.loginresp);




            var serverdatetime = sc.loginresp.serverCurrentTime;
            var logintime = moment(serverdatetime).format('HH:mm:ss');

            var logintimestring = logintime.toString();
            console.log('logintime' + logintime);

            var servertime = moment([logintimestring], 'HH:mm:ss');

            console.log('servertime' + servertime);

            var downtime_start = moment('02:59:00', 'HH:mm:ss');
            var downtime_end = moment('04:01:00', 'HH:mm:ss');
            if((servertime.isAfter(downtime_start))== true && (servertime.isBefore(downtime_end)) == true)
            {
                localStorageService.clearAll();
                $window.location.href = "\serverbusy";
            }


         if (localStorageService.length() != 0) {
            $window.location.href = "\index";
        }

});



        /*var req = {
            method: 'POST',
            url: 'Service_for_login',
            data: logindata
        }

        sc.loginpromise = $http(req)
            .success(function(response) {
                sc.loginresp = response;

            });*/


}

}]);
