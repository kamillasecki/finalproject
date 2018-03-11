/*global angular*/
/*global $*/
var app = angular.module('list', []);

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
    var error = function() {
        window.location = "/list?id=5a650c8bb62a0c8536f056c7";
    };

    //start chaining data requests
    if (f) {
        $http.get("/api/post/find/" + f)
            .then(onSeachComplete, error)
            .catch(angular.noop);
    } else {
        window.location = "/list?id=5a650c8bb62a0c8536f056c7";
    }

    $scope.search = function() {
        var data = { 's': $scope.sfield };
        $.ajax({
            method: "POST",
            dataType: 'json',
            url: "api/post/find",
            data: data,
            success: function(r) {
                console.log("Search result:" + r);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log("ERROR: " + textStatus, errorThrown);
            }
        });
    };

    $(document).ready(function() {
        $scope.user = $("#user").val();
        $('[data-toggle="tooltip"]').tooltip();
    });

};
app.controller("mainController", ["$scope", "$http", mainController]);
