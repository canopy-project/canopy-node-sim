'use strict'
var h = require('./helper-functions');
var https = require('https');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var username = h.generateUsername();
var email = h.generateEmail();
var password = h.generatePassword();
var host  = process.env.CANOPY_HOST;
var sslPort = 443;
var createUserPath = '/api/create_user';
var createDevicePath = '/api/create_devices';


console.log( 'host ' + host );
var user = {
    'username': username,
    'email': email,
    'password': password,
    'skip-email': true
};

var userString = JSON.stringify( user );

var headers = {
    'Content-Type': 'application/json',
    'Content-Length': userString.length
};

var options = {
    host: host,
    port: sslPort,
    path: createUserPath,
    method: 'POST',
    headers: headers
};

var req = https.request(options, function(res) {
    console.log( 'options' + options );
    res.setEncoding('utf-8');

    var responseString = '';

    res.on('data', function(data) {
        responseString += data;
    });

    res.on('end', function() {
        var resultObject = JSON.parse(responseString);
        console.log( 'resultObject' + resultObject );
    });
});


req.on('error', function(e) {
    console.log(e);
});


req.write( userString );
req.end();
  