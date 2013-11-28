var botLogger,
    linkLogger,
    settings,
    request = require('request');


var bot = {};

bot.init = function(_botLogger, _linkLogger, _settings) {
    botLogger = _botLogger;
    linkLogger = _linkLogger;
    settings = _settings;
};


bot.findLink  = function(message) {
    var result = message.match(/(\w+):\s*(http\S+)/);
    if (result === null) {
        return null;
    }

    return {
        to: result[1],
        url: result[2]
    };
};

bot.onMessage = function(from, to, message) {
    if (to.match(/^[#&]/)) {
        // channel message
        if (message.indexOf('http') > -1) {
            // 
            linkLogger.info(message);
        }

        var link = bot.findLink(message);
        if (link) {
            request.post(settings.bot.postUrl, {form: {
                from: from, 
                to: link.to, 
                url: link.url,
                seq: settings.bot.seq
            }});
        }
    }
};

bot.onPrivate = function(nick, message) {
    botLogger.log('info', 'Private message from %s: %s', nick, message);    
};

module.exports = bot;
