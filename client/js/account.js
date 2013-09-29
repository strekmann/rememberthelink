module.exports = {
    indexView: function(){
        var btn = $('#savebtn'),
            username = $('#username'),
            form = btn.parents('form'),
            errors = $('#errors');

        btn.on('click', function(){
            errors.empty();
            $.ajax({
                type: 'POST',
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