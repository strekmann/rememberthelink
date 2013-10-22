describe("links", function(){
    var mongoose = require('mongoose'),
        cheerio = require('cheerio'),
        routes = require('../server/routes/links'),
        User = require('../server/models').User,
        user;

    before(function(done){
        var conn_str = 'mongodb://localhost/' + app.conf.db_name + '_test';
        app.db = mongoose.connect(conn_str, function(err){
            if (err) { done(err); }
            user = new User({
                _id: 'testid',
                username: 'testuser',
                name: 'Mr. Test'
            });
            user.save(function(err){
                done(err);
            });
        });
    });

    after(function(done){
        app.db.connection.db.dropDatabase();
        mongoose.disconnect();
        app.db = undefined;
        done();
    });

    describe("fetch logged in frontpage", function(){
        it("should show index for logged in user", function(done){
            app.get('/', function(req, res){
                req.user = user;
                return routes.index(req, res);
            });

            request(app)
                .get('/')
                .expect(200)
                .end(function(err, res){
                    if (err) { return done(err); }
                    $ = cheerio.load(res.text);
                    $('#nav-username').first().text().should.equal('testuser');
                    done();
                });
        });
    });
});
