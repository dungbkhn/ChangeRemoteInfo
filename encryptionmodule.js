
// Includes crypto module 
const crypto = require('crypto'); 
  
// Difining algorithm 
const algorithm = 'aes-256-cbc'; 
  
// Defining key 
const key = Buffer.from([0x9a, 0x09, 0xf6, 0xf8, 0xbb, 0xc6, 0x7f, 0x15, 0x00, 0xc4, 0xf7, 0x44, 0xdd, 0x18, 0x3b, 0xf1, 0x2c, 0x36, 0xc1, 0x08, 0x1e, 0x61, 0x8a, 0x8e, 0x15, 0xb2, 0x08, 0x25, 0x47, 0x7b, 0x8a, 0x13]);//crypto.randomBytes(32); 

// Defining iv 
const iv = Buffer.from([0x7b, 0xcb, 0x2a, 0xbc, 0xfc, 0x19, 0xb4, 0x0e, 0x22, 0x10, 0x15, 0x38, 0xef, 0x09, 0x4b, 0x09]);//crypto.randomBytes(16); 

// An encrypt function 
exports.encrypt = function(text) { 
  
 // Creating Cipheriv with its parameter 
 let cipher =  
    crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv); 
  
 // Updating text 
 let encrypted = cipher.update(text); 
  
 // Using concatenation 
 encrypted = Buffer.concat([encrypted, cipher.final()]); 

 // Returning iv and encrypted data 
 return { iv: iv.toString('hex'), 
     encryptedData: encrypted.toString('hex') }; 
} 
  

// A decrypt function 
exports.decrypt = function(text) { 
  
 let iv = Buffer.from(text.iv, 'hex'); 
 let encryptedText = 
    Buffer.from(text.encryptedData, 'hex'); 
  
 // Creating Decipher 
 let decipher = crypto.createDecipheriv( 
        'aes-256-cbc', Buffer.from(key), iv); 
  
 // Updating encrypted text 
 let decrypted = decipher.update(encryptedText); 
 decrypted = Buffer.concat([decrypted, decipher.final()]); 
  
 // returns data after decryption 
 return decrypted.toString(); 
} 

// A decrypt function 
exports.decryptfromtext = function(encryptedData) { 
  
 let encryptedText = 
    Buffer.from(encryptedData, 'hex'); 
  
 // Creating Decipher 
 let decipher = crypto.createDecipheriv( 
        'aes-256-cbc', Buffer.from(key), iv); 
  
 // Updating encrypted text 
 let decrypted = decipher.update(encryptedText); 
 decrypted = Buffer.concat([decrypted, decipher.final()]); 
  
 // returns data after decryption 
 return decrypted.toString(); 
} 
