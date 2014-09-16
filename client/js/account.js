// Ractive component
var Account = Ractive.extend({
    init: function(options){
        this.restAPI = options.restAPI || window.location.href;
    },

    data: {
        user: {},
        info: [],
        error: [],
        longdate: function(date){
            return moment(date).format('LLL');
        }
    },

    updateUser: function(user){
        return $.ajax({
            type: 'PUT',
            url: this.restAPI,
            data: user,
        });
    }
});

module.exports.accountView = function(user){
    var account = new Account({
        el: '#account',
        template: '#template',
        restAPI: '/account'
    });

    account.set('user', user);

    account.on('updateUser', function(event){
        event.original.preventDefault();
        account.updateUser(event.context.user)
            .then(function(data){
                // everything ok
                if (data.message){
                    account.get('info').push(data.message);
                }
                if (data.error){
                    account.get('error').push(data.error);
                }
                if (data.errors){
                    _.each(data.errors, function(err){
                        account.get('error').push(err.msg);
                    });
                }
            }, function(xhr, status, err){
                account.get('error').push(err);
            });
        $('body').animate({scrollTop: 0}, 'fast');
    });

    account.on('closeBox', function(event){
        var keyparts = event.keypath.split('.'),
            index = keyparts.pop(),
            path = keyparts.join('.');
        account.get(path).splice(index, 1);
    });

    return account;
};
