module.exports = {
    uri: 'http://localhost:3000/',
    sessionSecret: 'sessionSecretString',
    auth: {
        google: {
            clientId: 'googleClientId',
            clientSecret: 'googleCLientSecret',
            callbackURL: 'http://localhost:3000/auth/google/callback'
        }
    },
    bot: {
        name: 'bot',
        server: 'irc.net',
        channels: ['#channel'],
        postUrl: 'http://localhost:3000/uwanna',
        seq: 'hello'
    }
};

/* secret gen: cat /dev/urandom| base64 | fold -w 64 */
