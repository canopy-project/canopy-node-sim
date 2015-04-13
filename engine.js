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
    // console.log('\n\n\nuser:\n\n ');
    // console.dir(self.user);

    var interval = null;
    var batchInterval = null;
    var batchesCreated = 0;
    var drones = [];
    self.dronesCreated = 0;
    var batchDronesCreated = 0;
    var startTime = new Date().getTime();
    var config = {
        engineName: params.engineName,      
        port: params.port,
        host: params.host,
        protocol: params.protocol,
        numDrones: params.numDrones,
        numBatches: params.numBatches,
        spinUpDelay: params.spinUpDelay,
        batchDelay: params.batchDelay,
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
        var endTime = new Date().getTime();
        var duration = endTime - startTime;
        console.log(
            '\n\n***\n' 
            + '\n'
            + 'Performance Report: ' + config.engineName 
            + '\n\n'
            + 'Start Time: ' + startTime + '\n'
            + 'End Time: ' + endTime + '\n'
            + 'Duration: ' + duration + '\n' 
            + '\n'
            + 'volume'+'\t'+'min l'+'\t'+'max l'+'\t'+'avg l'+'\t'+'report period');
            
            // For every batch ...
        for(var i=1;i<=config.numBatches;i++){
            // Print out the data of that batch number multiplied
            // by the number of drones perbatch
            var j = i*config.numDrones;
            console.log(( j ) +'\t' + h.round3Decimals( self.responseMinLatency[j] )
                 + '\t' + h.round3Decimals( self.responseMaxLatency[j] )
                 + '\t' + h.round3Decimals( self.responseAvgLatency[j] )
                 + '\t' + h.round3Decimals( self.avgReportPeriod[j] ) 
            );
        }
        console.log('\n***\n\n'); 
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
        // console.log('\n***\nEngine has received drone init data: \n***\n');
        // console.log( data );
        deferred.resolve( data );
        return deferred.promise;
    }

    self.startDrone = function( drone ){
        drone.start();
        drones.push( drone );
    }

    self.start = function(){
        
        batchInterval = setInterval(function(){
            if( batchesCreated >= config.numBatches){
                clearInterval( batchInterval );
            } else {
                // increment the number of batches created
                batchesCreated +=1;

                // console.log('batchesCreated ' + batchesCreated);
                // console.log(' config.numBatches ' + config.numBatches);
                // Set the batchLoaded boolean on all drones to 
                // "0". This pauses their data collection until
                // the new batch has loaded
                console.log('Loading Batch');
                for( var i=0 ; i<drones.length ; i++ ){
                    drones[i].batchLoaded = 0;
                }                  
                var deferred = q.defer();

                // Every delay second, spin up a drone until numDrones is reached
                // First, create a device with the User and return the credentials
                // needed to spin up a drone.
                // Then, spin up a drone and start it
                
                var batchDronesCreated = 0;
                interval = setInterval(function() {
                    if( batchDronesCreated >= config.numDrones ){

                        clearInterval( interval );
                        // After each batch is loaded, set all drones batchLoaded
                        // boolean to true. This will tell them to report data.
                        console.log('Resuming Reporting');
                        for( var i=0 ; i<drones.length ; i++ ){
                            drones[i].batchLoaded = 1;
                        }                        
                    } else {
                        self.dronesCreated += 1;
                        batchDronesCreated += 1;
                        self.getCreds( config.engineName + (self.dronesCreated))
                            .then( self.logData )
                            .then( self.spinUpDrone )
                            .then( self.startDrone )               
                            .done() 
                    }
                }, config.spinUpDelay*1000);
            }
        },  config.batchDelay*1000);
    
    }

    self.shutdown = function(){
        // stop, clean-up, destroy drones
        self.stop( self.dumpReport );
    }
    
    self.stop = function( callback ){
        console.log('shutting down');
        var callbackTrigger = 0;
        // stop making new drones
        if( batchInterval ){
            clearInterval( batchInterval );
        }
        if( interval ){ 
            clearInterval( interval );
        }

        // tell each drone to stop reporting
        for(var i=0;i<drones.length;i++){
            drones[i].stop();
            drones[i].destroy();
            callbackTrigger +=1;
        }

        if( callbackTrigger >= drones.length ){
            self.user.delete();
            callback();
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