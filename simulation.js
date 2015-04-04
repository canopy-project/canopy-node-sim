'use strict'
/*
 * Instatiates and starts a Sim Engine.  Pressing ctrl+c on the command prompt
 * will shut down the Sim Engine then exit the process
 *
 */
var cluster = require('cluster');
var h = require('./helper-functions');
var http = require('http');
var https = require('https');

if ( cluster.isMaster ){
    var cpuCount = require('os').cpus().length;
    for(var i=0; i<cpuCount;i+=1){
        cluster.fork();
    }
} else {
    var params = {
        engineName: 'engine-' + h.generateRandomString() + '-',      
        port: process.env.CANOPY_PORT,
        host: process.env.CANOPY_HOST,
        protocol: http,
        numDrones: process.env.NUM_DRONES,
        delay: process.env.SPIN_UP_DELAY,
        droneReportPeriod: process.env.REPORT_PERIOD
    }

    var engine = require('./engine');
    console.log('\n***\nconfig: \n***\n');
    console.dir(params);
    console.dir(engine);

    var simEngine = engine.createSimEngine( params );   
    console.dir(simEngine);
    simEngine.start();

    process.on('SIGINT', function() {
      simEngine.shutdown();
      console.log('engine has shut down');
      process.exit();
    });
}