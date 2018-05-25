// var cluster = require('cluster');
var express = require('express');
// var os = require('os');
// var fs = require('fs');
var app = express();
var request = require('request');
// var path = require('path');
// var multipart = require('connect-multiparty');
// var https = require("https");
// var fs = require("fs");


//self-signed certificates with Node
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

//Code to run if we're in the master process
// if (cluster.isMaster) {
//     // Count the machine's CPUs
//     var cpuCount = os.cpus().length;
//     // Create a worker for each CPU
//     for (var i = 0; i < cpuCount; i++) {
//         cluster.fork();
//     }

//     // Listen for dying workers
//     cluster.on('exit', function (worker) {
//         console.log('Worker %d died', worker.id);
//         cluster.fork();  
//     });
// } else {
    // Create a new Express application
    app.use('/static', express.static(__dirname + '/../client/release'));
    app.use('/', express.static(__dirname + '/../client/release'));
    
    var URL = "https://api.contentstack.io";

    var port = process.env.PORT || 5000;

    app.use('/', function(req, res) {
        req.headers["web_ui_api_key"] = "607a456d7f3afc20cd9fcb1f";
        req.pipe(request(URL + req.url)).pipe(res);
    });

    app.listen(port);

   console.log('Worker[%d] : Application running on [%d] Port.',1, port);
// }