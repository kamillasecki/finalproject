$( document ).ready(function() {
    /*global CryptoJS*/
    /*global $*/

    console.log( "ready!" );
        var salt = CryptoJS.lib.WordArray.random(128/8); 
        var key256Bits500Iterations = CryptoJS.PBKDF2("Secret Passphrase", salt, { keySize: 256/32, iterations: 500 });
        var iv  = CryptoJS.enc.Hex.parse('101112131415161718191a1b1c1d1e1f');
    
        var encrypted = CryptoJS.AES.encrypt("Message", key256Bits500Iterations, { iv: iv });  
        var data_base64 = encrypted.ciphertext.toString(CryptoJS.enc.Base64); 
        var iv_base64   = encrypted.iv.toString(CryptoJS.enc.Base64);       
        var key_base64  = encrypted.key.toString(CryptoJS.enc.Base64);
        
    $( "p" ).click(function() {
      var htmlString = $( this ).html();
      $( this ).text( "salt:" + salt + " , key256: " + key256Bits500Iterations + " IV: " + iv + "<br/> encrypted message: " + data_base64);
    });
});