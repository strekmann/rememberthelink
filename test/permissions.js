describe("Permissions", function () {

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

    describe("change admin permission for user", function () {
        it("should list all users");
        it("should change admin permissions for a user");
        it("should check admin permission after reload");
    });

    describe("change active permission for user", function () {
        it("should list all users");
        it("should change active permissions for a user");
        it("should check active permission after reload");
    });

});
