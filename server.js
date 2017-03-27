var express = require("express");
var app     = express();

var predict = require("./scripts/js/predict")

app.use(express.static(__dirname + '/view'));
app.use(express.static(__dirname + '/script'));

app.get('/',function(req,res){
  res.sendFile('index.html');
});

app.get('/predict',function(req,res){
  predict.newPrediction(function (err, result) {
		if (err) throw err;
		console.log(result);
		res.end(result);
	});
});

app.listen(4200);

console.log("Running at Port 4200");
