(function($){
    $.fn.s7n = $.fn.s7n || {};

    $.fn.s7n.initAccount = function(options) {
        var settings = $.extend({
            saveBtn: '#savebtn',
            usernameField: '#username',
            errors: '#errors'
        }, options);

        var $btn = $(settings.saveBtn);
        var $username = $(settings.usernameField);
        var $form = $btn.parents('form');
        var $errors = $(settings.errors);

        $btn.on('click', function(){
            $errors.empty();
            $.ajax({
                type: 'POST',
                url: window.location.href,
                data: $form.serialize(),
                success: function(data) {
                    if (data.message) {
                        $errors.append('<div data-alert class="alert-box success">'+ data.message +'<a href="#" class="close">&times;</a></div>');
                    }

                    if (data.error) {
                        $errors.append('<div data-alert class="alert-box alert">'+ data.error +'<a href="#" class="close">&times;</a></div>');
                    }

                    if (data.errors) {
                        var errors = '';
                        $.each(data.errors, function(i, error){
                            errors += '<div data-alert class="alert-box alert">'+ error.msg +'<a href="#" class="close">&times;</a></div>';
                        });
                        $errors.append(errors);
                    }
                }
            });
            return false;
        });

        return this;
    };
}(jQuery));