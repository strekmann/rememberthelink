module.exports = {
    uri: 'http://localhost:3000/',
    sessionSecret: 'sessionSecretString',
    auth: {
        google: {
            clientId: 'googleClientId',
            clientSecret: 'googleCLientSecret',
            callbackURL: 'http://localhost:3000/auth/google/callback'
        }
    }
};

/* secret gen: cat /dev/urandom| base64 | fold -w 64 */
