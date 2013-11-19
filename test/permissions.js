/*jshint expr: true*/

describe("Permissions", function () {

    var cheerio = require('cheerio'),
        link_routes = require('../server/routes/links'),
        admin_routes = require('../server/routes/admin'),
        User = require('../server/models').User,
        user,
        admuser;

    before(function(done){
        app.db.connection.db.dropDatabase(function(){
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
                name: 'Mr. Test',
                is_active: true,
                is_admin: false
            });
            admuser = new User({
                _id: 'admtestid',
                username: 'admtestuser',
                name: 'Mr. Admin',
                is_active: true,
                is_admin: true
            });
            user.save(function(err){
                admuser.save(function(err){
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
        it("should list all users", function (done) {
            app.get('/test/admin/', function (req, res) {
                req.user = user; // add test user to request
                res.locals.user = user; // add user to templates
                return admin_routes.user_list(req, res);
            });

            request(app)
                .get('/test/admin/')
                .set('Accept', 'text/html')
                .expect(200)
                .end(function (err, res) {
                    if (err) { return done (err); }
                    $ = cheerio.load(res.text);
                    var users = $('table tbody tr');
                    users.length.should.equal(2);
                    var user = $("tr[data-id='testid']");
                    user.find('.is_admin').is(':checked').should.be.false;
                    done();
                });
        });
        it("should not be able to change own is_admin", function (done) {
            app.put('/test/admin/permissions/:id', function (req, res) {
                req.user = admuser;
                res.locals.user = admuser; // add user to templates
                return admin_routes.set_permissions(req, res);
            });

            request(app)
                .put('/test/admin/permissions/admtestid')
                .send({user_id: 'admtestid', is_admin: false})
                .expect(200)
                .end(function (err, res) {
                    if (err) { return done (err); }
                    res.body.status.should.exist;
                    // not ok - unsetting own admin
                    res.body.status.should.not.be.ok;
                    done();
                });
        });
        it("should change admin permissions for a user", function (done) {
            request(app)
                .put('/test/admin/permissions/testid')
                .send({user_id: 'testid', is_admin: true})
                .expect(200)
                .end(function (err, res) {
                    if (err) { return done (err); }
                    res.body.status.should.exist;
                    res.body.status.should.be.ok;
                    done();
                });
        });
        it("should check admin permission after reload", function (done) {
            request(app)
                .get('/test/admin/')
                .set('Accept', 'text/html')
                .expect(200)
                .end(function (err, res) {
                    if (err) { return done (err); }
                    $ = cheerio.load(res.text);
                    var users = $('table tbody tr');
                    users.length.should.equal(2);
                    var user = $("tr[data-id='testid']");
                    user.find('.is_admin').is(':checked').should.be.true;
                    done();
                });
        });
    });

    describe("change active permission for user", function () {
        it("should list all users", function (done) {
            app.get('/test/admin/', function (req, res) {
                req.user = user; // add test user to request
                res.locals.user = user; // add user to templates
                return admin_routes.user_list(req, res);
            });

            request(app)
                .get('/test/admin/')
                .set('Accept', 'text/html')
                .expect(200)
                .end(function (err, res) {
                    if (err) { return done (err); }
                    $ = cheerio.load(res.text);
                    var users = $('table tbody tr');
                    users.length.should.equal(2);
                    var user = $("tr[data-id='testid']");
                    user.find('.is_active').is(':checked').should.be.true;
                    done();
                });
        });
        it("should not be able to change own is_active", function (done) {
            app.put('/test/admin/permissions/:id', function (req, res) {
                req.user = admuser;
                res.locals.user = admuser; // add user to templates
                return admin_routes.set_permissions(req, res);
            });

            request(app)
                .put('/test/admin/permissions/admtestid')
                .send({user_id: 'admtestid', is_active: false})
                .expect(200)
                .end(function (err, res) {
                    if (err) { return done (err); }
                    res.body.status.should.exist;
                    // not ok - unsetting own admin
                    res.body.status.should.not.be.ok;
                    done();
                });
        });
        it("should change active permissions for a user", function (done) {
            request(app)
                .put('/test/admin/permissions/testid')
                .send({user_id: 'testid', is_active: true})
                .expect(200)
                .end(function (err, res) {
                    if (err) { return done (err); }
                    res.body.status.should.exist;
                    res.body.status.should.be.ok;
                    done();
                });
        });
        it("should check active permission after reload", function (done) {
            request(app)
                .get('/test/admin/')
                .set('Accept', 'text/html')
                .expect(200)
                .end(function (err, res) {
                    if (err) { return done (err); }
                    $ = cheerio.load(res.text);
                    var users = $('table tbody tr');
                    users.length.should.equal(2);
                    var user = $("tr[data-id='testid']");
                    user.find('.is_active').is(':checked').should.be.true;
                    done();
                });
        });
    });

});
