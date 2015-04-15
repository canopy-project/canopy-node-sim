'use strict'
var Drone = require('./drone');
var User = require('./user');
var q = require('q');
var h = require('./helper-functions');
var http = require('http');
var report = require('./report');

/*
 * Manages a number of sim drones
 * Creates a User
 * Spins up sim drones using that User's account 
 * Methods: Init Drone, Destroy Drone, Configure update times, set variable 
 */

var SimEngine = function( params ){
    var self = this;
    self.report = null;
    self.user = new User( params );
    // console.log('\n\n\nuser:\n\n ');
    // console.dir(self.user);

    var interval = null;
    var batchInterval = null;
    var batchesCreated = 0;
    var drones = [];
    self.dronesCreated = 0;
    var batchDronesCreated = 0;
    self.recordingPaused = false;
    self.shuttingDown = false;
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
        droneReportPeriod: params.droneReportPeriod ,
        overlordHost: params.overlordHost,
        reporterPath: params.reporterPath
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
        if( self.report ){
            self.report.addProfileData( reportPeriod, latency )
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
            + 'volume'+'\t'+'min l'+'\t'+'max l'+'\t'+'avg l'+'\t'+'report period' +'\t'+ 'sample count');
            
            // For every batch ...
        for(var i=0;i<=config.numDrones*config.numBatches;i++){
            // Print out the data of that batch number multiplied
            // by the number of drones perbatch
/*            var j = i*config.numDrones;*/
            if (self.responseAvgLatencyCount[i] !== undefined) {
                console.log(( i ) +'\t' + h.round3Decimals( self.responseMinLatency[i] )
                     + '\t' + h.round3Decimals( self.responseMaxLatency[i] )
                     + '\t' + h.round3Decimals( self.responseAvgLatency[i] )
                     + '\t' + h.round3Decimals( self.avgReportPeriod[i] ) 
                     + '\t\t' + h.round3Decimals( self.responseAvgLatencyCount[i] )
                );
            }
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
                protocol: config.protocol,
                overlordHost: config.overlordHost
            })
        )
        return deferred.promise;
    }

    self.reportDrone = function( count ){
        // report that a drone was created to the overlord
        var deferred = q.defer();
        console.log( 'reporting drone' )
        var payloadString = JSON.stringify({
            "cnt": count,
            "testname": params.testname
        });

        var options = {
            host: params.overlordHost,
            port: params.overlordPort,
            path: params.reporterPath,
            method: 'POST',
            headers: {
                "content-type": "application/json"
            }
        };
        console.dir( options );
        var req = http.request(options, function(res) {

            res.setEncoding('utf-8');

            var responseString = '';

            res.on('data', function(data) {
                responseString += data;                   
            });

            res.on('end', function() {
                var resultObject = JSON.parse( responseString );
                console.log('response: ');
                console.dir( resultObject );
                deferred.resolve();
            });
        });

        req.on('error', function(e) {
            console.log(e);
        });

        req.write( payloadString );

        req.end();
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
    
    self.pauseRecording = function( ){
        self.recordingPaused = true;
    }

    self.resumeRecording = function( ){
        self.recordingPaused = false;
    } 

    self.batchLoop = function(){
        if( self.shuttingDown === true ){
            return;
        }

        if( self.report ){
            self.report.send();
            self.report = null;
        }

        console.log('Loading Batch');
        
        self.spinUpBatch( function() {
            self.report = new report( params );
            console.log('Resuming Reporting');
            
            if( batchesCreated < config.numBatches ){
                setTimeout( self.batchLoop, config.batchDelay*1000 )
            }

        });
    }

    self.start = function(){
        self.user.register(function() {
            self.batchLoop();
        });
    }

    self.spinUpBatch = function( callback ){

        self.spinUpBatchLoop( 0, function(){
            batchesCreated +=1;
            callback();
        });

    }        

    self.spinUpBatchLoop = function( batchDronesCreated, callback){
        if( self.shuttingDown === true ){
            return;
        }
        self.getCreds( config.engineName + (self.dronesCreated) )
            .then( self.logData )
            .then( self.spinUpDrone )
            .then( self.startDrone )
            .then( function(){
                    self.reportDrone( 1 )
                } )
            .then( function(){
                var deferred = q.defer();
                self.dronesCreated += 1;
                batchDronesCreated +=1;
                if( batchDronesCreated < config.numDrones ){
                    setTimeout( function(){
                        self.spinUpBatchLoop( batchDronesCreated, callback );
                    }, config.spinUpDelay*1000 );
                } else {
                    deferred.resolve();
                    callback();                    
                }
                return deferred.promise;   
            })           
            .done();
    }

    self.shutdown = function(){
        // stop, clean-up, destroy drones
        self.stop( );
    }
    
    self.stop = function( callback ){
        console.log('shutting down');
        self.shuttingDown = true;
        var callbackTrigger = 0;
        // stop making new drones
/*        if( batchInterval ){
            clearInterval( batchInterval );
        }
        if( interval ){ 
            clearInterval( interval );
        }*/

        // tell each drone to stop reporting

        for(var i=0;i<drones.length;i++){
            drones[i].stop();
            drones[i].destroy();
            self.reportDrone( -1 );
            callbackTrigger +=1;
        }

        if( callbackTrigger >= drones.length ){
            self.user.delete();
            if( callback ){
                callback();
            }
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
