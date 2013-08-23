describe("Requests", function(){
    describe("fetching unknown url", function(){
        it("should return 404", function(done){
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
});
