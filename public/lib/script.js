(function() {
    /*global angular*/
    /*global CryptoJS*/
    var app = angular.module("postEncrypt", []);
    var keySize = 256;
    var ivSize = 128;
    var iterations = 100;

    var MainController = function($scope) {
        $scope.encrypt = function(input, password) {

            var salt = CryptoJS.lib.WordArray.random(128 / 8);
            console.log("SALT:", salt.toString());
            var key = CryptoJS.PBKDF2(password, salt, {
                keySize: keySize / 32,
                iterations: iterations
            });
            console.log("KEY:", key.toString());
            var iv = CryptoJS.lib.WordArray.random(128 / 8);
            console.log("IV:", iv.toString());
            var encrypted = CryptoJS.AES.encrypt(input, key, {
                iv: iv,
                padding: CryptoJS.pad.Pkcs7,
                mode: CryptoJS.mode.CBC
            });
            console.log("ENCRYPTED:", encrypted.toString());
            var transitmessage = salt.toString() + iv.toString() + encrypted.toString();

            $scope.message = input;
            $scope.encrypted = transitmessage;
        }


        $scope.decrypt = function(message, pass) {
            if (pass != null) {
                var salt = CryptoJS.enc.Hex.parse(message.substr(0, 32));
                var iv = CryptoJS.enc.Hex.parse(message.substr(32, 32))
                var encrypted = message.substring(64);

                var key = CryptoJS.PBKDF2(pass, salt, {
                    keySize: keySize / 32,
                    iterations: iterations
                });

                var decrypted = CryptoJS.AES.decrypt(encrypted, key, {
                    iv: iv,
                    padding: CryptoJS.pad.Pkcs7,
                    mode: CryptoJS.mode.CBC
                })
                try {
                    $scope.decrypted = decrypted.toString(CryptoJS.enc.Utf8);
                }
                catch (ex) {
                    if (decrypted.toString() != "") {
                        $scope.decrypted = decrypted.toString();
                    }
                    else {
                        $scope.decrypted = message;
                    }
                }
            }
        }
    }

    app.controller("MainController", ["$scope", "$http", MainController]);
}());
