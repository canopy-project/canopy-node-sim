'use strict'

var user = require('./user');

var Test = function(){
    var that = this;
    that.droneCaptain = new user();
    that.register = function(){
        that.droneCaptain.register( that.createDevice );
    }
    
    that.createDevice = function(){
         that.droneCaptain.createDevice();
    }
}

var test = new Test();

test.register();