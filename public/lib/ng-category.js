(function() {
    /*global angular*/
    /*global $*/
    var app = angular.module("cat", []);

    app.filter('reverse', function() {
        return function(items) {
            return items.slice().reverse();
        };
    });

    var MainController = function($scope) {
        $scope.message = '';
        $scope.parents = [];
        $scope.currentCat = {};

        var url_string = window.location.href;
        var url = new URL(url_string);
        var id = url.searchParams.get("id");
        console.log(id);

        $scope.getCategories = function getCategories() {
            $.ajax({
                method: "GET",
                dataType: 'json',
                url: "/getParents/" + id,
                success: function(response) {
                    $scope.parents = response;
                    $scope.$apply();
                    console.log($scope.parents);
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
                url: "api/category/" + id,
                success: function(response) {
                    $scope.getCategories();
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log("ERROR: " + textStatus, errorThrown);
                }
            });
        }

        $(document).ready(function() {
            $scope.getCategories()
        })

        $scope.send = function sent() {
            $.ajax({
                method: "POST",
                url: "api/category",
                data: { "category": $scope.text, parent: $scope.parents[0]._id },
                success: function(response) {
                    $scope.getCategories();
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log("ERROR: " + textStatus, errorThrown);
                    console.log("ERROR: " + jqXHR.responseText);
                }
            });
        };
    };
    app.controller("MainController", ["$scope", "$http", MainController]);
}());
