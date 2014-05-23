// Ractive component
var Account = Ractive.extend({
    init: function(options){
        this.restAPI = options.restAPI || window.location.href;
    },

    data: {
        user: {},
        info: [],
        error: []
    },

    updateUser: function(user){
        console.log(user);

        $.ajax({
            type: 'PUT',
            url: restAPI,
            data: user,
            success: function(data) {
                if (data.message) {
                    errors.append('<div data-alert class="alert-box success">'+ data.message +'<a href="#" class="close">&times;</a></div>');
                }

                if (data.error) {
                    errors.append('<div data-alert class="alert-box alert">'+ data.error +'<a href="#" class="close">&times;</a></div>');
                }

                if (data.errors) {
                    var err = '';
                    $.each(data.errors, function(i, error){
                        err += '<div data-alert class="alert-box alert">'+ error.msg +'<a href="#" class="close">&times;</a></div>';
                    });
                    errors.append(err);
                }
            }
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
        account.updateUser(event.context.user);
    });

    return account;
};

/*
module.exports = {
    indexView: function(){
        var btn = $('#savebtn'),
            username = $('#username'),
            form = btn.parents('form'),
            errors = $('#errors');

        btn.on('click', function(){
            errors.empty();
            $.ajax({
                type: 'PUT',
                url: window.location.href,
                data: form.serialize(),
                success: function(data) {
                    if (data.message) {
                        errors.append('<div data-alert class="alert-box success">'+ data.message +'<a href="#" class="close">&times;</a></div>');
                    }

                    if (data.error) {
                        errors.append('<div data-alert class="alert-box alert">'+ data.error +'<a href="#" class="close">&times;</a></div>');
                    }

                    if (data.errors) {
                        var err = '';
                        $.each(data.errors, function(i, error){
                            err += '<div data-alert class="alert-box alert">'+ error.msg +'<a href="#" class="close">&times;</a></div>';
                        });
                        errors.append(err);
                    }
                }
            });
            return false;
        });
    }
};
*/
