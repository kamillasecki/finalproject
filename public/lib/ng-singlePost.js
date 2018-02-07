/*global angular*/
/*global $*/
/*global CryptoJS*/
var keySize = 256;
var ivSize = 128;
var iterations = 100;
var app = angular.module('post', ['angular-growl']);
var encryption = false;

app.config(['growlProvider', function(growlProvider) {
    growlProvider.globalPosition('top-center');
    growlProvider.globalTimeToLive(5000);
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

    $scope.uvp = function(u) {
        console.log("upvoting" + id);
        $.ajax({
            method: "GET",
            dataType: 'json',
            url: "api/post/upvote/" + id,
            success: function(r) {
                console.log(r);
                if (r.n) {
                    //update the score
                    $('#score').text(r.n);
                }
                else {
                    //display error message
                    growl.error("<strong>" + r.m + "</strong>");
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log("ERROR: " + textStatus, errorThrown);
            }
        });
    };

    $scope.dvp = function(u) {
        console.log("downvoting" +id);
        $.ajax({
            method: "GET",
            dataType: 'json',
            url: "api/post/downvote/" + id,
            success: function(r) {
                console.log(r);
                if (r.n) {
                    //update the score
                    $('#score').text(r.n);
                }
                else {
                    //display error message
                    growl.error("<strong>" + r.m + "</strong>");
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log("ERROR: " + textStatus, errorThrown);
            }
        });
    };
    
        $scope.uvr = function(u) {
        console.log("upvoting" + u);
        $.ajax({
            method: "GET",
            dataType: 'json',
            url: "api/post/reply/upvote/" + u,
            success: function(r) {
                console.log(r);
                if (r.n) {
                    //update the score
                    $('#score'+u).text(r.n);
                }
                else {
                    //display error message
                    growl.error("<strong>" + r.m + "</strong>");
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log("ERROR: " + textStatus, errorThrown);
            }
        });
    };

    $scope.dvr = function(u) {
        console.log("downvoting" + u);
        $.ajax({
            method: "GET",
            dataType: 'json',
            url: "api/post/reply/downvote/" + u,
            success: function(r) {
                console.log(r);
                if (r.n) {
                    //update the score
                    $('#score'+u).text(r.n);
                }
                else {
                    //display error message
                    growl.error("<strong>" + r.m + "</strong>");
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log("ERROR: " + textStatus, errorThrown);
            }
        });
    };

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

    $scope.spr = function() {

        $.ajax({
            method: "POST",
            url: "api/post/prep/" + id,
            data: { 'm': $scope.prep },
            success: function(r) {
                console.log(r);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log("ERROR: " + textStatus, errorThrown);
                console.log("ERROR: " + jqXHR.responseText);

                growl.error(jqXHR.responseText, { referenceId: 1 });
            }
        });

    };

};

app.controller("mainController", ["$scope", "growl", mainController]);
