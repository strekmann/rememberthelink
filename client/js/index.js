moment.locale($('html').attr('lang'));

var suggestions = new Ractive({
    el: '#suggestion-count',
    template: '#suggestion-count-template',
    data: {
        suggestions: 0
    }
});

module.exports = {
    account: require('./account'),
    links: require('./links'),
    friends: require('./friends'),
    admin: require('./admin'),
    suggestions: suggestions
};
