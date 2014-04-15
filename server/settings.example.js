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
        mongo: {
        servers: ['mongodb://localhost/test'],
        replset: null
    },
    i18n: {
        languages: ['nb','en'],
        default_language: 'nb',
        translation_directory: '/absolute/path/or/fix/yourself'
    }
};

/* secret gen: cat /dev/urandom| base64 | fold -w 64 */
