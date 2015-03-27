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

var Drone = function( params ){
    var config = {  
                    port: params.port,
                    server: params.server,
                    reportPeriod: params.reportPeriod,
                    cloudVarDecls: params.cloudVarDecls,
                    name: params.name
                  }
    this.start = function(){
        // initialize cloud variables

        // update cloud variables 1/reportPeriod
    }
    this.stop = function(){
        // stop updating cloud variables
    }
    this.destroy = function(){
        // destroy drone
    }
    this.getReport = function(){
        /* Return as Object:
                 name,
                 updates performed,
                 failures,
                 response times
        */

    }
}

module.exports = Drone;