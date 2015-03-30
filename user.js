var https = require('https');
var h = require('./helper-functions');
var drone = require('./drone');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var User = function(){
    
    var self = this;
    var username = h.generateUsername();
    var email = h.generateEmail();
    var password = h.generatePassword();
    var host  = process.env.CANOPY_HOST;
    var sslPort = 443;
    var auth = h.generateAuthString( username, password );
    var createUserPath = '/api/create_user';
    var createDevicePath = '/api/create_devices';
    var loginPath = '/api/login';
    var selfPath = '/api/user/self';

    self.register = function( callback ){
        var fireCallback = function(){
            if( callback ){
                callback();
            }          
        }        
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
          res.setEncoding('utf-8');

          var responseString = '';

          res.on('data', function(data) {
            responseString += data;
          });

          res.on('end', function() {
            var resultObject = JSON.parse(responseString);
            fireCallback();
          });        
        });

        req.on('error', function(e) {
          console.log(e);
        });
        req.write( userString );
        req.end();
    }

    self.delete = function( callback ){
        var fireCallback = function(){
            if( callback ){
                callback();
            }          
        }       
        var skipEmail = {
          'skip-email': true
        };

        var skipEmailString = JSON.stringify( skipEmail );

        var headers = {
          'Content-Type': 'application/json',
          'Authorization' : auth,
          'Content-Length': skipEmailString.length
        };

        var options = {
          host: host,
          port: sslPort,
          path: selfPath,
          method: 'DELETE',
          headers: headers
        };

        var req = https.request(options, function(res) {
          res.setEncoding('utf-8');

          var responseString = '';

          res.on('data', function(data) {
            responseString += data;
          });

          res.on('end', function() {
            var resultObject = JSON.parse(responseString);
            fireCallback();
          });
        });

        req.on('error', function(e) {
          console.log(e);
        });
        req.write( skipEmailString );
        req.end();
    }

    self.createDrone = function( params, callback ){
        drone.createDrone( params );
    }

    self.createDevice = function( device, callback ){
        var fireCallback = function(){
            if( callback ){
                callback();
            }          
        } 
        var thisDevice = {
          'quantity': 1,
          'friendly_names' : h.generateDeviceFriendlyNames(1)
        };

        var deviceString = JSON.stringify( thisDevice );

        var headers = {
          'Content-Type' : 'application/json',
          'Authorization' : auth
        };

        var options = {
          host: host,
          port: sslPort,
          path: createDevicePath,
          method: 'POST',
          headers: headers
        };

        var req = https.request(options, function(res) {
          res.setEncoding('utf-8');

          var responseString = '';

          res.on('data', function(data) {
              responseString += data;
          });

          res.on('end', function() {
              var resultObject = JSON.parse( responseString );
              console.log( resultObject );
              var UUID = resultObject.devices[0].device_id;
              var secretKey = resultObject.devices[0].device_secret_key;
              console.log( 'UUID '+ UUID);
              console.log( 'secretKey ' + secretKey);

              self.createDrone({
                  port: sslPort,
                  server: host,
                  reportPeriod: 1,
                  cloudVarDecls: ['out float32 temperature', 'out float32 humidity', 'out bool daytime'],
                  friendlyName: h.generateDeviceFriendlyNames(1),
                  UUID: UUID,
                  secretKey: secretKey,
                  headers: {
                    'Content-Type' : 'application/json',
                    'Authorization' : h.generateAuthString( UUID, secretKey )
                  }
              });

              fireCallback();
          });
        });

        req.on('error', function(e) {
          console.log(e);
        });
        req.write( deviceString );
        req.end();
    }
}

module.exports = User;