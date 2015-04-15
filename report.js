'use strict'
var http = require('http');

/* params:
    overlordHost: process.env.OVERLORD_HOST,
    overlordPort: process.env.OVERLORD_PORT,
    reporterPath: process.env.REPORTER_PATH,
    simHostName: process.env.$HOSTNAME
 */
var report = function( params ){
    var self = this;

    self.responseAvgLatency = null;
    self.responseMinLatency = null;
    self.responseMaxLatency = null;
    self.responseAvgLatencyCount = null;
    self.avgReportPeriod = null;
    self.avgReportPeriodCount = null;
    self.simHostName = process.env.$HOSTNAME;
    self.testname = params.testname;

    self.addProfileData = function( reportPeriod, latency ){
        if ( self.responseMinLatency === null ){
            self.responseMinLatency = latency;
        } else {
            self.responseMinLatency = Math.min( latency, self.responseMinLatency );
        }
        if ( self.responseMaxLatency === null ){
            self.responseMaxLatency = latency;
        } else {
            self.responseMaxLatency = Math.max( latency, self.responseMaxLatency );
        }
        if( self.responseAvgLatency === null ){
            self.responseAvgLatency = latency;
            self.responseAvgLatencyCount = 1;
        } else {
            var oldProduct = self.responseAvgLatencyCount * self.responseAvgLatency;
            var newProduct = oldProduct + latency;
            self.responseAvgLatencyCount += 1;
            var newAvgLatency = newProduct/self.responseAvgLatencyCount;
            self.responseAvgLatency = newAvgLatency;
        }
        if( reportPeriod > 0){    
            if( self.avgReportPeriod === null ){
                self.avgReportPeriod = reportPeriod;
                self.avgReportPeriodCount = 1;
            } else {
                var oldProduct = self.avgReportPeriodCount * self.avgReportPeriod;
                var newProduct = oldProduct + reportPeriod;
                self.avgReportPeriodCount += 1;
                var newAvg = newProduct/self.avgReportPeriodCount;
                self.avgReportPeriod = newAvg;
            }
        }
    };    

    self.send = function(){

        // send report
        console.log( 'reporting batch data' )
        var payloadString = JSON.stringify({
            "simHostname": process.env.$HOSTNAME,
            "testname": params.testname,
            "avgReportPeriod" : self.avgReportPeriod,
            "avgReportPeriodCount" : self.avgReportPeriodCount,
            "responseAvgLatency" : self.responseAvgLatency,
            "responseAvgLatencyCount" : self.responseAvgLatencyCount,
            "responseMinLatency" : self.responseMinLatency,
            "responseMaxLatency" : self.responseMaxLatency 
        });

        var options = {
            host: params.overlordHost,
            port: params.overlordPort,
            path: '/batch_report',
            method: 'POST',
            headers: {
                "content-type": "application/json"
            }
        };
        console.dir( options );
        var req = http.request(options, function(res) {

            res.setEncoding('utf-8');

            var responseString = '';

            res.on('data', function(data) {
                responseString += data;                   
            });

            res.on('end', function() {
                var resultObject = JSON.parse( responseString );
                console.log('response: ');
                console.dir( resultObject );
            });
        });

        req.on('error', function(e) {
            console.log(e);
        });

        req.write( payloadString );

        req.end();    
    }

}


module.exports = report;