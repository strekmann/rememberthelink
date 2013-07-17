// example module routes
module.exports = function(app) {
    app.get('/', function(req, res){
        res.json({message: 'im an example'});
    });
};
