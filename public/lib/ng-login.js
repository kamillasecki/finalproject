/*global angular*/
/*global $*/

var app = angular.module('login', ['ngMaterial', 'ngMessages']);

app.config(function($mdThemingProvider) {
    $mdThemingProvider.theme('default')
        .primaryPalette('pink')
        .accentPalette('orange');
});

var mainController = function($scope, $http, $log, $timeout, $mdDialog) {

    

};

app.controller("mainController", ["$scope", "$http", "$log", "$timeout", "$mdDialog", mainController]);
