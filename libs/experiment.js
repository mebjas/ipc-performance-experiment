var sprintf = require('sprintf').sprintf;
var request = require('request');
var exec = require('child_process').exec;
var fork = require('child_process').fork;
var spawn = require('child_process').spawn;
var fs = require('fs');
var os = require('os');
var logger = require('./logging');

// constructor
var experiment = function(_exp) {
    // ------- private methods & members ---------
    var that = this;
    var exp = [__dirname, '../experiments', _exp].join('/');
    
    var SpawnProducer = function() {
        console.log(sprintf('[experiment] [info] [ignore] [%s] Starting producer...', that.name));
        exec(sprintf("%s", that.experiment.test.producer.start));
    }

    var SpawnConsumer = function() {
        console.log(sprintf('[experiment] [info] [ignore] [%s] Starting consumer...', that.name));
        exec(sprintf("%s", that.experiment.test.consumer.start));
    }

    var SendInstructionsToProducer = function() {
        console.log('Sending instruction to producer to start payload delivery...');
        request.post('http://127.0.0.1:' +experiment.test.producer.port +'/instruction',
            {form: {consumer: experiment.test.consumer.port}}, function(err,httpResponse,body) {
            console.log(body);
        })
    }

    // ------- public methods & members -------    
    // name of the experiment
    this.name = _exp;

    // load the experiment file
    this.experiment = require([exp, 'experiment.json'].join('/'));

    // create an instance of logger
    this.logger = new logger(exp);

    // Method: start the experiment process
    this.Start = function() {
        SpawnProducer();
        SpawnConsumer();
        // trigger the process by sending 
        setTimeout(SendInstructionsToProducer, 5000);
        // ^ TODO: remove this hardcoding
    }

    this.TriggerStatsCollection = function() {
        throw 'TBDException';
    }

    // load all the experiments from the directory
    this.LoadAll = function() {
        throw 'TBDException';
    }
}

// constructor
var producer = function(_exp) {
    // ------- private methods & members ---------
    var that = this;
    var payload_path = __dirname +'/../payload.json';
    var payload = require(payload_path);
    var Start = null, Stop = null, Consumer = null;
    var timeout = 100;

    // ------- public methods & members -------    
    // name of the experiment
    this.name = _exp;

    // create an instance of logger
    this.logger = new logger(exp + '_producer');

    // Count of payload
    this.Count = payload.length;


    // Setters; getters;
    this.SetStartMethod = function (method) {
        Start = method;
    }

    this.SetStopMethod = function (method) {
        Stop = method;
    }

    this.SetConsumer = function (consumer) {
        Consumer = consumer;
    }

    this.GetStartMethod = function() {
        if (Start == null) return function() {
            this.logger.Log('[producer] [ignore] [info] start not set');
        }
        return Start;
    }

    this.GetStopMethod = function () {
        if (Start == null) return function() {
            this.logger.Log('[producer] [ignore] [info] stop not set');
        }
        return Stop;
    }

    this.GetConsumer = function() {
        return Consumer;
    }

    this.StartActivity = function(i, j) {
        if (i >= this.payload.length) return (this.GetStopMethod())();
        if (j >= this.payload[i].Count) return this.StartActivity(i + 1, 0);

        // perform i, j activity
        (this.GetStartMethod())(payload[i], this.logger);

        setTimeout(function() {
            that.StartActivity(i, j + 1);
        }, timeout);
    }
}




module.exports = {
    experiment: experiment
}