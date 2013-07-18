// example module routes
module.exports = function(app, prefix) {
	prefix = prefix || '';

    app.get(prefix+'/', function(req, res){
        res.render('example/index', {
            message: "hello node!"
        });
    });
};
