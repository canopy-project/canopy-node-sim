'use strict'
var params = {
    engineName: 'droneEngineAlpha',      
    port: 80,
    server: 'https://ccs.canopy.link',
    numDrones: 20,
    delay: 10,
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