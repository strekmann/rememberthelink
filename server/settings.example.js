module.exports = {
    uri: 'http://localhost:3000/',
    sessionSecret: 'sessionSecretString',
    auth: {
        google: {
            clientId: 'googleClientId',
            clientSecret: 'googleCLientSecret',
            callbackURL: 'http://localhost:3000/auth/google/callback'
        },
        facebook: {
            clientId: 'FacebookAppId',
            clientSecret: 'FacebookAppSecret',
            callbackURL: 'http://localhost:3000/auth/facebook/callback'
         }
    },
    bot: {
        name: 'bot',
        server: 'irc.net',
        channels: ['#channel'],
        postUrl: 'http://localhost:3000/uwanna',
        seq: 'hello'
    },
        redis: {
        host: '127.0.0.1',
        port: 6379
    },
    mongo: {
        servers: ['mongodb://localhost/rtl'],
        replset: null
    }
};

/* secret gen: cat /dev/urandom| base64 | fold -w 64 */
