// example module routes
module.exports = function(app) {
    app.get('/', function(req, res){
        res.render('example/index', {
            message: "hello node!"
        });
    });
};
