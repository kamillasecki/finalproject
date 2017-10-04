(function() {
    /*global angular*/
    /*global CryptoJS*/
    var app = angular.module("postEncrypt", []);
    
    var MainController = function($scope) {
        $scope.encrypt =  function(input){
            var salt = "cybersecurityapp";
            var key256Bits500Iterations = CryptoJS.PBKDF2("Secret Passphrase", salt, { keySize: 256 / 32, iterations: 500 });
            var iv = CryptoJS.enc.Hex.parse('101112131415161718191a1b1c1d1e1f');
            var encrypted = CryptoJS.AES.encrypt(input, key256Bits500Iterations, { iv: iv });
            var data_base64 = encrypted.ciphertext.toString(CryptoJS.enc.Base64);
            var iv_base64 = encrypted.iv.toString(CryptoJS.enc.Base64);
            var key_base64 = encrypted.key.toString(CryptoJS.enc.Base64);
            $scope.message = input;
            $scope.salt = salt;
            $scope.key = key_base64;
            $scope.encrypted = data_base64;
        }
        
        $scope.input = "Message";
    }
    
    app.controller("MainController", ["$scope","$http", MainController]);
}());
