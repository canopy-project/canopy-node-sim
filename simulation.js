'use strict'
/*
 * Instatiates and starts a Sim Engine.  Pressing ctrl+c on the command prompt
 * will shut down the Sim Engine then exit the process
 *
 */
var h = require('./helper-functions');
var http = require('http');
var https = require('https');

var params = {
    engineName: 'engine-' + h.generateRandomString() + '-',      
    port: 80,
    host: 'dev03.canopy.link',
    protocol: http,
    numDrones: 500,
    delay: .1,
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