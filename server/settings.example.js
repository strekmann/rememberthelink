module.exports = {
    siteName: 'boilerplate',
    uri: 'http://localhost:3000/',
    sessionSecret: 'sessionSecretString',
    auth: {
        google: {
            clientId: 'googleClientId',
            clientSecret: 'googleCLientSecret',
            callbackURL: 'http://localhost:3000/auth/google/callback'
        }
    },
    redis: {
        host: '127.0.0.1',
        port: 6379
    },
    i18n: {
        locales: ['en'],
        defaultLocale: 'en'
    }
};

/* secret gen: cat /dev/urandom| base64 | fold -w 64 */
