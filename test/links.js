describe("links", function(){
    var mongoose = require('mongoose'),
        cheerio = require('cheerio'),
        link_routes = require('../server/routes/links'),
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

    describe("save link", function () {
        it("should let user save one link", function (done) {
            app.get('/test/', function(req, res){
                req.user = res.locals.user = user;
                return link_routes.index(req, res);
            });
            app.get('/test/new', function (req, res) {
                req.user = res.locals.user = user;
                return link_routes.new_link(req, res);
            });
            app.post('/test/new', function (req, res) {
                req.user = res.locals.user = user;
                return link_routes.create_link(req, res);
            });

            request(app)
                .get('/test/new?url=http://www.google.no/')
                .set('Accept', 'text/html')
                .expect(200)
                .end(function(err, res){
                    if (err) { return done(err); }
                    $ = cheerio.load(res.text);
                    var url = $('#url').first().val();
                    var title = $('#title').first().val();
                    title.should.equal('Google');  // not very smart

                    request(app)
                        .post('/test/new')
                        .send({url: url, title: title, description: "Nothing to see here", tags: "search, find"})
                        .set('Accept', 'text/html')
                        .expect(302)
                        .end(function (err, res) {
                            if (err) { return done(err); }

                            request(app)
                                .get('/test/')
                                .set('Accept', 'text/html')
                                .expect(200)
                                .end(function(err, res){
                                    if (err) { return done(err); }
                                    $ = cheerio.load(res.text);
                                    var links = $('#links-index .links').children();
                                    links.length.should.equal(1);
                                    var first = links.first();
                                    first.find('h2.title a').attr('href').should.equal('http://www.google.no/');
                                    first.find('h2.title a').text().should.equal('Google');
                                    first.find('.description').text().should.equal('Nothing to see here');
                                    // TODO: Check tags
                                    done();
                                });
                        });
                });
        });
    });
});
