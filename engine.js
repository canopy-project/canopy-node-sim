'use strict'
var Drone = require('./drone');
var User = require('./user');
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
    var config = {
      engineName: params.engineName,      
      port: params.port,
      host: params.host,
      numDrones: params.numDrones,
      delay: params.delay,
      droneReportPeriod: params.droneReportPeriod
    }

    self.start = function(){
        // Every delay second, spin up a drone until numDrones is reached
        var dronesCreated = 0;
        interval = setInterval(function() {
            if( dronesCreated > config.numDrones ){
                clearInterval( interval );
            } else {
                var currentDrone = self.user.createDrone({
                    port: config.port,
                    host: config.host,
                    reportPeriod: config.droneReportPeriod,
                    cloudVarDecls: ['out float32 temperature', 'out float32 humidity', 'out bool daytime'],
                    friendlyName: config.engineName + dronesCreated
                });
                console.log('\n\ncurrentDrone: \n\n');
                console.dir( currentDrone );
                console.log('\n\n');
                //currentDrone.start();
                dronesCreated +=1;
                drones.push( currentDrone );

            };
        }, config.delay*1000);
    }

    self.stop = function(){
        // stop all drones 
        clearInterval( interval );
        for(var i=0;i<drones.length;i++){
            drones[i].stop();
        }

    }

    this.shutdown = function(){
        // stop, clean-up, destroy drones
        this.stop();
        self.user.delete();
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