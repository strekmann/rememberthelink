var Friends = Ractive.extend({

    addFriend: function (user) {
        return $.ajax({
            type: 'POST',
            dataType: 'json',
            url: '/friends',
            data: _.pick(user, '_id')
        });
    },

    removeFriend: function (user) {
        return $.ajax({
            type: 'DELETE',
            dataType: 'json',
            url: '/friends',
            data: _.pick(user, '_id')
        });
    }
});

module.exports.index = function (fg, fs) {
    var friends = new Friends({
        el: '#friends',
        template: '#friends-template',
        data: {
            following: fg,
            followers: fs,
        }
    });

    friends.on('addFriend', function (event) {
        event.original.preventDefault();

        friends.set('error', undefined);
        if (event.context.query) {
            friends.addFriend({_id: event.context.query})
            .then(function (user) {
                friends.set('query', '');
                friends.get('following').push(user);
            })
            .fail(function (xhr) {
                friends.set('error', xhr.responseJSON.error);
            });
        }
    });

    friends.on('removeFriend', function (event) {
        event.original.preventDefault();

        friends.removeFriend(event.context)
        .then(function (user) {
            friends.get('following').splice(event.keypath.split(".").pop(), 1);
        });
    });
};
