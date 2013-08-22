describe("IRC bot", function(){
    var bot = require('../../bot/lib/gbot');

    describe("find link in message", function(){
        it("should find recipient and link", function(){
            var message = "sigurdga: https://jira.com/secure/RapidBoard.jspa?rapidView=50&view=detail&selectedIssue=W-146";
            var link = bot.findLink(message);
            link.should.be.object;
            link.to.should.equal('sigurdga');
            link.url.should.equal('https://jira.com/secure/RapidBoard.jspa?rapidView=50&view=detail&selectedIssue=W-146');
        });
    });
});
