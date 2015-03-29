'use strict'
var q = require('q');
var user = require('./user');

var Test = function(){
    var that = this;
    that.run = function(){
      that.droneCaptain = new user();
      that.droneCaptain.register().then( that.droneCaptain.delete );
    }
}

var test = new Test();

test.run();