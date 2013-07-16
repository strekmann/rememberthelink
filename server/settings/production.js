// -- production config
var fs = require('fs');

module.exports = function(app, express){
    app.use(express.logger({
        format: 'tiny',
        stream: fs.createWriteStream('node.log')
    }));

    app.use(express.errorHandler());
};
