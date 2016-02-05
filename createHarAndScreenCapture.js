"use strict";
var page = require('webpage').create(),
    system = require('system'),
    fs = require('fs'),
    createHAR = require('./modules/netsniff.js').createHAR,
    waitFor = require('./modules/waitfor.js').waitFor,
    config = require('./config.json');

if (system.args.length < 2) {
    console.log('Usage: createHARFile.js <identifier>');
    phantom.exit(1);
} else if (config[system.args[1]] === undefined) {
    console.log('Unble to determine identifier');
    phantom.exit(1);
}

// read config.json.
var id = system.args[1],
    userAgent = config[id]["useragent"],
    url = config[id]["url"],
    fileName = config[id]["filename"],
    timeout = config[id]["timeout"] === "" ? 10000 : parseInt(config[id]["timeout"]),
    selector = config[id]["selector"],
    width = parseInt(config[id]["viewportwidth"]),
    height = parseInt(config[id]["viewportheight"]);

// callback function(test condition)
var testFx = function() {
    if (selector !== "") {
        // try and fetch the desired element from the page
        return page.evaluate(function(selector) {
            return !!document.querySelector(selector); 
        }, selector);
    } else {
        // wait for onResourceReceived
        return function() {
            for (var i=1; i<page.resources.length; ++i) {
                if (page.resources[i].endReply === undefined) {
                    return false;
                }
            }
            return true;
        };
    }
};
// callback function(when test condition is fulfilled)
var onReadyFx = function() {
    function getFormattedDate() {
        var dt = new Date();
        var formatDt =  '' + dt.getFullYear();
        formatDt += ('0'+(dt.getMonth() + 1)).slice(-2);
        formatDt += ('0'+dt.getDate()).slice(-2);
        formatDt += ('0'+dt.getHours()).slice(-2);
        formatDt += ('0'+dt.getMinutes()).slice(-2);
        formatDt += ('0'+dt.getSeconds()).slice(-2);
        return formatDt;
    }

    page.endTime = new Date();
    page.title = page.evaluate(function () {
        return document.title;
    });
    // Set background color for render.
    // Examples for pdf file :
    // see: http://stackoverflow.com/questions/21964043/can-i-force-phantomjs-to-render-pdfs-with-the-background-images-and-colors
    // see: http://uggedal.com/journal/phantomjs-default-background-color/
    page.evaluate(function() {
        document.body.bgColor = 'white';
    });
    var har = createHAR(page.address, page.title, page.startTime, page.resources);
    // create files
    var formatDt =  getFormattedDate();
    var harFile = fileName+formatDt+'.har';
    var renderFile = fileName+formatDt+'.jpg';
    fs.write(harFile, JSON.stringify(har, undefined, 4), 'w'); 
    page.render(renderFile);
    phantom.exit();
};

page.address = url;
page.resources = [];

page.onLoadStarted = function () {
    page.startTime = new Date();
};

// settings for mobile.
if (userAgent !== "") {
    page.settings.userAgent = userAgent;
}

page.viewportSize = {
    width: width,
    height: height
};

page.onResourceRequested = function (req) {
    page.resources[req.id] = {
        request: req,
        startReply: null,
        endReply: null
    };
};

page.onResourceReceived = function (res) {
    if (res.stage === 'start') {
        page.resources[res.id].startReply = res;
    }
    if (res.stage === 'end') {
        page.resources[res.id].endReply = res;
    }
};

page.open(page.address, function (status) {
    if (status !== 'success') {
        console.log('FAIL to load the address');
        phantom.exit(1);
    } else {
        waitFor(testFx, onReadyFx, timeout);
    }
});
