'use strict'

var h = require('./helper-functions');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
/*  
 *  Initializes cloud variables, then sets it
 *  to post updates to the the variables 1/min.
 */

// Drone Methods : initialize it with server, port, paths, variables

var Drone = function( params ){
/*    console.log('\n\nDrone initializing');*/
    var self = this;
    var config = {  
        port: params.port,
        host: params.host,
        reportPeriod: params.reportPeriod,
        cloudVarDecls: params.cloudVarDecls,
        friendlyName: params.friendlyName,
        UUID: params.UUID,
        secretKey: params.secretKey,
        auth: params.auth,
        headers: params.headers
    }
    self.port = config.port;
    self.host = config.host;
    self.reportPeriod = config.reportPeriod;
    self.cloudVarDecls = config.cloudVarDecls;
    self.friendlyName = config.friendlyName;
    self.UUID = config.UUID;
    self.secretKey = config.secretKey;
    self.auth = config.auth;
    self.headers = config.headers;

    self.start = function(){
        // initialize cloud variables
        console.log(config.friendlyName + ' is Go');

        // update cloud variables 1/reportPeriod
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