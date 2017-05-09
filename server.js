process.env.TMPDIR = 'tmp'; // to avoid the EXDEV rename error, see http://stackoverflow.com/q/21071303/76173

// Input variables
var express = require('express');
var bodyParser = require('body-parser')
var flow = require('./public/js/flow-node.js')('tmp');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var predict = require("./public/js/predict")
var path = require('path');

var app = express();

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// Configure access control allow origin header stuff
var ACCESS_CONTROLL_ALLOW_ORIGIN = false;

// Using the following routes for the app
app.use(express.static(path.join(__dirname, 'public')));

// Handle index page rendering
app.get('/',function(req,res){
  res.render('index');
});

app.get('/about',function(req,res){
  res.render('about');
});

app.get('/im_classify',function(req,res){
  res.render('im_classify');
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

// Handle predictions through Flow.js
app.get('/predict/:identifier', function(req, res) {
	predict.newPrediction(req.params.identifier, function (err, result) {
		if (err) throw err;
		console.log(result);
		res.render('prediction', result);
	});
});

// Listening on desired port
app.listen(4200);

// Log server running
console.log("Running at Port 4200");
