describe("Permissions", function () {

    var cheerio = require('cheerio'),
        link_routes = require('../server/routes/links'),
        User = require('../server/models').User,
        user;

    before(function(done){
        // routes
        app.get('/test/', function(req, res){
            req.user = user; // add test user to request
            res.locals.user = user; // add user to templates
            return link_routes.index(req, res);
        });

        // mock
        user = new User({
            _id: 'testid',
            username: 'testuser',
            name: 'Mr. Test'
        });
        user.save(function(err){
            done(err);
        });
    });

    after(function(done){
        // cleanup
        app.db.connection.db.dropDatabase();
        done();
    });

    describe("fetching protected url", function(){
        it("should redirect to login", function(done){
            request(app)
                .get("/account")
                .expect(302)
                .end(function(err, res){
                    if (err) { return done(err); }
                    res.text.should.equal('Moved Temporarily. Redirecting to /login');
                    done();
                });
        });
    });

    describe("fetch frontpage for logged in user", function(){
        it("should show index for logged in user", function(done){
            app.get('/test/', function(req, res){
                req.user = user; // add test user to request
                res.locals.user = user; // add user to templates
                return link_routes.index(req, res);
            });

            request(app)
                .get('/test/')
                .set('Accept', 'text/html')
                .expect(200)
                .end(function(err, res){
                    if (err) { return done(err); }
                    $ = cheerio.load(res.text);
                    $('#nav-username').first().text().should.equal('testuser');
                    done();
                });
        });
    });

    describe("change admin permission for user", function () {
        it("should list all users");
        it("should change admin permissions for a user");
        it("should check admin permission after reload");
    });

    describe("change active permission for user", function () {
        it("should list all users");
        it("should change active permissions for a user");
        it("should check active permission after reload");
    });

});
