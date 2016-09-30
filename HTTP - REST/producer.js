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

if (process.argv.length < 6) {
    throw ('Insufficient arguments');
}

var port = process.argv[2];
var payload_path = [__dirname, process.argv[3]].join('\\');
var log_path = [__dirname,process.argv[4]].join('\\');
var timeout = parseInt(process.argv[5]);
var consumer = null;
var consumerExit = null;

function log(message) {
    fs.appendFile(log_path, [new Date().getTime(), message].join(' ') +os.EOL, null, 'utf8');
}

app.listen(port, function() {
    log(sprintf("[ignore] producer listening to port %s", port));
});

var payload = require(payload_path);
var acked = 0;
function Stop() {
    if (acked == payload.length) {
        request.get(consumerExit).on('response', function() {
            log("[ignore] poducer exiting");
            process.exit(-1);
        });
    }
}

function Start(index) {
    if (index == undefined) index = 0;
    if (index == payload.length) return;
    var p = payload[index];

    if (p.method == 'GET') {
        log(["PRODUCER", "SEND", index].join(' '));
        request.get(consumer +'?data=' +p.data +'&time=' +(new Date().getTime()) +'&index=' +index).on('response', function() {
            console.log(["PRODUCER", "ACK", index].join(' '));
            log(["PRODUCER", "ACK", index].join(' '));

            acked++;
            Stop();
        });
    } else if (p.method == 'POST') {
        log(["PRODUCER", "SEND", index].join(' '));
        request.post(consumer, {form: {data: p.data, time: new Date().getTime(), index: index}}, function() {
            console.log(["PRODUCER", "ACK", index].join(' '));
            log(["PRODUCER", "ACK", index].join(' '));

            acked++;
            Stop();
        });
    }

    setTimeout(function() {
        Start(index + 1);
    }, 500);
}

app.post('/instruction', function(req, res) {
    consumer = 'http://127.0.0.1:' +req.body.consumer +'/listen';
    consumerExit = 'http://127.0.0.1:' +req.body.consumer +'/exit';
    log(sprintf("[ignore] producer recieved consumer: %s", consumer));  
    setTimeout(Start, timeout);
})