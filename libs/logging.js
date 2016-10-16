// static logging methods
var fs = require('fs');
var os = require('os');

var logger = function(instance) {
    // private methods & members
    var that = this;
    var instance = instance;
    var logPath = [__dirname, '../log'].join('/');

    /* method to create an empty file */
    var CreateEmptyFile = function(path) {
        fs.open(path, "wx", function (err, fd) {
            // handle error
            fs.close(fd, function (err) {
                // handle error
            });
        });
    }

    /* Method to get filename for this instance */
    var GetFile = function() {
        return [__dirname, '../log', instance].join('/') + '.log';
    }

    /* Method to get message to be logged */
    var GetMessage = function(message) {
        return [new Date().getTime(), message, os.EOL].join(' ')
    }    

    // check if log path exists
    if (!fs.existsSync(logPath)) {
        // create a log dir
        fs.mkdirSync(logPath, 0766, function(err){
            if(err){ 
                console.log('[logger] [error] [ignore] creating log dir, ', err);
            }
        });  
    }

    // delete the lof file if exists already
    if (fs.existsSync(GetFile())) {
        fs.unlink(GetFile(), function(err) {
            if (err) {
                console.log('[logger] [error] [ignore] unlink log file', err);
            }
        })
    }

    CreateEmptyFile(GetFile());

    /** Public method to write to log */
    this.Log = function(message) {
        try {
            fs.writeFileSync(GetFile(), GetMessage(message));
        } catch (ex) {
            console.log('[logger] [error] [ignore] unable to write to file', ex);
        }
    }

    console.log('[logger] [info] [ignore] init done.');
};

module.exports = logger;