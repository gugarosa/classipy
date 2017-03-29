process.env.TMPDIR = 'tmp'; // to avoid the EXDEV rename error, see http://stackoverflow.com/q/21071303/76173

// Input variables
var express = require("express");
var flow = require('./scripts/js/flow-node.js')('tmp');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var predict = require("./scripts/js/predict")
var app     = express();

// Configure access control allow origin header stuff
var ACCESS_CONTROLL_ALLOW_ORIGIN = false;

// Using the following routes for the app
app.use(express.static(__dirname + '/node_modules/bootstrap'));
app.use(express.static(__dirname + '/scripts/js'));
app.use(express.static(__dirname + '/view'));
app.use(express.static(__dirname + '/view/figs'));
app.use(express.static(__dirname + '/view/css'));

// Handle index page rendering
app.get('/',function(req,res){
  res.sendFile('index.html');
});

// Handle new prediction function
app.get('/predict',function(req,res){
  predict.newPrediction(function (err, result) {
		if (err) throw err;
		console.log(result);
		res.end(result);
	});
});

// Handle uploads through Flow.js
app.post('/upload', multipartMiddleware, function(req, res) {
  flow.post(req, function(status, filename, original_filename, identifier) {
    console.log('POST', status, original_filename, identifier);
    if (ACCESS_CONTROLL_ALLOW_ORIGIN) {
      res.header("Access-Control-Allow-Origin", "*");
    }
    res.status(/^(partly_done|done)$/.test(status) ? 200 : 500).send();
  });
});


app.options('/upload', function(req, res){
  console.log('OPTIONS');
  if (ACCESS_CONTROLL_ALLOW_ORIGIN) {
    res.header("Access-Control-Allow-Origin", "*");
  }
  res.status(200).send();
});

// Handle status checks on chunks through Flow.js
app.get('/upload', function(req, res) {
  flow.get(req, function(status, filename, original_filename, identifier) {
    console.log('GET', status);
    if (ACCESS_CONTROLL_ALLOW_ORIGIN) {
      res.header("Access-Control-Allow-Origin", "*");
    }

    if (status == 'found') {
      status = 200;
    } else {
      status = 204;
    }

    res.status(status).send();
  });
});

// // Handle downloads through Flow.js
// app.get('/download/:identifier', function(req, res) {
// 	flow.write(req.params.identifier, res);
// });

// Handle downloads through Flow.js
app.get('/download/:identifier', function(req, res) {
	predict.newPrediction(req.params.identifier, function (err, result) {
		if (err) throw err;
		console.log(result);
		res.end(result);
	});
});

// Listening on desired port
app.listen(4200);

// Log server running
console.log("Running at Port 4200");
