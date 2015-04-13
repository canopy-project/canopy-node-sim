'use strict'

var h = require('./helper-functions');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
/*  
 *  Initializes cloud variables, then sets it
 *  to post updates to the variables 1/min.
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
    self.batchLoaded = 0;
    var interval = null;


    console.log('Drone '+ self.friendlyName +' initialized');
    self.start = function(){
       // console.log( config.friendlyName + ' is Go' );
        var payload = self.cloudVarDecls;

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
                var resultObject = JSON.parse( responseString );
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
       var lastUpdateTime;
       var actualInterval;

        interval = setInterval( function(){
                var startTime;    
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
                    lastUpdateTime = h.getHighResClock();

                    // If the batch has fully spun up, start posting data
                    // and adding profile data to the engine
                    //console.log('self.batchLoaded ' + self.batchLoaded);
                    if( self.batchLoaded === 1 ){
                        // console.log('self.reportPeriod: ' + self.reportPeriod );
                        self.engine.addProfileData( self.reportPeriod, latency );
                    }
                    
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
            });
        });

        req.on('error', function(e) {
            console.log(e);
        });
        req.end();
        //console.log( config.friendlyName + ' is No More' );
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