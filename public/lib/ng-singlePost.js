/*global angular*/
/*global $*/
/*global CryptoJS*/
var keySize = 256;
var ivSize = 128;
var iterations = 100;
var app = angular.module('post', ['angular-growl']);
var encryption = false;

app.config(['growlProvider', function(growlProvider) {
    growlProvider.globalPosition('bottom-center');
}]);

var mainController = function($scope, growl) {
    $scope.post = {};
    $scope.checkword = "";

    var url_string = window.location.href;
    var url = new URL(url_string);
    var id = url.searchParams.get("id");

    $scope.error = function(text) {
        growl.error(text, { referenceId: 1 });
    };

    $(document).ready(function() {
        $.ajax({
            method: "GET",
            dataType: 'json',
            url: "api/post/" + id,
            success: function(response) {
                if (response == "NotFound") {
                    // data.redirect contains the string URL to redirect to
                    window.location = "/"
                }
                else {
                    $scope.post = response;
                    $scope.$apply();
                    console.log(response);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log("ERROR: " + textStatus, errorThrown);
                
            }
        });
    });

    $scope.encrypt = function(input, password) {

        var salt = CryptoJS.lib.WordArray.random(128 / 8);
        var key = CryptoJS.PBKDF2(password, salt, {
            keySize: keySize / 32,
            iterations: iterations
        });
        var iv = CryptoJS.lib.WordArray.random(128 / 8);
        var encrypted = CryptoJS.AES.encrypt(input, key, {
            iv: iv,
            padding: CryptoJS.pad.Pkcs7,
            mode: CryptoJS.mode.CBC
        });
        var checkword = CryptoJS.AES.encrypt("decrypted", key, {
            iv: iv,
            padding: CryptoJS.pad.Pkcs7,
            mode: CryptoJS.mode.CBC
        });
        $scope.encrypted = salt.toString() + iv.toString() + encrypted.toString();
        $scope.checkword = salt.toString() + iv.toString() + checkword.toString();
    };
};

app.controller("mainController", ["$scope", "growl", mainController]);
