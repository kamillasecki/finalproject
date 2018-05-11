/*global angular*/
/*global $*/
var app = angular.module('myList', []);

var mainController = function($scope, $http, growl) {
    $scope.message = '';
    $scope.posts = [];
    $scope.sortType = 'createdAt';
    $scope.sortReverse = true;

    var url_string = window.location.href;
    var url = new URL(url_string);
    var f = url.searchParams.get("f");
    $scope.f = f;

    //on successfull aquire list of posts
    var onSeachComplete = function(r) {
        $scope.posts = r.data;
    };

    //on failure
    var error = function(r) {
        console.log(r)
    };

    $(document).ready(function() {
        $scope.user = $("#user").val();
        $http.get("/api/post/myposts")
            .then(onSeachComplete, error)
            .catch(angular.noop);
        $('[data-toggle="tooltip"]').tooltip();
    });

};
app.controller("mainController", ["$scope", "$http", mainController]);
