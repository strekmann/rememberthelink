describe("Links", function(){
    var cheerio = require('cheerio'),
        link_routes = require('../server/routes/links'),
        User = require('../server/models').User,
        Link = require('../server/models/links').Link,
        user;

    before(function(done){
        app.db.connection.db.dropDatabase(function(){
            // routes
            app.get('/test/', function(req, res){
                req.user = user; // add test user to request
                res.locals.user = user; // add user to templates
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
            app.delete('/test/delete', function (req, res) {
                req.user = res.locals.user = user;
                return link_routes.delete_link(req, res);
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
    });

    after(function(done){
        // cleanup
        app.db.connection.db.dropDatabase(function(){
            done();
        });
    });

    describe("list links", function(){
        it("should list links");
    });

    describe("save link", function () {
        var url,
            title;

        it("should fetch new link data", function (done) {
            request(app)
                .get('/test/new?url=http://rememberthelink.com/')
                .set('Accept', 'text/html')
                .expect(200)
                .end(function(err, res){
                    if (err) { return done(err); }
                    $ = cheerio.load(res.text);
                    url = $('#url').first().val();
                    title = $('#title').first().val();
                    title.should.equal('Remember the link');
                    done();
                });
        });

        it("should post new link", function(done){
            request(app)
                .post('/test/new')
                .send({url: url, title: title, description: "Nothing to see here", tags: "search, find"})
                .set('Accept', 'text/html')
                .expect(302)
                .end(function (err, res) {
                    if (err) { return done(err); }
                    done();
                });
        });

        it("should find new saved link", function(done){
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
                    first.find('h2.title a').attr('href').should.equal('http://rememberthelink.com/');
                    first.find('h2.title a').text().should.equal('Remember the link');
                    first.find('.description').text().should.equal('Nothing to see here');
                    // TODO: Check tags
                    done();
                });
        });
    });

    describe("delete link", function(){
        var url = 'http://rememberthelink.com/';
        it("should remove link", function (done) {
            request(app)
                .del('/test/delete')
                .send({url: url})
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        });

        it("should find no links", function(done){
            request(app)
                .get('/test/')
                .set('Accept', 'text/html')
                .expect(200)
                .end(function(err, res){
                    if (err) { return done(err); }
                    $ = cheerio.load(res.text);
                    var links = $('#links-index .links').children();
                    links.length.should.equal(0);
                    done();
                });
        });
    });
});
