var gbot = require('./lib/gbot'),
    irc = require('irc'),
    winston = require('winston'),
    settings = require('../server/settings');

var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            level: 'error'
        }),
        new (winston.transports.File)({
            filename: __dirname + '/bot.log',
            json: false,
            colorize: false
        })
    ],
    exitOnError: false
});

var links = new (winston.Logger)({
    transports: [
        new (winston.transports.File)({
            colorize: false,
            filename: __dirname + '/html.log',
            json: false
        })
    ],
    exitOnError: false
});

gbot.init(logger, links, settings);

var bot = new irc.Client(settings.bot.server, settings.bot.name, {
    channels: settings.bot.channels,
    userName: settings.bot.name,
    realName: settings.bot.name,
    retryCount: 3
});

// error handling
bot.addListener('error', function(msg){
    logger.log('error', '%s %s', msg.command, msg.args.join(' '));
});

// all messages
bot.addListener('message', gbot.onMessage);

// private message
bot.addListener('pm', gbot.onPrivate);

bot.addListener('join', function(channel, who){
    logger.log('info', '%s joined %s', who, channel);
});