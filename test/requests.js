describe("Requests", function(){
    describe("fetching unknown url", function(){
        it("returns 404", function(done){
            request(app)
                .get("/err")
                .expect(404)
                .end(function(err, res){
                    if (err) { return done(err); }
                    done();
                });
        });
    });

    describe("fetching protected url", function(){
        it("redirects to login", function(done){
            request(app)
                .get("/account")
                .expect(302)
                .end(function(err, res){
                    if (err) { return done(err); }
                    expect(res.text).to.equal('Moved Temporarily. Redirecting to /login');
                    done();
                });
        });
    });
});
