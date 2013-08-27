describe("I18n", function(){
    describe("simple translation works", function(){
        it("should translate to nb", function(){
            var text = "With blueberry jam",
                __ = app.i18n.__;

            __({phrase: text, locale: 'nb'}).should.equal("Med blåbærsyltetøy");
        });
    });
});
