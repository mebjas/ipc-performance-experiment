var express = require('express');
var bodyParser = require('body-parser');
var sprintf = require('sprintf').sprintf;
var request = require('request');
var fs = require('fs');
var os = require('os');

var app = express();
app.use(bodyParser.json() );        // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({      // to support URL-encoded bodies
  extended: true
}));

if (process.argv.length < 5) {
    throw ('Insufficient arguments');
}

var port = process.argv[2];
var log_path = [__dirname,process.argv[3]].join('\\');
var timeout = parseInt(process.argv[4]);

function log(index, message, res, toConsole) {
    if (toConsole) console.log(message);
    fs.appendFile(log_path, [new Date().getTime(), message].join(' ') +os.EOL, null, 'utf8', function() {
        if (res != undefined) res.json({index: index, ack: true, time: new Date().getTime()});    
    });
}

app.listen(port, function() {
    log(-1, sprintf("[ignore] consumer listening to port %s", port), undefined, true);
});

app.post('/listen', function(req, res) {
    var index = req.body.index;
    log(index, ["CONSUMER", "RECV", index].join(' '), res);    
});

app.get('/listen', function(req, res) {
    var index = req.query.index;
    log(index, ["CONSUMER", "RECV", index].join(' '), res);
});

app.get('/exit', function(req, res) {
    log(-1, "[ignore] consumer exiting", undefined, true);
    res.json({ack: true, message: sprintf("PROCESS WILL EXIT IN %sms", 500)});
    setTimeout(function() {
        process.exit(0);
    }, 500);
});