var restify = require('restify');
var builder = require('botbuilder');
var config = require('./configuration');

//=========================================================
// Bot Setup
//=========================================================

/******** FOR TESTING WITH CONSOLE CONNECTION *********

// Create chat bot
// Create bot and bind to console
var connector = new builder.ConsoleConnector().listen();
var bot = new builder.UniversalBot(connector);

******************************************************/


/******** FOR USE WITH BOT EMULATOR AND/OR FOR DEPLOYMENT *********
*/

// Get secrets from server environment
var botConnectorOptions = { 
    appId: config.CONFIGURATIONS.CHAT_CONNECTOR.APP_ID, 
    appPassword: config.CONFIGURATIONS.CHAT_CONNECTOR.APP_PASSWORD
};

// Create bot
var connector = new builder.ChatConnector(botConnectorOptions);
var bot = new builder.UniversalBot(connector);

// Setup Restify Server
var server = restify.createServer();

// Handle Bot Framework messages
server.post('/api/messages', connector.listen());

// Serve a static web page - for testing deployment
server.get(/.*/, restify.serveStatic({
	'directory': '.',
	'default': 'index.html'
}));

server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url); 
});

/*
****************************************************************/

//=========================================================
// Bots Dialogs
//=========================================================

bot.dialog('/', function (session) {

    var extractedUrl = extractUrl(session.message);

    if (extractedUrl === "") {
    }
    else {
        analyzeImage(extractedUrl, function (error, response, body) {
            if (response.statusCode == 200)
            {
                var message = "";
                var racyMessage = "";
                if (body.adult.isAdultContent) {
                    message += "I wouldn't click on that if I were you. There is ADULT content in that link! Shame on you! There's at least ";
                } else {
                    message += "What a nice, safe for work image you've linked. I'm proud of you. There's only "
                    var racyScore = Number(body.adult.racyScore * 100).toFixed(1);
                    if (racyScore > 10)
                    {
                        racyMessage += " Though there is ~" + racyScore.toString() + "% of slightly inappropriate material here. Don't make me report you."
                    }
                }
                var adultScore = Number(body.adult.adultScore * 100).toFixed(1);
                message += adultScore.toString() + "% adult content in that image." + racyMessage;

                session.send(message);
            } else {
                session.send("Sorry. I can't process other links yet. Please link an image instead.");
            }
        }, ["Adult"])
    }

});

// Services
var request = require("request");

//=========================================================
// Vision Service
//=========================================================

var readImageText = function _readImageText(url, callback) {

    var options = {
        method: 'POST',
        url: config.CONFIGURATIONS.COMPUTER_VISION_SERVICE.API_URL + "ocr/",
        headers: {
            'ocp-apim-subscription-key': config.CONFIGURATIONS.COMPUTER_VISION_SERVICE.API_KEY,
            'content-type': 'application/json'
        },
        body: {url: url, language: "en"},
        json: true
    };

    request(options, callback);

};

//=========================================================
// Analyze Vision Service
//=========================================================

var buildUrl = function(url, additionalFields = []) {
    for(i = 0; i < additionalFields.length; i++)
    {
        if (i == 0)
        {
            url += "?";
        } else {
            url += "&";
        }

        url += additionalFields[i];
    }

    return url;
}

var analyzeImage = function _analyzeImage(url, callback, features = []) {

    var visualFeatures = ""
    features.forEach(function(element) {
        if (visualFeatures === "")
        {
            visualFeatures = "visualFeatures=" + element;
        } else {
            visualFeatures += "," + element;
        }
    });

    var endpoint = buildUrl(config.CONFIGURATIONS.COMPUTER_VISION_SERVICE.API_URL + config.CONFIGURATIONS.COMPUTER_VISION_SERVICE.API_ANALYZE_RESOURCE, [visualFeatures]);

    var options = {
        method: 'POST',
        url: endpoint,
        headers: {
            'ocp-apim-subscription-key': config.CONFIGURATIONS.COMPUTER_VISION_SERVICE.API_KEY,
            'content-type': 'application/json'
        },
        body: {url: url},
        json: true
    };

    request(options, callback);
};


//=========================================================
// URL Helpers
//=========================================================


var extractUrl = function _extractUrl(message) {

    if (message.type !== "message") return;

    if (typeof message.attachments !== "undefined"
        && message.attachments.length > 0) {
        return message.attachments[0].contentUrl;
    }

    if (typeof message.text !== "") {
        return _findUrl(message.text);
    }

    return "";
};


function _findUrl(text) {
    var source = (text || '').toString();
    var matchArray;

    // Regular expression to find FTP, HTTP(S) and email URLs.
    var regexToken = /(((http|https?):\/\/)[\-\w@:%_\+.~#?,&\/\/=]+)/g;

    // Iterate through any URLs in the text.
    if ((matchArray = regexToken.exec(source)) !== null) {
        var token = matchArray[0];
        return token;
    }

    return "";
}

// a test image:  https://img0.etsystatic.com/045/0/6267543/il_570xN.665155536_842h.jpg

// Download images

var fs = require('fs');

var download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    // console.log('content-type:', res.headers['content-type']);
    // console.log('content-length:', res.headers['content-length']);

    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};


