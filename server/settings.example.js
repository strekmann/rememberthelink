module.exports = {
    sessionSecret: 'sessionSecretString',
    auth: {
        google: {
            clientId: 'googleClientId',
            clientSecret: 'googleCLientSecret',
            callbackURL: 'http://localhost:3000/auth/google/callback'
        }
    },
    bot: {
        name: 'strekmann',
        server: 'irc.homelien.no',
        channels: ['#strekmann'],
        postUrl: 'http://localhost:3000/links/uwanna'
    }
};

/* secret gen: cat /dev/urandom| base64 | fold -w 64 */