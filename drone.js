'use strict'

var h = require('./helper-functions');
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
        UUID: params.UUID,
        engine: params.engine,
        protocol: params.protocol
    }
    self.port = config.port;
    self.host = config.host;
    var protocol = config.protocol;
    self.reportPeriod = config.reportPeriod;
    self.cloudVarDecls = config.cloudVarDecls;
    self.friendlyName = config.friendlyName;
    self.headers = config.headers;
    self.UUID = config.UUID;
    self.engine = config.engine;
    self.reportPeriod = config.reportPeriod;
    self.selfPath = '/api/device/' + self.UUID;
    var interval = null;


    console.log('\n***\nDrone '+ self.friendlyName +' initializing\n***\n');
    self.start = function(){
        console.log( 'protocol: ' + protocol);
        // console.log('selfPath: ' + self.selfPath );
        // initialize cloud variables
        console.log( config.friendlyName + ' is Go' );
        // update cloud variables 1/reportPeriod
        var payload = self.cloudVarDecls;
       // console.log( 'payload: ' + payload );

        var payloadString = JSON.stringify( payload );

        var options = {
            host: self.host,
            port: self.port,
            path: self.selfPath,
            method: 'POST',
            headers: self.headers
        };

        var req = protocol.request(options, function(res) {
            res.setEncoding('utf-8');

            var responseString = '';

            res.on('data', function(data) {
                responseString += data;
            });

            res.on('end', function() {
                var resultObject = JSON.parse(responseString);
               // console.log( responseString );
                self.update();
            });
        });

        req.on('error', function(e) {
            console.log(e);
        });
        req.write( payloadString );
        req.end();
    }

    self.update = function(){
       // console.log( config.friendlyName + ' is updating cloud variables' );
       var lastUpdateTime;
       var actualInterval;

        interval = setInterval( function(){
                var startTime;
               // console.log("startTime: " + startTime);        
                var payloadString = JSON.stringify({      
                    "vars" : {
                        "temperature" : h.generateInt(-25,140),
                        "humidity" : h.generateInt(0,100),
                        "dimmer_brightness" : h.generateInt(0,10)
                    }
                });

                var options = {
                    host: self.host,
                    port: self.port,
                    path: self.selfPath,
                    method: 'POST',
                    headers: self.headers
                };

                var req = protocol.request(options, function(res) {
                    var latency =  h.getHighResClock() - startTime;
                    if( lastUpdateTime !== undefined ){
                        self.reportPeriod = h.getHighResClock() - lastUpdateTime;
                    } else {
                        self.reportPeriod = -1;
                    }
                    console.log('self.reportPeriod: ' + self.reportPeriod );
                    lastUpdateTime = h.getHighResClock();
                    self.engine.addProfileData( self.reportPeriod, latency );
                    res.setEncoding('utf-8');

                    var responseString = '';

                    res.on('data', function(data) {
                        responseString += data;                   
                    });

                    res.on('end', function() {
                        var resultObject = JSON.parse(responseString);
                    });
                });

                req.on('error', function(e) {
                    console.log(e);
                });

                

                req.write( payloadString, function(){
                    startTime = h.getHighResClock();
            } );    
                req.end();                 
        }, self.reportPeriod*1000 );
    }

    self.stop = function(){
        // stop updating cloud variables
        console.log( config.friendlyName + ' is Stop' );
        clearInterval( interval );
    }
    self.destroy = function(){
        // destroy drone
        var options = {
            host: self.host,
            port: self.port,
            path: self.selfPath,
            method: 'DELETE',
            headers: self.headers
        };

        var req = protocol.request(options, function(res) {
            res.setEncoding('utf-8');

            var responseString = '';

            res.on('data', function(data) {
                responseString += data;
            });

            res.on('end', function() {
                var resultObject = JSON.parse(responseString);
               // console.log( responseString );
            });
        });

        req.on('error', function(e) {
            console.log(e);
        });
        req.end();
        console.log( config.friendlyName + ' is No More' );
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