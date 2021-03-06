var h = require('./helper-functions');
var drone = require('./drone');
var q = require('q');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var User = function( params ){
    
    var self = this;
    var username = h.generateUsername();
    var email = h.generateEmail();
    var password = h.generatePassword();
    var host  = params.host;
    var port = params.port;
    var protocol = params.protocol;
    self.auth = h.generateAuthString( username, password );
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
          port: port,
          path: createUserPath,
          method: 'POST',
          headers: headers
        };

        var req = protocol.request(options, function(res) {
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
        console.log( 'deleting user' );
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
          'Authorization' : self.auth,
          'Content-Length': skipEmailString.length
        };

        var options = {
          host: host,
          port: port,
          path: selfPath,
          method: 'DELETE',
          headers: headers
        };

        var req = protocol.request(options, function(res) {
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

    self.getMockCreds = function(){
        return { 
            UUID: '123705h1hf042',
            Authorization: 'r2j790sdf689g0sd6'
        }
    }
    
    self.createDevice = function( device, callback ){

	      var deferred = q.defer();
        var returnObj = { };
        var fireCallback = function(){
            if( callback ){
                callback();
            }          
        } 

        var thisDevice = {
          'quantity': 1,
          'friendly_names' : [device.friendlyName]
        };

        var deviceString = JSON.stringify( thisDevice );

        var headers = {
          'Content-Type' : 'application/json',
          'Authorization' : self.auth
        };

        var options = {
          host: host,
          port: port,
          path: createDevicePath,
          method: 'POST',
          headers: headers
        };

        var req = protocol.request(options, function(res) {
          res.setEncoding('utf-8');

          var responseString = '';

          res.on('data', function(data) {
              responseString += data;
          });

          res.on('end', function() {
              var resultObject = JSON.parse( responseString );
              if (resultObject.devices == undefined) {
                  console.log(responseString);
              }
              var UUID = resultObject.devices[0].device_id;
              var secretKey = resultObject.devices[0].device_secret_key;
              var auth = h.generateAuthString( UUID, secretKey );
              returnObj.headers = {
                    'Content-Type' : 'application/json',
                    'Authorization' : auth
                  }
	            returnObj.UUID = UUID;
              returnObj.friendlyName = device.friendlyName;
              deferred.resolve( returnObj );        
          });
    });

        req.on('error', function(e) {
          console.log(e);
        });
        req.write( deviceString );
        req.end();
	   return deferred.promise;
    }
}

module.exports = User;
