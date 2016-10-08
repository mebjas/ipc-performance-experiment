var express = require('express');
var bodyParser = require('body-parser');
var sprintf = require('sprintf').sprintf;
var request = require('request');
var exec = require('child_process').exec;

var app = express();
app.use(bodyParser.json() );        // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({      // to support URL-encoded bodies
  extended: true
}));

var experimentPath = process.argv[2];
var experiment = require([__dirname, experimentPath, 'experiment.json'].join('\\'));
var childProcess = require('child_process');

var ItemsToComplete = 2, ItemsCompleted = 0, Complete = function() {
    ItemsCompleted++;
    if (ItemsCompleted == ItemsToComplete) {
        console.log(sprintf("Things complete, starting stats engine... "))
        exec(sprintf("node stats.js"));
    }
}

console.log("Spawning producer ...");
exec(sprintf('cd "%s" && %s', experimentPath, experiment.test.producer.start), function (error, stdout, stderr) {
    if (error) {
        console.log(error);     
    }
});

console.log("Spawning consumer ...")
exec(sprintf('cd "%s" && %s', experimentPath, experiment.test.consumer.start), function (error, stdout, stderr) {
    if (error) {
        console.log(error);     
    }
});

// now that both are spawned
console.log("Sleeping for 5000ms and sending instructions ...");
setTimeout(function() {
    request.post('http://127.0.0.1:' +experiment.test.producer.port +'/instruction', {form: {consumer: experiment.test.consumer.port}}, function(err,httpResponse,body){
        console.log(body);
    })
}, 5000);


var Complete = function() {

}
