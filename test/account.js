/*jshint expr: true*/

describe("Account", function(){
    var user,
        account_routes = require('../server/routes/index'),
        User = require('../server/models').User,
        cheerio = require('cheerio'),
        async = require('async');

    before(function(done){
        app.db.connection.db.dropDatabase(function(){
            // routes
            app.get('/test/account', function(req, res){
                req.user = user; // add test user to request
                res.locals.user = user; // add user to templates
                return account_routes.account(req, res);
            });

            app.put('/test/account', function(req, res){
                req.user = user;
                return account_routes.update_account(req, res);
            });

            // mock
            user = new User({
                _id: 'mrtest.1234567890',
                username: 'testuser',
                name: 'Mr. Test',
                email: 'mr.test@rememberthelink.com',
                is_active: true,
                is_admin: false,
                created: new Date(),
                google_id: '1234567890'
            });

            user.save(function(err){
                done(err);
            });
        });
    });

    after(function(done){
        // cleanup
        app.db.connection.db.dropDatabase(function(){
            done();
        });
    });

    describe("list information", function(){
        it("should list all information", function(done){
            request(app)
                .get('/test/account')
                .set('Accept', 'text/html')
                .expect(200)
                .end(function(err, res){
                    if (err) { return done(err); }
                    $ = cheerio.load(res.text);

                    var id = $('#id').text().trim();
                    id.should.equal(user._id);

                    var username = $('#username').val().trim();
                    username.should.equal(user.username);

                    var name = $('#name').val().trim();
                    name.should.equal(user.name);

                    var email = $('#email').val().trim();
                    email.should.equal(user.email);

                    var is_active = $('#is_active').is(':checked');
                    is_active.should.equal(user.is_active);

                    var is_admin = $('#is_admin').is(':checked');
                    is_admin.should.equal(user.is_admin);

                    var created = new Date($('#created').text().trim());
                    created.toUTCString().should.equal(user.created.toUTCString());

                    var google_id = $('#google_id').text().trim();
                    google_id.should.equal(user.google_id);

                    done();
                });
        });
    });

    describe("update information", function(){
        it("should not accept invalid email", function(done){
            request(app)
                .put('/test/account')
                .send({
                    username: user.username,
                    name: user.name,
                    email: 'haha@'
                })
                .expect(200)
                .end(function(err, res){
                    if (err) { return done(err); }
                    res.body.errors.should.be.object;
                    res.body.errors[0].param.should.equal('email');
                    done();
                });
        });

        it("should not accept taken username", function(done){
            var alice;

            async.series([
                function(callback){
                    alice = new User({
                        _id: 'alice.0987654321',
                        username: 'alice',
                        name: 'Alice',
                        email: 'alice@rememberthelink.com',
                        is_active: true,
                        is_admin: false,
                        created: new Date(),
                        google_id: '0987654321'
                    });

                    alice.save(function(err){
                        callback(err);
                    });
                },

                function(callback) {
                    request(app)
                        .put('/test/account')
                        .send({
                            username: alice.username,
                            name: user.name,
                            email: user.email
                        })
                        .expect(200)
                        .end(function(err, res){
                            if (err) { return callback(err); }
                            res.body.errors.should.be.object;
                            res.body.errors[0].param.should.equal('username');
                            callback();
                        });
                }
            ],
            function(err){
                done(err);
            });
        });

        it("should save valid new information", function(done){
            request(app)
                .put('/test/account')
                .send({
                    username: 'superman',
                    name: user.name,
                    email: user.email
                })
                .expect(200)
                .end(function(err, res){
                    if (err) { return done(err); }
                    res.body.message.should.exist;
                    done();
                });
        });

        it("changes should be saved to db", function(done){
            User.findById(user._id, function(err, doc){
                if (err) { done(err); }

                doc.username.should.equal('superman');
                done();
            });
        });
    });
});
