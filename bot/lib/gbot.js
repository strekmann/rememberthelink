var botLogger,
    linkLogger;

module.exports.init = function(_botLogger, _linkLogger) {
    botLogger = _botLogger;
    linkLogger = _linkLogger;
};


var findLink  = function(message) {
    var result = message.match(/(\w+):\s*(http\S+)/);
    if (result === null) {
        return null;
    }

    return {
        from: result[1],
        url: result[2]
    };
};
module.exports.findLink = findLink;



module.exports.onMessage = function(from, to, message) {
    if (to.match(/^[#&]/)) {
        // channel message
        if (message.indexOf('http') > -1) {
            // 
            linkLogger.info(message);
        }

        var link = findLink(message);
    }
};

module.exports.onPrivate = function(nick, message) {
    botLogger.log('info', 'Private message from %s: %s', nick, message);    
};