/*global angular*/
/*global $*/
/*global CryptoJS*/
var keySize = 256;
var iterations = 100;
var app = angular.module('post', ['angular-growl']);
var encryption = false;

$(function() {
    // Changing page URL when category dropdown is changed
    $('#categories_drop').on('change', function() {
        var url = $(this).val(); // get selected value
        if (url) { // require a URL
            window.location = "newpost?id=" + url; // redirect
        }
        return false;
    });

    //Clicking first next after the category choice
    $('#next_btn').on('click', function() {
        $('.step2').show();
        $('.step1').hide();
    });


    //Enabling Encryption
    $('#enena').on('click', function() {
        $('#enena').hide();
        $('#endis').show();
        $('#secret').show();
        $('#warn').show();
        encryption = true;
    });

    //Disabling encryption
    $('#endis').on('click', function() {
        $('#endis').hide();
        $('#enena').show();
        $('#secret').hide();
        $('#warn').hide();
        encryption = false;
    });
});

app.filter('reverse', function() {
    return function(items) {
        return items.slice().reverse();
    };
});

app.config(['growlProvider', function(growlProvider) {
    growlProvider.globalPosition('bottom-center');
}]);

var mainController = function($scope, $http, growl) {
    $scope.message = '';
    $scope.tempMessage = '';
    $scope.parents = [];
    $scope.currentCat = {};
    $scope.checkword = "";

    var url_string = window.location.href;
    var url = new URL(url_string);
    var id = url.searchParams.get("id");

    //display error
    $scope.error = function(text) {
        growl.error(text, { referenceId: 1 });
    };

    //get to the next step of post creation
    $scope.next2 = function() {
        if ($scope.subject == null || $scope.subject == "") {
            growl.error("Seems like the subject of the post is missing, you have to provide one..", { referenceId: 1 });
        }
        else if ($scope.text == null || $scope.text == "") {
            growl.error("Seems like the text of the post is missing, you have to write something.", { referenceId: 1 });
        }
        else {
            $('.step2').hide();
            $('.step3').show();
            $('#next_btn2').hide();
        }
    };

    //Changing privacy levels
    $scope.update = function() {
        if ($scope.privacy == "pub") {
            //$( ".growl" ).empty();
            growl.info("Public post will be available for anyone to read and to registered users to replay to it.", { referenceId: 1 });
            $('#next_btn2').hide();
            $('#send_btn2').show();
        }
        else if ($scope.privacy == "cgp") {
            //$( ".growl" ).empty();
            growl.info("Closed group - public post will be visible for users when searching but users will not be able to access it unless they are allowed by an author.", { referenceId: 1 });
            $('#next_btn2').show();
            $('#send_btn2').hide();
        }
        else if ($scope.privacy == "cgh") {
            //$( ".growl" ).empty();
            growl.info("Closed group - hidden post will not apper on search results, therefore only allowed users will know about its existence, and will be able to access it.", { referenceId: 1 });
            $('#next_btn2').show();
            $('#send_btn2').hide();
        }
    };

    //encryption
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

    //on successfull aquire list of parents categories
    var onParentsComplete = function(r) {
        $scope.parents = r.data;
    };
    
    //on succesfull send
    var onSendCompleeted = function(r) {
        alert("Your post has been added successfully.");
        window.location = "post?id=" + r.data.id;
    };

    //on failure
    var redirect = function() {
        window.location = "/newpost?id=5a650c8bb62a0c8536f056c7";
    };
    
    //onError
    var onError = function(r) {
        console.log(r);
    };

    //load data
    if (id) {
        $http.get("api/category/getParents/" + id)
            .then(onParentsComplete, redirect)
            .catch(angular.noop);
    }
    else {
        window.location = "/newpost?id=5a650c8bb62a0c8536f056c7";
    }
 
    $scope.send = function sent() {
        if (($scope.secret == null || $scope.secret == "") && encryption) {
            growl.error("Please provide the secret phrase or disable an encryption.", { referenceId: 2 });
        }
        else {
            if (encryption) {
                $scope.text = $scope.encrypted;
            }
            //prepare data to be sent
            var data = {
                    text: $scope.text,
                    subject: $scope.subject,
                    category: id,
                    privacy: $scope.privacy,
                    encryption: encryption,
                    checkword: $scope.checkword
                };
            //execute sent action
            $http.post('api/post', data)
            .then(onSendCompleeted,onError).catch(angular.noop);
        }
    };
};
app.controller("mainController", ["$scope", "$http", "growl", mainController]);