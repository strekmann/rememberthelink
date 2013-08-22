var botLogger,
    linkLogger;


var bot = {};

bot.init = function(_botLogger, _linkLogger) {
    botLogger = _botLogger;
    linkLogger = _linkLogger;
};


bot.findLink  = function(message) {
    var result = message.match(/(\w+):\s*(http\S+)/);
    if (result === null) {
        return null;
    }

    return {
        from: result[1],
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
            // do magic
            console.log(link);
        }
    }
};

bot.onPrivate = function(nick, message) {
    botLogger.log('info', 'Private message from %s: %s', nick, message);    
};

module.exports = bot;