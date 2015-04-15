'use strict'
/*
 * Instatiates and starts a Sim Engine.  Pressing ctrl+c on the command prompt
 * will shut down the Sim Engine then exit the process
 *
 */
var cluster = require('cluster');
var h = require('./helper-functions');
var protocol = require(process.env.CANOPY_PROTOCOL);
var engine = require('./engine');
var params = {
    engineName: 'engine-' + h.generateRandomString() + '-',      
    port: process.env.CANOPY_PORT,
    host: process.env.CANOPY_HOST,
    protocol: protocol,
    numDrones: process.env.NUM_DRONES,
    numBatches: process.env.NUM_BATCHES,
    spinUpDelay: process.env.SPIN_UP_DELAY,
    batchDelay: process.env.BATCH_DELAY,
    droneReportPeriod: process.env.REPORT_PERIOD,
    overlordHost: process.env.OVERLORD_HOST,
    overlordPort: process.env.OVERLORD_PORT,
    reporterPath: process.env.REPORTER_PATH,
    testname: process.env.OVERLORD_HOST +': ' + process.env.TESTNAME
}


console.log('numBatches: ' + params.numBatches)

// Engine initialization function, provides Engine
// set up and tear down

var initEngine = function(){
    var simEngine = engine.createSimEngine( params );   
    simEngine.start();
    process.on('SIGINT', function() {
      simEngine.shutdown();
      console.log('engine has shut down');
    });
}

// Engine Cluster function - runs if process.env.CLUSTER
// is true

var runCluster = function(){
    console.log('running cluster');
    if ( cluster.isMaster ){
    // scan for cores on your
    // computer and fork one engine per core
        var cpuCount = require('os').cpus().length;
        for(var i=0; i<cpuCount;i+=1){
            cluster.fork();
        }
    } else {
    // The following function is run once per fork
        initEngine();
    }    
}
 
// Run program based on CLUSTER truthiness

if( process.env.CLUSTER === 'false' ){
    console.log('running single instance');
    initEngine();
} else {
    console.log('running cluster');
    runCluster(); 
}