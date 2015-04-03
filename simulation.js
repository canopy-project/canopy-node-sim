'use strict'
/*
 * Instatiates and starts a Sim Engine.  Pressing ctrl+c on the command prompt
 * will shut down the Sim Engine then exit the process
 *
 */
var h = require('./helper-functions');

var params = {
    engineName: 'engine-' + h.generateRandomString() + '-',      
    port: 80,
    host: 'dev03.canopy.link',
    numDrones: 10,
    delay: 2,
    droneReportPeriod: 1 
}

var engine = require('./engine');
console.dir(engine);

var simEngine = engine.createSimEngine( params );   
console.dir(simEngine);
simEngine.start();

process.on('SIGINT', function() {
  simEngine.shutdown();
  console.log('engine has shut down');
  process.exit();
});