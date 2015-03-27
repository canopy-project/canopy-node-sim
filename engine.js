'use strict'
var Drone = require('./Drone');
/*
 * Manages a number of sim drones
 * Spins up sim drones 
 * Methods: Init Drone, Destroy Drone, Configure update times, set variable 
 */
var SimEngine = function( params ){
    var config = {  port: params.port,
                    server: params.server,
                    numDrones: params.numDrones,
                    delay: params.delay
                  }

    var createDrone = function(){
        this.drone = new Drone( config )
    }
    var start = function(){
        // Every delay second, spin up a drone until numDrones is reached

    }
    var stop = function(){
        // stop all drones 

    }
    var shutdown = function(){
        // stop, clean-up, destroy drones
    }

}

/*
 * Creates a simulatino engine Params has these fields:  createSimEngine params: port, server, numDrones, delay. Optional params: username, password
        port - Port of Canopy server,
        server - host name of server,
        numDrones - number of drones to spin up,
        delay - number of seconds to wait between drone spin ups,
        username - OPTIONAL username that will own the devices. If omitted, a new user will be created
        password - OPTIONAL password of user that will own the devices. Required if username is provided
*/

var createSimEngine = function( params ){
    var simEngine = new SimEngine( params );
}