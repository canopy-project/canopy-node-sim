'use strict'

var TestUser = require('./testUser');
var TestDevice = require('./testDevice');
var http = require('http');
var h = require('./helper-functions');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
/*  
 *  Drone registers a test user, creates a device,
 *  initializes its cloud variables, then sets it
 *  to post updates to the the variables 1/min.
 */

// Drone Methods : initialize it with server, port, paths, variables
var Drone = function(){
    var self = this;
    self.registerUser = function(){
        self.user = new testUser();
        self.user.register();
    }
    self.login = function(){
        post( self.user.baseUrl + self.user.loginPath)
    }
}

var postData = { "username" : that.username, "email" : that.email,  "password" : that.password, "skip-email" : true };

var options = {
  hostname: 'https://dev02.canopy.link',
  port: 80,
  path: '/api/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

var req = http.request(options, function(res) {
  console.log('STATUS: ' + res.statusCode);
  console.log('HEADERS: ' + JSON.stringify(res.headers));
  res.setEncoding('utf8');
  res.on('data', function (chunk) {
    console.log('BODY: ' + chunk);
  });
});

req.on('error', function(e) {
  console.log('problem with request: ' + e.message);
});

// write data to request body
req.write(postData);
req.end();