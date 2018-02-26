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
    $scope.phrase = "";
    $scope.salt = "";
    $scope.iv = "";
    $scope.temp = "";

    var url_string = window.location.href;
    var url = new URL(url_string);
    var id = url.searchParams.get("id");

    $scope.error = function(text) {
        growl.error("<strong>" + text + "</strong>");
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
        $('#relink_' + id).show();
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
                if($scope.post.settings.privacy == "pub"){
                    $("#loader").delay(800).fadeOut(400, function() {
                            $("#main").fadeIn(400);
                        });
                } else if ($scope.post.settings.isAllowed) {
                    if ($scope.post.settings.encryption.isEnabled) {
                        if ($scope.phrase == "") {
                            $("#loader").delay(800).fadeOut(400, function() {
                                $("#pass").fadeIn(400);
                                $("#phrase").focus();
                            });
                        }
                        else {
                            $scope.decr();
                            $scope.$apply();
                        }
                    }
                    else {
                        $("#loader").delay(800).fadeOut(400, function() {
                            $("#main").fadeIn(400);
                        });
                    }
                }
                else {
                    $("#loader").delay(800).fadeOut(400, function() {
                        $("#access").fadeIn(400);
                    });
                }

            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log("ERROR: " + textStatus, errorThrown);
                $("#loader").delay(800).fadeOut(400, function() {
                    $("#main").fadeIn(400);
                });
                window.location = "/404";
            }
        });
    };

    $(document).ready(function() {
        $scope.user = $("#user").val();
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

    $scope.reen = function(input) {
        var key = CryptoJS.PBKDF2($scope.phrase, $scope.salt, {
            keySize: keySize / 32,
            iterations: iterations
        });
        var encrypted = CryptoJS.AES.encrypt(input, key, {
            iv: $scope.iv,
            padding: CryptoJS.pad.Pkcs7,
            mode: CryptoJS.mode.CBC
        });
        return $scope.salt + $scope.iv + encrypted.toString();
    }

    $scope.decrypt = function(message, pass) {
        if (pass != null) {
            $scope.salt = CryptoJS.enc.Hex.parse(message.substr(0, 32));
            $scope.iv = CryptoJS.enc.Hex.parse(message.substr(32, 32))
            var encrypted = message.substring(64);

            var key = CryptoJS.PBKDF2(pass, $scope.salt, {
                keySize: keySize / 32,
                iterations: iterations
            });

            var decrypted = CryptoJS.AES.decrypt(encrypted, key, {
                iv: $scope.iv,
                padding: CryptoJS.pad.Pkcs7,
                mode: CryptoJS.mode.CBC
            })
            try {
                return decrypted.toString(CryptoJS.enc.Utf8);
            }
            catch (ex) {
                if (decrypted.toString() != "") {
                    return decrypted.toString();
                }
                else {
                    return message;
                }
            }
        }
    }

    $scope.spr = function() {
        console.log("$scope.prep:" + $scope.prep);
        if ($scope.prep == undefined || $scope.prep == "") {
            $scope.error("Your responce cannot be empty.");
        }
        else {
            var data;
            if ($scope.post.settings.encryption.isEnabled) {
                data = { 'm': $scope.reen($scope.prep) };
            }
            else {
                data = { 'm': $scope.prep };
            }
            $.ajax({
                method: "POST",
                url: "api/post/prep/" + id,
                data: data
            }).done(function(r) {
                console.log("responce: ok" + r);
                $("#res").val('');
                $scope.load();
            }).fail(function(jqXHR, textStatus) {
                console.log("Request failed: " + textStatus);
            });
        }
    };

    $scope.srr = function(id) {
        var rep = $("#rrep_" + id).val();

        if (rep == undefined || rep == "") {
            $scope.error("Your responce cannot be empty.");
        }
        else {
            var data;
            if ($scope.post.settings.encryption.isEnabled) {
                data = { 'm': $scope.reen(rep) };
            }
            else {
                data = { 'm': rep };
            }
            $.ajax({
                method: "POST",
                url: "api/post/rrep/" + id,
                data: data
            }).done(function(r) {
                console.log("responce: ok" + r);
                $("#rrep_" + id).val('');
                console.log("reloading");
                $scope.load();
                console.log("reloaded");
            }).fail(function(jqXHR, textStatus) {
                console.log("Request failed: " + textStatus);
            });
        }
    };

    $scope.pdel = function() {
        $.ajax({
            method: "DELETE",
            url: "api/post/del/" + id
        }).done(function(r) {
            console.log("responce: ok" + r);
            if (r.status == "error") {
                growl.error("<strong>" + r.m + "</strong>");
            }
            else if (r.status == "ok") {
                alert(r.m);
                window.location = '/';
            }
        }).fail(function(jqXHR, textStatus) {
            console.log("Request failed: " + textStatus);
        });
    }

    $scope.pedit_show = function() {
        if ($scope.post.replies.length > 0) {
            console.log("already commented, allow update only");
            $("#postedit2").show();
        }
        else {
            console.log("not yet commented, allow edit.");
            $scope.temp = $scope.post.body.text;
            $("#posttext").hide();
            $("#postedit").show();
        }

    };

    $scope.pedit_close = function() {
        $scope.post.body.text = $scope.temp;
        $("#posttext").show();
        $("#postedit").hide();
    };

    $scope.pedit2_close = function() {
        $("#postedit2").hide();
    };

    $scope.pupd = function() {
        console.log("Updating post to ..." + $scope.post.body.text);
        var data;
        if ($scope.post.body.text.trim() != "") {
            if ($scope.post.settings.encryption.isEnabled) {
                data = { 'm': $scope.reen($scope.post.body.text) };
            }
            else {
                data = { 'm': $scope.post.body.text };
            }
            $.ajax({
                method: "PUT",
                url: "api/post/update/" + id,
                data: data
            }).done(function(r) {
                console.log("responce: ok");
                console.log("reloading");
                if (r.status == "error") {
                    growl.error("<strong>" + r.m + "</strong>");
                }
                else {
                    $scope.load();
                    $scope.pedit_close();
                    console.log("reloaded");
                }
            }).fail(function(jqXHR, textStatus) {
                console.log("Request failed: " + textStatus);
            });
        }
        else {
            $scope.error("Post message cannot be empty.")
        }
    };

    $scope.pedit = function() {
        console.log("Updating post to ..." + $scope.editt);
        $.ajax({
            method: "PUT",
            url: "api/post/edit/" + id,
            data: { 'm': $scope.editt }
        }).done(function(r) {
            console.log("responce: ok" + r);
            if (r.status == "error") {
                growl.error("<strong>" + r.m + "</strong>");
            }
            else {
                console.log("reloading");
                $scope.load();
                $scope.pedit2_close();
                console.log("reloaded");
            }
        }).fail(function(jqXHR, textStatus) {
            console.log("Request failed: " + textStatus);
        });
    };

    $scope.decr = function() {
        var check = $scope.decrypt($scope.post.settings.encryption.checkword, $scope.phrase);
        if (check == "decrypted") {
            $scope.post.body.text = $scope.decrypt($scope.post.body.text, $scope.phrase);
            if ($scope.post.replies.length > 0) {
                for (var i = 0; i < $scope.post.replies.length; i++) {
                    $scope.post.replies[i].text = $scope.decrypt($scope.post.replies[i].text, $scope.phrase);
                    for (var j = 0; j < $scope.post.replies[i].rreplies.length; j++) {
                        $scope.post.replies[i].rreplies[j].text = $scope.decrypt($scope.post.replies[i].rreplies[j].text, $scope.phrase);
                    }
                }
            }
            $("#pass").delay(800).fadeOut(400, function() {
                $("#main").fadeIn(400);
            });
        }
        else {
            growl.error("<strong>Incorrect phrase</strong>");
            $scope.phrase = "";
        }

    };

    $scope.rdel = function(rid) {
        $.ajax({
            method: "DELETE",
            url: "api/post/reply/del/" + rid,
            data: { 'pid': id }
        }).done(function(r) {
            console.log("responce: ok" + r);
            if (r.status == "error") {
                growl.error("<strong>" + r.m + "</strong>");
            }
            else if (r.status == "ok") {
                alert(r.m);
                window.location = '/';
            }
        }).fail(function(jqXHR, textStatus) {
            console.log("Request failed: " + textStatus);
        });
    };

    $scope.redit_show = function(id) {
        $scope.temp = $("#trepedit_" + id).val();
        $("#reptext_" + id).hide();
        $("#repedit_" + id).show();
    };

    $scope.rupd = function(id) {
        var data;
        if ($("#trepedit_" + id).val().trim() != "") {
            if ($scope.post.settings.encryption.isEnabled) {
                data = { 'm': $scope.reen($("#trepedit_" + id).val().trim()) };
            }
            else {
                data = { 'm': $("#trepedit_" + id).val().trim() };
            }
            $.ajax({
                method: "PUT",
                url: "api/post/reply/edit/" + id,
                data: data
            }).done(function(r) {
                console.log("responce: ok");
                console.log("reloading");
                if (r.status == "error") {
                    growl.error("<strong>" + r.m + "</strong>");
                }
                else {
                    $scope.load();
                    console.log("reloaded");
                }
            }).fail(function(jqXHR, textStatus) {
                console.log("Request failed: " + textStatus);
            });
        }
        else {
            $scope.error("Reply message cannot be empty.")
        }
    };
};

app.controller("mainController", ["$scope", "growl", mainController]);
