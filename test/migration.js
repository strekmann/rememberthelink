describe("Migration", function() {
    var cheerio = require('cheerio'),
        async = require('async'),
        _ = require('underscore'),
        fs = require('fs'),
        redis = require('../server/lib/redisclient'),
        link_routes = require('../server/routes/links'),
        User = require('../server/models').User,
        Link = require('../server/models/links').Link,
        export_all = require('../setup/lib/migration').export_all,
        import_all = require('../setup/lib/migration').import_all,
        user,
        user_data;

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
                            creator: user._id,
                            tags: ['t1', 't2', 't3']
                        });
                        link.save(function (err) {
                            callback(err, null);
                        });
                    },
                    link2: function (callback) {
                        var link = new Link({
                            url: 'http://2.example.com/',
                            title: 'Link 2',
                            creator: user._id,
                            tags: ['t1', 't3', 't4']
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
                redis.del('tags_' + user._id, function () {
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
                                        link.tags.length.should.equal(3);
                                    });
                                    redis.zrevrange('tags_' + user._id, 0, 9, function (err, tags) {
                                        tags.length.should.equal(4);
                                        done();
                                    });
                                });
                            });
                    });
                });
            });
        });
    });

    describe("export all data", function () {
        it("should export all data as json", function (done) {
            export_all(function (err, users) {
                user_data = users;
                users.length.should.equal(1);
                users[0].links.length.should.equal(2);
                done();
            });
        });
    });

    describe("import all data", function () {
        it("should import all data after a database reset", function (done) {
            app.db.connection.db.dropDatabase(function(){
                redis.flushdb(function () {
                    import_all(user_data, function (err, statistics) {
                        if (err) {
                            done(err);
                        }
                        Link.count(function (err, number) {
                            number.should.equal(2);
                            redis.zrevrange('urls', 0, 9, function (err, urls) {
                                urls.length.should.equal(2);
                                redis.zrevrange('tags', 0, 9, function (err, tags) {
                                    tags.length.should.equal(4);
                                    done();
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});
