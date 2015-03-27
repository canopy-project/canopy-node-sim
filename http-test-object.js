'use strict'
var http = require('http');
var h = require('./helper-functions');

var RegisterUser = function(){
    var self = this;
    self.registrationData = {
        'username': h.generateUsername,
        'email': h.generateEmail,
        'password': h.generatePassword,
        'skip-email': true
    };

    self.postString = JSON.stringify( self.registrationData );

    self.headers = {
        'Content-Type' : 'application/json',
        'Content-Length' : self.postString.length
    };

    self.options = {
        host: 'https://dev02.canopy.link',
        port: 80,
        path: '/api/create_user',
        method: 'POST',
        headers: self.headers 
    };

   /* self.request = function(){
        http.request( self.options, function( response ){
            response.setEncoding('utf-8');

            this.responseString = '';
            response.on('data', function(data){
                responseString += data;
            });
            response.on('end', function(){
                this.resultObject = JSON.parse( responseString );
            });
        });
    };*/
/*    self.write = function(){};*/
}

var registration = new RegisterUser();

/*registration.request.on('error', function(e){
    console.log(e);
});
*/
registration.write( self.registrationData );

registration.request.end();
