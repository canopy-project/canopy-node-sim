'use strict'

var http = require('http');

var user = {
  username: 'The Reddest',
  email: 'brandon@switchonthecode.com',
  firstName: 'Brandon',
  lastName: 'Cannaday'
};

var userString = JSON.stringify(user);

var headers = {
  'Content-Type': 'application/json',
  'Content-Length': userString.length
};

var options = {
  host: 'myServer.example.com',
  port: 80,
  path: '/user/TheReddest',
  method: 'POST',
  headers: headers
};

// Setup the request.  The options parameter is
// the object we defined above.
var req = http.request(options, function(res) {
  res.setEncoding('utf-8');

  var responseString = '';

  res.on('data', function(data) {
    responseString += data;
  });

  res.on('end', function() {
    var resultObject = JSON.parse(responseString);
  });
});

req.on('error', function(e) {
  // TODO: handle error.
});

req.write(userString);
req.end();