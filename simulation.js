'use strict'
var params = {
    engineName: droneEngineAlpha,      
    port: 80,
    server: 'https://ccs.canopy.link',
    numDrones: 20,
    delay: 10,
    droneReportPeriod: 1 
}

var engine = require('./engine');

var simEngine = engine.createSimEngine( params );

process.on('SIGINT', function() {
  simEngine.shutdown();
  console.log('engine has shut down');
  process.exit();
});