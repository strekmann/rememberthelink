describe("routes: Index", function(){
    describe("GET /err", function(){
        it("should return 404", function(done){
            request(app)
                .get("/err")
                .set('Accept', 'application/json')
                .expect(404)
                .end(function(err, res){
                    if (err) return done(err);
                    done();
                });
        });
    });
});
