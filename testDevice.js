'use strict'
var frisby = require('frisby');
var h = require('./helper-functions');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var TestDevice = function( device, callback ){
    var that = this;
    that.UUID = device.UUID;
    that.secretKey = device.secretKey;
    that.friendlyName = device.friendlyName;
    that.baseURL = 'https://dev02.canopy.link/api/';
    that.devicePath = 'device/';
    that.selfPath = that.baseURL + that.devicePath + that.UUID;
    that.authString = h.generateAuthString( that.UUID, that.secretKey );
    that.basicAuthHeaders = {"Content-Type":"application/json", "Authorization": that.authString}

    that.basicAuthVerifySelf = function ( expectJSON, callback ){
        console.log('********** Device Verifying Self *********');
        console.log( '*** EXPECT JSON ***')
        console.dir( expectJSON );
        frisby.create('SELF-VERIFY DEVICE ' + that.UUID)
            .get( that.selfPath,
                { headers: that.basicAuthHeaders }
            )
            .expectStatus(200)
            .inspectJSON()
            .expectJSON( expectJSON )
            .after(function(){
                if(callback){
                    callback();
                }
            })
            .toss()
    }
    that.basicAuthDelete = function( callback ){
        console.log( '**** Device Deleting Self with Basic Auth' );
        frisby.create('SELF-DELETE DEVICE ' + that.UUID)
            .addHeaders( that.basicAuthHeaders )
            .delete( that.selfPath )
           .expectStatus(200)
           .expectHeaderContains('content-type', 'application/json')
           .inspectJSON()
           .expectJSON({
              "result" : "ok"
           })
           .after(function(){
                if( callback ){
                    callback();
                }
           })
            .toss()
    } 
    that.basicAuthUpdateProperties = function( updateJSON, callback ){
        console.log('**********updating properties******** ');

        frisby.create('UPDATE DEVICE PROPERTIES FOR ' + that.UUID)
            .addHeader("Authorization", that.authString)
            .addHeader("Content-Type", "application/json")
            .post( that.selfPath,
                updateJSON,
                { json: true }
            )
            .expectStatus(200)
            .inspectJSON()
            .after(function(){
                if(callback){
                    callback()
                }
            })
            .toss()
    }
    that.basicAuthDeclareCloudVariables = function( variableDeclarations, callback ){
        console.log('\n\n**********  Declaring Cloud Variables ********\n\n');

        frisby.create('DECLARE VARIABLES FOR DEVICE ' + that.UUID)
            .addHeader("Authorization", that.authString)
            .addHeader("Content-Type", "application/json")
            .post( that.selfPath,
                variableDeclarations,
                { json: true }
            )
            .expectStatus(200)
            .inspectJSON()
            .after(function(){
                if(callback){
                    callback()
                }
            })
            .toss()
    }    
    that.basicAuthSetCloudVariables = function( variableUpdates, callback ){
        console.log('\n\n**** Updating Cloud Vars *****\n\n');
        console.dir(variableUpdates);
        frisby.create('SET CLOUD VARS FOR DEVICE ' + that.UUID)
            .addHeader("Authorization", that.authString)
            .addHeader("Content-Type", "application/json")
            .post( that.selfPath, 
                variableUpdates,
                { json: true }
            )
            .expectStatus( 200 )
            .inspectJSON()
            .expectJSON( variableUpdates )
            .after(function(){
                if(callback){
                    callback()
                }
            })
            .toss()
    }
}
module.exports = TestDevice;