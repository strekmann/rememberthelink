// -- development config
module.exports = function(app, express){
    app.use(express.logger('dev'));

    app.use(express.errorHandler({
        dumpExceptions: true,
        showStack: true
    }));
};
