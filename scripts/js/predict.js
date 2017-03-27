var prediction;
var script = 'pre_trained.py';
var options = {
	mode: 'text',
	scriptPath: './scripts/keras/',
  args: ['-i', './scripts/tmp/dog.jpg']
};

// Use python shell
var PythonShell = require('python-shell');
var shell = new PythonShell(script, options);

shell.on('message', function (message) {
    // received a message sent from the Python script (a simple "print" statement)
		prediction = message;
});

// end the input stream and allow the process to exit
shell.end(function (err) {
		console.log(prediction);
});
