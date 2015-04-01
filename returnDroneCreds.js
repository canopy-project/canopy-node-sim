/*
 *  Function should return the UUID and Auth String necessary to create a drone
 */

 var getDroneCreds = function(){
    var device = user.createDevice();

    var UUID = device.UUID;
    var Auth = device.Auth;
    var droneCreds = {
        UUID: UUID,
        Auth: Auth
    }
    return( droneCreds );  
 }