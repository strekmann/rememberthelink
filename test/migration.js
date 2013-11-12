describe("Migration", function() {
    var cheerio = require('cheerio'),
        async = require('async'),
        _ = require('underscore'),
        fs = require('fs'),
        link_routes = require('../server/routes/links'),
        User = require('../server/models').User,
        Link = require('../server/models/links').Link,
        export_all = require('../server/utils/lib/migration').export_all,
        user,
        data;

    before(function (done) {
        app.db.connection.db.dropDatabase(function () {

            app.get('/test/export', function (req, res) {
                req.user = res.locals.user = user;
                return link_routes.export_bookmarks(req, res);
            });
            app.post('/test/import', function (req, res) {
                req.user = res.locals.user = user;
                return link_routes.upload_bookmarks(req, res);
            });

            user = new User({
                _id: 'testid',
                username: 'testuser',
                name: 'Ms. Test'
            });

            user.save(function(err){
                async.parallel({
                    link1: function (callback) {
                        var link = new Link({
                            url: 'http://1.example.com/',
                            title: 'Link 1',
                            creator: user._id
                        });
                        link.save(function (err) {
                            callback(err, null);
                        });
                    },
                    link2: function (callback) {
                        var link = new Link({
                            url: 'http://2.example.com/',
                            title: 'Link 2',
                            creator: user._id
                        });
                        link.save(function (err) {
                            callback(err, null);
                        });
                    }
                },
                function (err, results) {
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

    describe("export all data", function () {
        it("should export all data as json", function (done) {
            export_all(function (err, users) {
                users.length.should.equal(1);
                done();
            });
        });
    });

    describe("export user data", function(){
        it("should return user data feed", function (done) {
            request(app)
                .get('/test/export')
                .set('Accept', 'text/html')
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        done(err);
                    }
                    data = res.text;
                    $ = cheerio.load(data);
                    $('a').length.should.equal(2);
                    done();
                });
        });
    });

    describe("import user data", function(){
        it("should import user data feed", function (done) {
            Link.remove(function () {
                var tmpfile = '/tmp/rememberthelink.test';
                fs.writeFile(tmpfile, data, function () {
                    request(app)
                        .post('/test/import')
                        .attach('import', tmpfile)
                        .expect(200)
                        .end(function (err, res) {
                            if (err) {
                                done(err);
                            }
                            Link.find(function (err, links) {
                                links.length.should.equal(2);
                                _.each(links, function (link) {
                                    link.url.should.match(/^http:\/\/\d+\.example\.com\/$/);
                                    link.title.should.match(/^Link \d+$/);
                                    link.creator.should.equal('testid');
                                });
                                done();
                            });
                        });
                });
            });
        });
    });

});
