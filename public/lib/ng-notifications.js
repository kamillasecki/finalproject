/*global angular*/
/*global $*/
var app = angular.module('list', ['angular-growl', 'ngMaterial', 'ngMessages']);

app.config(['growlProvider', function(growlProvider) {
    growlProvider.globalPosition('top-center');
    growlProvider.globalTimeToLive(5000);
}]);

app.config(function($mdThemingProvider) {
    $mdThemingProvider.theme('default')
        .primaryPalette('pink')
        .accentPalette('orange');
});

var mainController = function($scope, $http, growl, $mdDialog) {

    $scope.user = $("#user").val();
    $scope.message = '';
    $scope.notifications = [];
    $scope.sortType = 'createdAt';
    $scope.displaying = '';
    $scope.sortReverse = true;

    $scope.getMyCtrlScope = function() {
        return $scope;
    };

    var onRead = function() {
        $http.get("/api/notifications/" + $scope.user)
            .then(onComplete, error)
            .catch(angular.noop);
    };

    $scope.notificationClick = function(id) {
        if ($scope.displaying == id) {
            $scope.displaying = '';
        }
        else {
            $scope.displaying = id;
            $http.put("/api/notification/read/" + id)
                .then(onRead, error)
                .catch(angular.noop);
        }
    };

    $scope.error = function(text) {
        growl.error("ERROR!", { referenceId: 1 });
    };

    //on successfull aquire list of posts
    var onComplete = function(r) {
        $scope.notifications = r.data;
    };

    var actionConfirmed = function(r) {
        console.log(r)
        $mdDialog.show(
            $mdDialog.alert()
            .clickOutsideToClose(true)
            .title(r.data.status)
            .textContent(r.data.message)
            .ariaLabel(r.data.status)
            .ok('ok')
            .openFrom('#left')
            .closeTo('#right')
        );

        $http.get("/api/notifications/" + $scope.user)
            .then(onComplete, error)
            .catch(angular.noop);
    };

    //on failure
    var error = function(e) {
        console.log(e);
    };

    //loading notifications
    if ($scope.user) {
        $http.get("/api/notifications/" + $scope.user)
            .then(onComplete, error)
            .catch(angular.noop);
    }
    else {
        console.log("USER NOT FOUND");
        //window.location = "/list?id=5a650c8bb62a0c8536f056c7";
    }

    //allowing post access
    $scope.accessReqAllow = function(id) {
        $http.post("/api/notifications/allowPostAccess/" + id)
            .then(actionConfirmed, error)
            .catch(angular.noop);
    };

    //denying post access
    $scope.accessReqDeny = function(id) {
        $http.post("/api/notifications/denyPostAccess/" + id)
            .then(actionConfirmed, error)
            .catch(angular.noop);
    };

    //accepting an invitation
    $scope.invitationAccept = function(id) {
        $http.post("/api/notifications/" + id + "/inviteAccept")
            .then(actionConfirmed, error)
            .catch(angular.noop);
    };

    //declining an invitation
    $scope.invitationDecline = function(id) {
        $http.post("/api/notifications/" + id + "/inviteDecline")
            .then(actionConfirmed, error)
            .catch(angular.noop);
    };

    $scope.delete = function(id) {
        if (id) {
            $http.delete('/api/notification/' + id)
                .then(actionConfirmed, error)
                .catch(angular.noop);
        }
    };
};
app.controller("mainController", ["$scope", "$http", "growl", "$mdDialog", mainController]);
