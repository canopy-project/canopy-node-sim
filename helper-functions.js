'strict mode'

var generateRandomString = function(){
    return Math.random().toString(36).substring(2,15);
}

var generateUsername = function(){
    return  'DroneCommander' + Math.floor( Math.random()*100000 );
}

var generateEmail = function(){
    var randomString = generateRandomString();
    return randomString + '@' + randomString + '.com';
}

var generatePassword = function(){
    return 'password' + Math.floor( Math.random()*100000000 );
}

var generateAuthString = function( username, password ){
        return 'Basic ' + new Buffer( username + ':' + password ).toString("base64");
}

var generateDeviceFriendlyNames = function( quantity ){
    var friendlyNames = [];
    while( friendlyNames.length < quantity){
        friendlyNames.push(
              'device' + Math.random().toString(36).substring(2,10)
          );
    }
    return friendlyNames;
}

var generateInt = function(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

module.exports.generateRandomString = generateRandomString;
module.exports.generateUsername = generateUsername;
module.exports.generateEmail = generateEmail;
module.exports.generatePassword = generatePassword;
module.exports.generateAuthString = generateAuthString;
module.exports.generateDeviceFriendlyNames = generateDeviceFriendlyNames;
module.exports.generateInt = generateInt;