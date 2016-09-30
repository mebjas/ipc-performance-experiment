var express = require('express');
var bodyParser = require('body-parser');
var sprintf = require('sprintf').sprintf;
var request = require('request');
var fs = require('fs');
var exec = require('child_process').exec;
var LineByLineReader = require('line-by-line');

var logPath = process.argv[2];
var lr = new LineByLineReader(logPath);

var r = new RegExp(/(\d*)\s([A-Z]*)\s([A-Z]*)\s([0-9]*)/);

var data = function(index, sendTime) {
    this.index = index;
    this.sendTime = sendTime;
}
data.prototype.recv = function(recvTime) {
    this.recvTime = recvTime;
    this.timetoRecieve = this.recvTime - this.sendTime;
}
data.prototype.ack = function(ackTime) {
    this.ackTime = ackTime;
    this.timetoAck = this.ackTime - this.recvTime;
    this.rttTime = this.ackTime - this.sendTime;
}

var datalist = [];

lr.on('line', function (line) {
    if (line.indexOf('[ignore]') != -1) return;
    var _s = (r.exec(line));
    var cat = _s[3];
    if (cat == 'SEND') {
        datalist[parseInt(_s[4])] = new data(parseInt(_s[4]), parseInt(_s[1]));
    } else if (cat == 'RECV') {
        datalist[parseInt(_s[4])].recv(parseInt(_s[1]));
    } else if (cat == 'ACK') {
        datalist[parseInt(_s[4])].ack(parseInt(_s[1]));
    }
});

lr.on('end', function() {
    // perform stats
    var max = {
        timetoRecieve: -1,
        timetoAck: -1,
        rttTime: -1,
    };
    var min = {
        timetoRecieve: 100000000000,
        timetoAck: 100000000000,
        rttTime: 100000000000,
    };
    var average = {
        timetoRecieve: 0,
        timetoAck: 0,
        rttTime: 0,
    };

    datalist.forEach(function(dl) {
        if (dl.timetoRecieve > max.timetoRecieve) max.timetoRecieve = dl.timetoRecieve;
        if (dl.timetoRecieve < min.timetoRecieve) min.timetoRecieve = dl.timetoRecieve;
        average.timetoRecieve += dl.timetoRecieve;

        if (dl.timetoAck > max.timetoAck) max.timetoAck = dl.timetoAck;
        if (dl.timetoAck < min.timetoAck) min.timetoAck = dl.timetoAck;
        average.timetoAck += dl.timetoAck;

        if (dl.rttTime > max.rttTime) max.rttTime = dl.rttTime;
        if (dl.rttTime < min.rttTime) min.rttTime = dl.rttTime;
        average.rttTime += dl.rttTime;
    });

    average.rttTime /= datalist.length;
    average.timetoAck /= datalist.length;
    average.timetoRecieve /= datalist.length;

    console.log('min', JSON.stringify(min));
    console.log('max', JSON.stringify(max));
    console.log('average', JSON.stringify(average));
})
