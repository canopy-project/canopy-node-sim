var user = require('./user');
var Test = function(){
    var that = this;
    that.droneCaptain = new user();
    that.register = function(){
        console.log('registering');
        that.droneCaptain.register(that.createDevice );
    }
    
    that.createDevice = function(){
        console.log('creating device');
        that.droneCaptain.createDevice( {}, that.delete );
    }

    that.delete = function(){
        console.log('deleting user');
        that.droneCaptain.delete();
    }
}

var test = new Test();

test.register();