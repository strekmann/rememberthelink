describe("I18n", function(){
    describe("locale nb", function(){
        it("should translate to norwegian", function(){
            var text = "With blueberry jam",
                __ = app.i18n.__;

            __({phrase: text, locale: 'nb'}).should.equal("Med blåbærsyltetøy");
        });
    });

    describe("locale zh", function(){
        it("should translate to simplified chinese", function(){
            var text = "With blueberry jam",
                __ = app.i18n.__;

            __({phrase: text, locale: 'zh'}).should.equal("和蓝莓酱");
        });
    });
});