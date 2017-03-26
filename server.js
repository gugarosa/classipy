var express = require("express");
var app     = express();
app.use(express.static(__dirname + '/view'));
app.use(express.static(__dirname + '/script'));

app.get('/',function(req,res){
  res.sendFile('index.html');
});

app.listen(4200);

console.log("Running at Port 4200");
