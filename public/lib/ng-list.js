/*global angular*/
/*global $*/
var app = angular.module('list', []);

var mainController = function($scope, $http, growl) {
    $scope.message = '';
    $scope.parents = [];
    $scope.posts = [];
    $scope.currentCat = {};
    $scope.sortType = 'createdAt';
    $scope.sortReverse = true;

    var url_string = window.location.href;
    var url = new URL(url_string);
    var id = url.searchParams.get("id");
    $scope.id = id;

    //on successfull aquire list of parents categories
    var onParentsComplete = function(r) {
        $scope.parents = r.data;
        $http.get("/api/post/byCat/" + id)
        .then(onPostByCatComplete,redirect)
        .catch(angular.noop);
    };

    //on successfull aquire list of posts
    var onPostByCatComplete = function(r) {
        $scope.posts = r.data;
    };

    //on failure
    var redirect = function() {
        window.location = "/list?id=5a650c8bb62a0c8536f056c7";
    };

    //start chaining data requests
    if (id) {
        $http.get("api/category/getParents/" + id)
            .then(onParentsComplete, redirect)
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
