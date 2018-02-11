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
    $scope.showing = {};
    $scope.checkword = "";

    var url_string = window.location.href;
    var url = new URL(url_string);
    var id = url.searchParams.get("id");

    $scope.error = function(text) {
        growl.error(text, { referenceId: 1 });
    };

    $scope.show = function(id) {
        $('#t_' + id).removeClass("ng-hide");
        $('#e_' + id).addClass("ng-hide");
    };

    $scope.show_r = function(id) {
        $('#re_' + id).show();
        $('#relink_' + id).hide();
    };

    $scope.hide_r = function(id) {
        $('#re_' + id).hide();
        $('#relist_' + id).show();
    };
    
    $scope.show_rellist = function(id) {
        console.log("ok")
        $('.relistlink_' + id).hide();
        $('.relist_' + id).show();
    };
    
    $scope.hide_rellist = function(id) {
        console.log("ok")
        $('.relistlink_' + id).show();
        $('.relist_' + id).hide();
    };

    $scope.load = function() {
        $.ajax({
            method: "GET",
            dataType: 'json',
            url: "api/post/" + id,
            success: function(r) {
                    $scope.post = r;
                    $scope.$apply();
                    console.log(r);
                
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log("ERROR: " + textStatus, errorThrown);
                window.location = "/404";
            }
        });
    };

    $(document).ready(function() {
        $scope.load();
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
        console.log("downvoting" + id);
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
                    $('#score' + u).text(r.n);
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
                    $('#score' + u).text(r.n);
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
        console.log("replying...");
        $.ajax({
            method: "POST",
            url: "api/post/prep/" + id,
            data: { 'm': $scope.prep }
        }).done(function(r) {
            console.log("responce: ok" + r);
            $("#res").val('');
            console.log("reloading");
            $scope.load();
            console.log("reloaded");
        }).fail(function(jqXHR, textStatus) {
            console.log("Request failed: " + textStatus);
        });

    };

    $scope.srr = function(id) {
        console.log("replying..." + $("#rrep_" + id).val());
        $.ajax({
            method: "POST",
            url: "api/post/rrep/" + id,
            data: { 'm': $("#rrep_" + id).val() }
        }).done(function(r) {
            console.log("responce: ok" + r);
            $("#rrep_" + id).val('');
            console.log("reloading");
            $scope.load();
            console.log("reloaded");
        }).fail(function(jqXHR, textStatus) {
            console.log("Request failed: " + textStatus);
        });

    };


};

app.controller("mainController", ["$scope", "growl", mainController]);
