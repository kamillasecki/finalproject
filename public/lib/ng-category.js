/*global angular*/
/*global $*/
var app = angular.module('cat', ['angular-growl']);

app.config(['growlProvider', function(growlProvider) {
  growlProvider.globalTimeToLive(8000);
  growlProvider.globalPosition('bottom-center');
}]);

var mainController = function($scope, growl) {
    $scope.message = '';
    $scope.parents = [];
    $scope.currentCat = {};


    var url_string = window.location.href;
    var url = new URL(url_string);
    var id = url.searchParams.get("id");
    console.log(id);
    
      $scope.error = function (text) {
        growl.error(text,{referenceId: 1});

    }

  
    $scope.getCategories = function getCategories() {
        $.ajax({
            method: "GET",
            dataType: 'json',
            url: "api/category/getParents/" + id,
            success: function(r) {
                if(r.status == "notfound") {
                    window.location = "/category?id=5a650c8bb62a0c8536f056c7";
                } else {
                    $scope.parents = r;
                $scope.$apply();
                console.log(r);
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
            url: "api/category/" + id,
            success: function(response) {
                $scope.getCategories();
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log("ERROR: " + textStatus, errorThrown);
                growl.error(jqXHR.responseText,{referenceId: 2});
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
                
                growl.error(jqXHR.responseText,{referenceId: 1});
            }
        });
    };
};
app.controller("mainController", ["$scope", "growl", mainController]);
