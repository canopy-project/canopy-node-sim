'use strict'

var h = require('./helper-functions');
var https = require('https');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

/*  
 *  Initializes cloud variables, then sets it
 *  to post updates to the the variables 1/min.
 */

// Drone Methods : initialize it with server, port, paths, variables

var Drone = function( params ){
    var self = this;
    var config = {  
        port: params.port,
        host: params.host,
        reportPeriod: params.reportPeriod,
        cloudVarDecls: params.cloudVarDecls,
        friendlyName: params.friendlyName,
        headers: params.headers,
        UUID: params.UUID
    }
    self.port = config.port;
    self.host = config.host;
    self.reportPeriod = config.reportPeriod;
    self.cloudVarDecls = config.cloudVarDecls;
    self.friendlyName = config.friendlyName;
    self.headers = config.headers;
    self.UUID = config.UUID;
    self.selfPath = '/api/' + self.UUID;
    console.log('\n***\nDrone '+ self.friendlyName +' initializing\n***\n');
    self.start = function(){
        console.log('selfPath: ' + self.selfPath );
        // initialize cloud variables
        console.log( config.friendlyName + ' is Go' );
        // update cloud variables 1/reportPeriod
        var payload = self.cloudVarDecls;

        var payloadString = JSON.stringify( payload );

        var options = {
            host: self.host,
            port: self.port,
            path: self.selfPath,
            method: 'POST',
            headers: self.headers
        };

        var req = https.request(options, function(res) {
            res.setEncoding('utf-8');

            var responseString = '';

            res.on('data', function(data) {
                responseString += data;
            });

            res.on('end', function() {
                var resultObject = JSON.parse(responseString);
                console.log( responseString );
            });        
        });

        req.on('error', function(e) {
            console.log(e);
        });
        req.write( payloadString );
        req.end();        
    }

    self.stop = function(){
        // stop updating cloud variables
        console.log(config.friendlyName + ' is Stop');
    }

    self.destroy = function(){
        // destroy drone
        console.log(config.friendlyName + ' is No More');
    }

    self.getReport = function(){
        /* Return as Object:
                 name,
                 updates performed,
                 failures,
                 response times
        */

    }
}
    // returns new drone object
var createDrone = function( params ){
        return new Drone( params );
    }
    
module.exports.createDrone = createDrone;