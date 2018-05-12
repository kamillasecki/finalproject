/*global angular*/
/*global $*/
var app = angular.module('cat', ['angular-growl', 'ngMaterial', 'ngMessages']);


app.config(function($mdThemingProvider) {
    $mdThemingProvider.theme('default')
        .primaryPalette('pink')
        .accentPalette('orange');
});

app.config(['growlProvider', function(growlProvider) {
    growlProvider.globalTimeToLive(8000);
    growlProvider.globalPosition('bottom-center');
}]);

var mainController = function($scope, growl, $location) {
    $scope.message = '';
    $scope.parents = [];
    $scope.currentCat = {};

    $scope.error = function(text) {
        growl.error(text, { referenceId: 1 });
    };


    $scope.getCategories = function getCategories() {
        $.ajax({
            method: "GET",
            dataType: 'json',
            url: "/api/category/getParents/" + $("#id").val(),
            success: function(r) {
                if (r.status == "notfound") {
                    window.location = "/category/5a650c8bb62a0c8536f056c7";
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

    $scope.remove = function remove(id) {
        console.log("removing cat " + id);

        $.ajax({
            method: "DELETE",
            url: "/api/category/" + id,
            success: function(response) {
                $scope.getCategories();
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log("ERROR: " + textStatus, errorThrown);
                growl.error(jqXHR.responseText, { referenceId: 2 });
            }
        });
    };

    $(document).ready(function() {
        $scope.getCategories();
    });

    $scope.send = function sent() {
        $.ajax({
            method: "POST",
            url: "/api/category",
            data: { "category": $scope.text, parent: $scope.parents[0]._id },
            success: function(response) {
                $scope.getCategories();
                $scope.text = null;
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log("ERROR: " + textStatus, errorThrown);
                console.log("ERROR: " + jqXHR.responseText);

                growl.error(jqXHR.responseText, { referenceId: 1 });
            }
        });
    };
};
app.controller("mainController", ["$scope", "growl", "$location", mainController]);
