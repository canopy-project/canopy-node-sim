'use strict'
var Drone = require('./drone');
/*
 * Manages a number of sim drones
 * Spins up sim drones 
 * Methods: Init Drone, Destroy Drone, Configure update times, set variable 
 */
var SimEngine = function( params ){
    var interval = null;
    var drones = [];
    var config = {
      engineName: params.engineName,      
      port: params.port,
      server: params.server,
      numDrones: params.numDrones,
      delay: params.delay,
      droneReportPeriod: params.droneReportPeriod
    }

    this.start = function(){
        // Every delay second, spin up a drone until numDrones is reached
        var dronesCreated = 0;
        interval = setInterval(function() {
            if( dronesCreated > params.numDrones ){
                clearInterval( interval );
            } else {
                var currentDrone = Drone.createDrone({
                    port: config.port,
                    server: config.server,
                    reportPeriod: config.droneReportPeriod,
                    cloudVarDecls: ['out float32 temperature', 'out float32 humidity', 'out bool daytime'],
                    name: config.engineName + dronesCreated
                });
                currentDrone.start();
                dronesCreated +=1;
                drones.push( currentDrone.name );

            };
        }, config.delay*1000);
    }
    this.stop = function(){
        // stop all drones 
        clearInterval( interval );
        for(var i=0;i<drones.length;i++){
            drones[i].stop();
        }

    }
    this.shutdown = function(){
        // stop, clean-up, destroy drones
        this.stop();
        for(var i=0;i<drones.length;i++){
            drones[i].delete();
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