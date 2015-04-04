'use strict'
var Drone = require('./drone');
var User = require('./user');
var q = require('q');
var h = require('./helper-functions');

/*
 * Manages a number of sim drones
 * Creates a User
 * Spins up sim drones using that User's account 
 * Methods: Init Drone, Destroy Drone, Configure update times, set variable 
 */

var SimEngine = function( params ){
    var self = this;
    self.user = new User( params );
    self.user.register();
    console.log('\n\n\nuser:\n\n ');
    console.dir(self.user);

    var interval = null;
    var drones = [];
    self.dronesCreated = 0;    
    var config = {
        engineName: params.engineName,      
        port: params.port,
        host: params.host,
        protocol: params.protocol,
        numDrones: params.numDrones,
        delay: params.delay,
        droneReportPeriod: params.droneReportPeriod 
    }
    var protocol = config.protocol;

    /*
     *  Latency in seconds keyed on number of 
     *  alive drones. 
     */

    self.responseAvgLatency = [];
    self.responseMinLatency = [];
    self.responseMaxLatency = [];
    self.responseAvgLatencyCount = [];
    self.avgReportPeriod = [];
    self.avgReportPeriodCount = [];



    self.actualReportPeriod = {};
    self.addProfileData = function( reportPeriod, latency ){
        if ( self.responseMinLatency[ self.dronesCreated ] === undefined ){
            self.responseMinLatency[ self.dronesCreated ] = latency;
        } else {
            self.responseMinLatency[ self.dronesCreated ] = Math.min( latency, self.responseMinLatency[ self.dronesCreated ] );
        }
        if ( self.responseMaxLatency[ self.dronesCreated ] === undefined ){
            self.responseMaxLatency[ self.dronesCreated ] = latency;
        } else {
            self.responseMaxLatency[ self.dronesCreated ] = Math.max( latency, self.responseMaxLatency[ self.dronesCreated ] );
        }
        if( self.responseAvgLatency[self.dronesCreated] === undefined ){
            self.responseAvgLatency[self.dronesCreated] = latency;
            self.responseAvgLatencyCount[self.dronesCreated] = 1;
        } else {
            var oldProduct = self.responseAvgLatencyCount[self.dronesCreated] * self.responseAvgLatency[self.dronesCreated];
            var newProduct = oldProduct + latency;
            self.responseAvgLatencyCount[self.dronesCreated] += 1;
            var newAvgLatency = newProduct/self.responseAvgLatencyCount[self.dronesCreated];
            self.responseAvgLatency[self.dronesCreated] = newAvgLatency;
        }
        if( reportPeriod > 0){    
            if( self.avgReportPeriod[self.dronesCreated] === undefined ){
                self.avgReportPeriod[self.dronesCreated] = reportPeriod;
                self.avgReportPeriodCount[self.dronesCreated] = 1;
            } else {
                var oldProduct = self.avgReportPeriodCount[self.dronesCreated] * self.avgReportPeriod[self.dronesCreated];
                var newProduct = oldProduct + reportPeriod;
                self.avgReportPeriodCount[self.dronesCreated] += 1;
                var newAvg = newProduct/self.avgReportPeriodCount[self.dronesCreated];
                self.avgReportPeriod[self.dronesCreated] = newAvg;
            }
        }
    };

    self.dumpReport = function(){
        for(var i=0;i<self.dronesCreated;i++){
            console.log( i +', ' + h.round3Decimals( self.responseMinLatency[i] )
                 + ', ' + h.round3Decimals( self.responseMaxLatency[i] )
                 + ', ' + h.round3Decimals( self.responseAvgLatency[i] )
                 + ', ' + h.round3Decimals( self.avgReportPeriod[i] ) 
            );
        }
    }

    self.spinUpDrone = function( data ){
        var deferred = q.defer();
        deferred.resolve( 
            Drone.createDrone({
                port: config.port,
                host: config.host,
                reportPeriod: config.droneReportPeriod,
                cloudVarDecls: {
                    "var_decls" : {
                        "out float32 temperature": {},
                        "out float32 humidity": {},
                        "out float32 dimmer_brightness": {}  
                    }
                },
                friendlyName: data.friendlyName,
                headers: data.headers,
                UUID: data.UUID,
                engine: self,
                protocol: config.protocol
            })
        )
        return deferred.promise;
    }

    self.getCreds = function( friendlyName ){
        var deferred = q.defer();
        deferred.resolve(self.user.createDevice({ friendlyName : friendlyName }));
        return deferred.promise;
    }
    self.logData = function( data ){
        var deferred = q.defer();
        console.log('\n***\nEngine has received drone init data: \n***\n');
       // console.log( data );
        deferred.resolve( data );
        return deferred.promise;
    }
    self.startDrone = function( drone ){
        drone.start();
        drones.push( drone );
    }
    self.start = function(){
        // Every delay second, spin up a drone until numDrones is reached
        // First, create a device with the User and return the credentials
        // needed to spin up a drone.
        // Then, spin up a drone and start it


        interval = setInterval(function() {
            if( self.dronesCreated >= config.numDrones   ){
                clearInterval( interval );
            } else {
                self.getCreds( config.engineName + (self.dronesCreated +1 ))
                    .then( self.logData )
                    .then( self.spinUpDrone )
                    .then( self.startDrone )               
                    .done() 
                self.dronesCreated +=1;
            }
        }, config.delay*1000);
    }

    self.stop = function(){
        // stop all drones 
        clearInterval( interval );
        for(var i=0;i<drones.length;i++){
            drones[i].stop();
        }

    }

    self.shutdown = function(){
        // stop, clean-up, destroy drones
        self.stop();
        self.user.delete();
        self.dumpReport();
        for(var i=0;i<drones.length;i++){
            drones[i].destroy();
        }
    }
}

/*
 * Creates a simulation engine Params has these fields:  createSimEngine params: port, server, numDrones, delay. Optional params: username, password
        port - Port of Canopy server,
        server - host name of server,
        numDrones - number of drones to spin up,
        delay - number of seconds to wait between drone spin ups,
        username - OPTIONAL username that will own the devices. If omitted, a new user will be created
        password - OPTIONAL password of user that will own the devices. Required if username is provided
*/

var createSimEngine = function( params ){
    return new SimEngine( params );
}

module.exports.createSimEngine = createSimEngine;