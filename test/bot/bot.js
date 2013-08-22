describe("IRC bot", function(){
    var bot = require('../../bot/lib/gbot');
    describe("find link in message", function(){
        it("should find sender and link", function(){
            var message = "sigurdga: https://jira.itea.ntnu.no/secure/RapidBoard.jspa?rapidView=50&view=detail&selectedIssue=SPW-146";
            var link = bot.findLink(message);
            link.should.be.object;
            link.from.should.equal('sigurdga');
            link.url.should.equal('https://jira.itea.ntnu.no/secure/RapidBoard.jspa?rapidView=50&view=detail&selectedIssue=SPW-146');
        });
    });
});
