var Friends = Ractive.extend({

});

module.exports.search = function (fg, fs) {
    var friends = new Friends({
        el: '#friends',
        template: '#friends-template',
        data: {
            following: fg,
            followers: fs
        }
    });
};
