/*global angular*/
/*global $*/
/*global CryptoJS*/
var keySize = 256;
var iterations = 100;
var app = angular.module('post', ['angular-growl']);
var encryption = false;

app.config(['growlProvider', function(growlProvider) {
    growlProvider.globalPosition('top-center');
    growlProvider.globalTimeToLive(5000);
}]);

var mainController = function($scope, $http, $log, growl) {

    var url_string = window.location.href;
    var url = new URL(url_string);
    var id = url.searchParams.get("id");
    
    //if load is completed
    var onPostLoadCompleted = function(r) {
        $scope.post = r.data;
        if ($scope.post.settings.privacy == "pub") {
            $("#loader").delay(800).fadeOut(400, function() {
                $("#main").fadeIn(400);
            });
        }
        else if ($scope.post.settings.isAllowed) {
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
            if (!$scope.user) {
                $("#loader").delay(800).fadeOut(400, function() {
                    $("#access_noUser").fadeIn(400);
                });
            } else if ($scope.post.settings.isRequested) {
                $("#loader").delay(800).fadeOut(400, function() {
                    $("#access_wait").fadeIn(400);
                });
            }
            else {
                $("#loader").delay(800).fadeOut(400, function() {
                    $("#access").fadeIn(400);
                });
            }
        }
    };

    //if load post returns error
    var onLoadError = function() {
        window.location = "/404";
    };

    //load the data
    if (id) {
        $http.get('api/post/' + id)
            .then(onPostLoadCompleted, onLoadError)
            .catch(angular.noop);
    }
    else {
        window.location = "/404";
    }

    //reload the data
    $scope.reload = function() {
        var onPostReloadCompleted = function(r) {
            $scope.post = r.data;
            if ($scope.post.settings.encryption.isEnabled) {
                $scope.decr();
            }
        };

        $http.get('api/post/' + id)
            .then(onPostReloadCompleted, onLoadError)
            .catch(angular.noop);
    };

    //display error
    $scope.error = function(text) {
        growl.error("<strong>" + text + "</strong>");
    };
    
    //re-encrypt using the same parameters
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

    //decryption
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
    
    //post decryption
    $scope.decr = function() {
        var check = $scope.decrypt($scope.post.settings.encryption.checkword, $scope.phrase);
        if (check == "decrypted") {
            $scope.post.body.text = $scope.decrypt($scope.post.body.text, $scope.phrase);
            if ($scope.post.body.updates.length > 0) {
                for (var k = 0; k < $scope.post.body.updates.length; k++) {
                    $scope.post.body.updates[k] = $scope.decrypt($scope.post.body.updates[k], $scope.phrase);
                }
            }
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
    
    //request access to the post
    $scope.areq = function() {
        var data = { 'm': $scope.request_t };
        
        var onComplete = function (r) {
            if (r.data.status == "ok") {
                    growl.info("<strong>" + r.message + "</strong>");
                    window.location = "/list?id=" + $scope.post.settings.category;
                }
                else {
                    growl.error("<strong>" + r.data.message + "</strong>");
                    window.location = "/list?id=" + $scope.post.settings.category;
                }
        };
        
        var onError = function (r) {
            growl.error("<strong>" + r.status + "</strong>");
        };
        
        $http.post('api/post/reqaccess/' + id, data)
        .then(onComplete, onError)
        .catch(angular.noop);
    };
    
    $(document).ready(function() {
        $scope.user = $("#user").val();
    });
    
    // ###########################
    // ######SHOW / DISPLAY#######
    // ###########################

    //unhide low score comment
    $scope.show = function(sid) {
        $('#t_' + sid).removeClass("ng-hide");
        $('#e_' + sid).addClass("ng-hide");
    };

    //unhide reply to comment form
    $scope.show_r = function(sid) {
        $('#re_' + sid).show();
        $('#relink_' + sid).hide();
    };

    //hide reply to comment form
    $scope.hide_r = function(hid) {
        $('#re_' + hid).hide();
        $('#relink_' + hid).show();
    };

    //unhide repliest to the comment
    $scope.show_rellist = function(rid) {
        $('.relistlink_' + rid).hide();
        $('.relist_' + rid).show();
    };

    //hide replies to the comment
    $scope.hide_rellist = function(id) {
        $('.relistlink_' + id).show();
        $('.relist_' + id).hide();
    };
    
    //unhide post edit form
    $scope.pedit_show = function() {
        if ($scope.post.replies.length > 0) {
            $("#postedit2").show();
        }
        else {
            $scope.temp = $scope.post.body.text;
            $("#posttext").hide();
            $("#postedit").show();
        }

    };

    //hide post edit form
    $scope.pedit_close = function() {
        $scope.post.body.text = $scope.temp;
        $("#posttext").show();
        $("#postedit").hide();
    };

    //hide post update form
    $scope.pedit2_close = function() {
        $scope.editt = null;
        $("#postedit2").hide();
    };
    
    //unhide comment reply form
    $scope.redit_show = function(rid) {
        $scope.temp = $("#trepedit_" + rid).val();
        $("#reptext_" + rid).hide();
        $("#repedit_" + rid).show();
    };

    // ###########################
    // ######## VOTING ###########
    // ###########################

    //upvoting the post
    $scope.uvp = function() {
        var onComplete = function(r) {
            if (r.data.n != null) {
                //update the score
                $('#score').text(r.data.n);
            }
            else {
                //display error message
                growl.error("<strong>" + r.data.m + "</strong>");
            }
        };

        var onError = function(r) {
            growl.error("<strong>" + r.status + "</strong>");
        };

        $http.get('api/post/upvote/' + id)
            .then(onComplete, onError)
            .catch(angular.noop);
    };

    //downvoting the post
    $scope.dvp = function() {
        var onComplete = function(r) {
            if (r.data.n != null) {
                //update the score
                $('#score').text(r.data.n);
            }
            else {
                //display error message
                growl.error("<strong>" + r.data.m + "</strong>");
            }
        };

        var onError = function(r) {
            growl.error("<strong>" + r.status + "</strong>");
        };

        $http.get('api/post/downvote/' + id)
            .then(onComplete, onError)
            .catch(angular.noop);
    };

    //upvoting comment
    $scope.uvr = function(commentId) {
        var onComplete = function(r) {
            if (r.data.n != null) {
                //update the score
                $('#score' + commentId).text(r.data.n);
            }
            else {
                //display error message
                growl.error("<strong>" + r.data.m + "</strong>");
            }
        };

        var onError = function(r) {
            growl.error("<strong>" + r.status + "</strong>");
        };

        $http.get('api/post/reply/upvote/' + commentId)
            .then(onComplete, onError)
            .catch(angular.noop);
    };

    //downvoting comment
    $scope.dvr = function(commentId) {
        var onComplete = function(r) {
            if (r.data.n != null) {
                //update the score
                $('#score' + commentId).text(r.data.n);
            }
            else {
                //display error message
                growl.error("<strong>" + r.data.m + "</strong>");
            }
        };

        var onError = function(r) {
            growl.error("<strong>" + r.status + "</strong>");
        };

        $http.get('api/post/reply/downvote/' + commentId)
            .then(onComplete, onError)
            .catch(angular.noop);
    };
    
    // ###########################
    // ########## POST ###########
    // ###########################
    
    //delete post
    $scope.pdel = function() {
        var onComplete = function(r) {
            if (r.data.status == 'error') {
                growl.error("<strong>" + r.data.m + "</strong>");
            }
            else if (r.data.status == 'ok') {
                alert(r.data.m);
                window.location = '/list';
            }
        };

        var onError = function(r) {
            console.log(r)
            growl.error("<strong>" + r.status + "</strong>");
        };

        $http.delete('api/post/' + id)
            .then(onComplete, onError)
            .catch(angular.noop);
    };
    
    //saving post edit
    $scope.pedit = function() {
        if ($scope.post.body.text.trim() != "") {
            var data = ($scope.post.settings.encryption.isEnabled ? { 'm': $scope.reen($scope.post.body.text) } : { 'm': $scope.post.body.text });

            var onComplete = function(r) {
                if (r.data.status == "error") {
                    growl.error("<strong>" + r.data.m + "</strong>");
                }
                else {
                    $scope.reload();
                    $scope.pedit_close();
                }
            };

            var onError = function(r) {
                growl.error("<strong>" + r.status + "</strong>");
            };

            $http.put('api/post/edit/' + id, data)
                .then(onComplete, onError)
                .catch(angular.noop);
        }
        else {
            $scope.error("Post message cannot be empty.");
        }
    };

    //adding an update to the post
    $scope.pupd = function() {
        if ($scope.editt.trim() != "") {
            var data = ($scope.post.settings.encryption.isEnabled ? { 'm': $scope.reen($scope.editt) } : { 'm': $scope.editt });

            var onComplete = function(r) {
                $scope.editt = null;
                if (r.data.status == "error") {
                    growl.error("<strong>" + r.data.m + "</strong>");
                }
                else {
                    $scope.reload();
                    $scope.pedit2_close();
                }
            };

            var onError = function(r) {
                growl.error("<strong>" + r.status + "</strong>");
            };

            $http.put('api/post/update/' + id, data)
                .then(onComplete, onError)
                .catch(angular.noop);
        }
        else {
            $scope.error("Post update message cannot be empty.");
        }
    };

    // ###########################
    // ######## COMMENT ##########
    // ###########################
    
    //send post responce
    $scope.spr = function() {
        console.log($scope)
        if ($scope.prep == undefined || $scope.prep.trim() == "") {
            $scope.error("Your responce cannot be empty.");
        }
        else {
            var data = ($scope.post.settings.encryption.isEnabled ? { 'm': $scope.reen($scope.prep) } : { 'm': $scope.prep });

            var onComplete = function(r) {
                $scope.prep = "";
                $scope.reload();
            };

            var onError = function(r) {
                growl.error("<strong>" + r.status + "</strong>");
            };

            $http.post('api/post/prep/' + id, data)
                .then(onComplete, onError)
                .catch(angular.noop);
        }
    };
    
    //delete comment
    $scope.rdel = function(rid) {
        var data = {}
        
        var onComplete = function(r) {
            if (r.status == 200) {
                alert(r.data);
                $scope.reload();
            }
            else {
                growl.error("<strong>" + r.status + "</strong>");
            }
        };

        var onError = function(r) {
            growl.error("<strong>" + r.status + "</strong>");
        };

        $http.delete('api/post/' + id + '/reply/' + rid)
            .then(onComplete, onError)
            .catch(angular.noop);
    };

    //edit comment
    $scope.rupd = function(rid) {
        if ($("#trepedit_" + rid).val().trim() != "") {
            var data = ($scope.post.settings.encryption.isEnabled ? { 'm': $scope.reen($("#trepedit_" + rid).val().trim()) } : { 'm': $("#trepedit_" + rid).val().trim() });

            var onComplete = function(r) {
                if (r.data.status == "error") {
                    growl.error("<strong>" + r.data.m + "</strong>");
                }
                else {
                    $scope.reload();
                }
            };

            var onError = function(r) {
                growl.error("<strong>" + r.status + "</strong>");
            };

            $http.put('api/post/reply/edit/' + rid, data)
                .then(onComplete, onError)
                .catch(angular.noop);
        }
        else {
            $scope.error("Reply message cannot be empty.");
        }
    };
    
    // ###########################
    // ########## REPLY ##########
    // ###########################
    
    //send reply to comment
    $scope.srr = function(rid) {
        var rep = $("#rrep_" + rid).val();

        if (rep == undefined || rep.trim() == "") {
            $scope.error("Your responce cannot be empty.");
        }
        else {
            var data = ($scope.post.settings.encryption.isEnabled ? { 'm': $scope.reen(rep) } : { 'm': rep });

            var onComplete = function(r) {
                $("#rrep_" + rid).val('');
                $scope.reload();
            };

            var onError = function(r) {
                growl.error("<strong>" + r.status + "</strong>");
            };

            $http.post('api/post/rrep/' + rid, data)
                .then(onComplete, onError)
                .catch(angular.noop);
        }
    };

    //delete comment reply
    $scope.rrdel = function(rid, pid) {
        var onComplete = function (r) {
            if (r.status == 200) {
                alert(r.data);
                $scope.reload();
            }
            else {
                growl.error("<strong>" + r.status + "</strong>");
            }
        };
        
        var onError = function (r) {
            growl.error("<strong>" + r.status + "</strong>");
        };
        
        $http.delete('api/post/rreply/' + rid + "/" + pid)
        .then(onComplete,onError)
        .catch(angular.noop);
    };

};

app.controller("mainController", ["$scope", "$http", "$log", "growl", mainController]);
