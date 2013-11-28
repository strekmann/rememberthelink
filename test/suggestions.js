/*jshint expr: true*/

describe("Suggestions", function(){

    var cheerio = require('cheerio'),
        links_routes = require('../server/routes/links'),
        User = require('../server/models').User,
        user,
        user1;

    before(function(done){
        app.db.connection.db.dropDatabase(function(){
            // routes
            app.get('/test/suggestions/', function(req, res){
                req.user = user; // add test user to request
                res.locals.user = user; // add user to templates
                return links_routes.suggestions(req, res);
            });

            // mock
            user = new User({
                _id: 'user',
                username: 'testuser',
                name: 'Mr. Test',
                followers: ['user1']
            });
            user1 = new User({
                _id: 'user1',
                username: 'testuser1',
                name: 'Mr. User',
                following: ['user']
            });
            user.save(function(err){
                user1.save(function(err){
                    done(err);
                });
            });
        });
    });

    after(function(done){
        // cleanup
        app.db.connection.db.dropDatabase(function(){
            done();
        });
    });

    describe("add suggestion", function(){
        app.post('/test/share/', function(req, res){
            req.user = user1; // add test user to request
            res.locals.user = user1; // add user to templates
            return links_routes.share(req, res);
        });
        it("should add suggestion", function (done) {
            request(app)
                .post('/test/share/')
                .send({
                    url: 'http://strekmann.no/',
                    id: 'user'
                })
                .expect(200)
                .end(function (req, res) {
                    res.body.status.should.be.true;
                    done();
                });
        });
        it("should list new suggestion to other user", function (done) {
            request(app)
                .get('/test/suggestions/')
                .set('Accept', 'text/html')
                .expect(200)
                .end(function (err, res) {
                    $ = cheerio.load(res.text);
                    var links = $('.links .link');
                    links.length.should.equal(1);
                    var accept = $('li[data-id="http://strekmann.no/"] .accept');
                    var reject = $('li[data-id="http://strekmann.no/"] .reject');
                    accept.should.exist;
                    reject.should.exist;
                    done();
                });
        });
    });

    describe("decline suggestion", function(){
        app.delete('/test/reject/', function(req, res){
            req.user = user; // add test user to request
            res.locals.user = user; // add user to templates
            return links_routes.reject_suggestion(req, res);
        });
        it("should reject suggestion", function (done) {
            request(app)
                .del('/test/reject/')
                .send({url: 'http://strekmann.no/'})
                .expect(200)
                .end(function (err, res) {
                    res.body.status.should.be.true;
                    done();
                });
        });
        it("should be removed from list", function (done) {
            request(app)
                .get('/test/suggestions/')
                .set('Accept', 'text/html')
                .expect(200)
                .end(function (err, res) {
                    $ = cheerio.load(res.text);
                    var links = $('.links .link');
                    links.length.should.equal(0);
                    done();
                });
        });
    });

    describe("accept suggestion", function(){
        it("should add suggestion", function (done) {
            request(app)
                .post('/test/share/')
                .send({
                    url: 'http://strekmann.no/',
                    id: 'user'
                })
                .expect(200)
                .end(function (req, res) {
                    res.body.status.should.be.true;
                    done();
                });
        });
        app.post('/test/accept/', function(req, res){
            req.user = user; // add test user to request
            res.locals.user = user; // add user to templates
            return links_routes.accept_suggestion(req, res);
        });
        it("should accept suggestion", function (done) {
            request(app)
                .post('/test/accept/')
                .send({url: 'http://strekmann.no/'})
                .expect(200)
                .end(function (err, res) {
                    res.body.status.should.be.true;
                    done();
                });
        });
        it("should be removed from list", function (done) {
            request(app)
                .get('/test/suggestions/')
                .set('Accept', 'text/html')
                .expect(200)
                .end(function (err, res) {
                    $ = cheerio.load(res.text);
                    var links = $('.links .link');
                    links.length.should.equal(0);
                    done();
                });
        });
        it("should be added to links list", function (done) {
            app.get('/test/all', function(req, res){
                req.user = user; // add test user to request
                res.locals.user = user; // add user to templates
                return links_routes.index(req, res);
            });
            request(app)
                .get('/test/all')
                .set('Accept', 'text/html')
                .expect(200)
                .end(function (err, res) {
                    $ = cheerio.load(res.text);
                    var links = $('.links .link');
                    links.length.should.equal(1);
                    done();
                });
        });
    });
});
