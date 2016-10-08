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

function log(message, toConsole) {
    if (toConsole) console.log(message);
    fs.appendFile(log_path, [new Date().getTime(), message].join(' ') +os.EOL, null, 'utf8');
}

app.listen(port, function() {
    log(sprintf("[ignore] producer listening to port %s", port), true);
});

var payload = require(payload_path);
var acked = 0;
var INDEX = 0;
var expectedAck = 0;
// calculate this value
payload.forEach(function(p) {
    expectedAck += p.Count;
});

function Stop() {
    if (acked == expectedAck) {
        request.get(consumerExit).on('response', function() {
            log("[ignore] poducer exiting", true);
            process.exit(-1);
        });
    }
}

function Start(index) {
    if (index == undefined) index = 0;
    if (index == payload.length) return;
    var p = payload[index];
    var Count = p.Count;

    switch(p.method) {
        case 'GET':
            while (Count -- ) {
                ++INDEX;

                var _INDEX = INDEX;
                console.log(sprintf(" --> SENDING HTTP PACKET COUNT %d", INDEX));
                log(["PRODUCER", "SEND", INDEX].join(' '));
                request.get(consumer +'?data=' +p.data +'&time=' +(new Date().getTime()) +'&index=' +INDEX , function(a, b, res) {
                    // console.log(["PRODUCER", "ACK", INDEX].join(' '));
                    var _index = JSON.parse(res).index;
                    log(["PRODUCER", "ACK", _index].join(' '));
                    acked++;
                    Stop();
                });
            }
        break;

        case 'POST':
            while (Count --) {
                ++ INDEX;

                var _INDEX = INDEX;                
                console.log(sprintf(" --> SENDING HTTP PACKET COUNT %d", INDEX));    
                log(["PRODUCER", "SEND", INDEX].join(' '));
                request.post(consumer, {form: {data: p.data, time: new Date().getTime(), index: INDEX}}, function(a, b, res) {
                    // console.log(["PRODUCER", "ACK", INDEX].join(' '));
                    var _index = JSON.parse(res).index;
                    log(["PRODUCER", "ACK", _index].join(' '));
                    acked++;
                    Stop();
                });
            }
        break;

        default:
        break;
    }

    // Start(index + 1);
    setTimeout(function() {
        Start(index + 1);
    }, 1000);
}

app.post('/instruction', function(req, res) {
    consumer = 'http://127.0.0.1:' +req.body.consumer +'/listen';
    consumerExit = 'http://127.0.0.1:' +req.body.consumer +'/exit';
    log(sprintf("[ignore] producer recieved consumer: %s", consumer), true);
    res.json({ack: true, message: sprintf("Task will start in %s ms", timeout)})
    setTimeout(Start, timeout);
})