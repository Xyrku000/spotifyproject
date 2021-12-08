// Lines 2–5 are a set of "require"s, which set up the rest of the code. (default code)
var express = require('express');
var request = require('request');
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');

// Lines 9–11 reflect my own app's identification numbers and the link I am using. (default code)
var client_id = '359981eb1fcf4364880f4a034ed78be6';
var client_secret = '4e49d9f29f3c4b139c9d4cdccd2c7e74';
var redirect_uri = 'http://localhost:8888/callback';

// I am not sure what this is used for.
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

//These lines 25 through 74 are also commands which "get" information from Spotify before I use it. (default code)
var stateKey = 'spotify_auth_state';

var app = express();

app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());

app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  var scope = 'playlist-read-private';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/callback', function(req, res) {

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };
  }

// This code actually posts the information from Spotify. Now I can tell it what I need.

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        var access_token = body.access_token,
            refresh_token = body.refresh_token;
        var options = { // These are the options we need, especially the URL that I provide.
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true,
          url: 'https://api.spotify.com/v1/tracks/09d1QWH73sjjyKYc0Mu82I'
        };
        
        request.get(options, function(error, response, body) { // This is where my code gets the options.
        });

        // This is where my code starts.
        // I copied a command which reads the user's lines.

        var readline = require('readline');
        
        // This part I copied which collects the user's response. (copied code)

        var rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });

        // recursiveAsyncReadline is the first of two functions.
        // This one starts with asking the user for a track.

        var recursiveAsyncReadLine = function () {
          rl.question('Which track ID are you looking for? Or type "exit" to exit.', function (track) {
            if (track == 'exit') { // You can type in "exit" to end the sequence.
              return rl.close();
            }
            if (track.length == 22) {
              reecursiveAsyncReadline(); // Otherwise you are redirected to the second part.
            } else {
              console.log('Error 101: must be 22-character ID') // The track ID must be 22 digits long.
            }
            recursiveAsyncReadLine(); // This repeats the first part.
          });
        }

        recursiveAsyncReadLine(); // This calls the first part.


        // This second part asks the user for a country.
        var reecursiveAsyncReadline = function () {
          rl.question('Which country are you looking for?', country => {
            if (country.length > 2) {
              console.log('Error 102: must be a 2-digit country code.') // The country code must be 2 digits long.
              reecursiveAsyncReadline();
            }
            var hugebody = JSON.stringify(body) // This line makes the "body" of Spotify's response into a string.
            var hugerbody = hugebody.includes(country) // This line looks for the country the user gives in the "body".
            if (hugerbody === true) { // This tests if the boolean result of the previous line is true or false.
              console.log(`It is available in ${country}!`); // This is response 1 (positive).
              recursiveAsyncReadLine(); // This loops back to the start.
            } else {
              console.log(`It is not available in ${country}!`); // This is response 2 (negative).
              recursiveAsyncReadLine(); // This loops back to the start.
            }
            reecursiveAsyncReadline(); // This repeats the question.
          });
        };

        reecursiveAsyncReadline(); // This calls the second part.

        // This part I do not know. (default code)
        res.redirect('/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      }
    });
});

// The app gets more information and posts it. (default code)

app.get('/refresh_token', function(req, res) {

  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

// The console says that it is waiting for you to log in.
//It is listening on http://8888 which is the local server.
console.log('Please log in to Spotify.');
app.listen(8888);

