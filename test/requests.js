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
});
