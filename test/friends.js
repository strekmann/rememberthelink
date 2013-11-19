/*jshint expr: true*/

describe("Friends", function(){

    var cheerio = require('cheerio'),
        friends_routes = require('../server/routes/friends'),
        //admin_routes = require('../server/routes/admin'),
        User = require('../server/models').User,
        user,
        user1;

    before(function(done){
        app.db.connection.db.dropDatabase(function(){
            // routes
            app.get('/test/friends/', function(req, res){
                req.user = user; // add test user to request
                res.locals.user = user; // add user to templates
                return friends_routes.index(req, res);
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

    describe("list friends page", function(){
        it("Mr. Test should have one follower: Mr. User", function (done) {
            request(app)
                .get('/test/friends/')
                .set('Accept', 'text/html')
                .expect(200)
                .end(function(err, res){
                    if (err) { return done(err); }
                    $ = cheerio.load(res.text);
                    $('.usercount').text().should.match(/Now we have in total 2 users./);
                    $('.followers p').children.length.should.equal(1);
                    $('.followers p').text().should.equal("Mr. User");
                    done();
                });
        });
        it("Mr. User should be following one user: Mr. Test", function (done) {
            // routes
            app.get('/newtest/friends/', function(req, res){
                req.user = user1; // add test user to request
                res.locals.user = user1; // add user to templates
                return friends_routes.index(req, res);
            });
            request(app)
                .get('/newtest/friends/')
                .set('Accept', 'text/html')
                .expect(200)
                .end(function(err, res){
                    if (err) { return done(err); }
                    $ = cheerio.load(res.text);
                    $('.usercount').text().should.match(/Now we have in total 2 users./);
                    $('.following p').children.length.should.equal(1);
                    $('.following p').text().should.equal("Mr. Test");
                    done();
                });
        });
    });

    describe("add friend", function(){
        it("should search for users and find testuser1", function (done) {
            request(app)
                .get('/test/friends/?username=testuser1')
                .set('Accept', 'text/html')
                .expect(200)
                .end(function(err, res){
                    if (err) { return done(err); }
                    $ = cheerio.load(res.text);
                    $('.friends .username').text().should.equal('testuser1');
                    done();
                });
        });
        it("should add friend to following list", function (done) {
            app.post('/test/friends/add/', function(req, res){
                req.user = user; // add test user to request
                res.locals.user = user; // add user to templates
                return friends_routes.add(req, res);
            });
            request(app)
                .post('/test/friends/add/')
                .send({'username': 'testuser1'})
                .expect(200)
                .end(function (err, res) {
                    if (err) { return done(err); }
                    res.body.status.should.be.true;
                    done();
                });
        });
        it("should now follow testuser1", function (done) {
            request(app)
                .get('/test/friends/')
                .set('Accept', 'text/html')
                .expect(200)
                .end(function(err, res){
                    if (err) { return done(err); }
                    $ = cheerio.load(res.text);
                    $('.following p').children.length.should.equal(1);
                    $('.following p').text().should.equal("Mr. User");
                    done();
                });
        });
    });

    describe("remove friend", function(){
        it("friend should be removed from following list");
    });
});
