/*global angular*/
/*global $*/
var app = angular.module('list', ['angular-growl']);

app.config(['growlProvider', function(growlProvider) {
    growlProvider.globalTimeToLive(8000);
    growlProvider.globalPosition('bottom-center');
}]);

var mainController = function($scope, growl) {
    $scope.message = '';
    $scope.parents = [];
    $scope.posts = [];
    $scope.currentCat = {};
    $scope.sortType = 'createdAt';
    $scope.sortReverse  = true;
    $scope.searchFish   = '';

    var url_string = window.location.href;
    var url = new URL(url_string);
    var id = url.searchParams.get("id");
    $scope.id = id;

    $scope.error = function(text) {
        growl.error(text, { referenceId: 1 });
    };

    $scope.goTo = function(link) {
        $location.path(link);
    };

    $scope.getList = function() {
        $.ajax({
            method: "GET",
            dataType: 'json',
            url: "api/post/byCat/" + id,
            success: function(r) {
                console.log(r);
                $scope.posts = r;
                $scope.$apply();
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log("ERROR: " + textStatus, errorThrown);
            }
        });
    };

    $scope.getCategories = function getCategories() {
        $.ajax({
            method: "GET",
            dataType: 'json',
            url: "api/category/getParents/" + id,
            success: function(r) {
                if (r.status == "notfound") {
                    window.location = "/list?id=5a650c8bb62a0c8536f056c7";
                }
                else {
                    $scope.parents = r;
                    $scope.$apply();
                }


            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log("ERROR: " + textStatus, errorThrown);
            }
        });
    };

    $(document).ready(function() {
        $scope.user = $("#user").val();
        $('[data-toggle="tooltip"]').tooltip(); 
        $scope.getCategories();
        $scope.getList();
    });

};
app.controller("mainController", ["$scope", "growl", mainController]);
