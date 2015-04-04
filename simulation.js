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
        port: 443,
        host: 'ccs.canopy.link',
        protocol: https,
        numDrones: 10,
        delay: 1,
        droneReportPeriod: 1
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