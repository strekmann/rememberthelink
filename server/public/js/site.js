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
(function($){
    $.fn.s7n = $.fn.s7n || {};

    $.fn.s7n.initLinks = function(options) {
        $('input.private').on('click', function (ev) {
            $(this).parent().parent().find('span.private').toggle();
        });
        $('a.delete').on('click', function (ev) {
            ev.preventDefault();
            var sure = $(this).parent().find('.sure').first();
            sure.show();
            return false;
        });
        $('a.sure').on('click', function (ev) {
            ev.preventDefault();
            var self = $(this);
            var block = $(this).parent().parent();
            var url = block.find('.link .title').first().attr('href');
            block.hide();
            $.ajax({
                method: 'DELETE',
                url: '/delete',
                data: {url: url},
                success: function(data, status, xhr) {
                    if (status !== "success") {
                        alert("Could not delete");
                        self.hide();
                        block.show();
                    }
                }
            });
            return false;
        });
        $('a.reject').on('click', function (ev) {
            ev.preventDefault();
            var self = $(this);
            var block = $(this).parent().parent();
            var url = block.find('.link .title').first().attr('href');
            block.hide();
            $.ajax({
                method: 'DELETE',
                url: 'reject',
                data: {url: url},
                success: function(data, status, xhr) {
                    if (status !== "success") {
                        alert("Could not delete");
                        self.hide();
                        block.show();
                    }
                }
            });
            return false;
        });
        $('a.accept').on('click', function (ev) {
            ev.preventDefault();
            var block = $(this).parent().parent();
            var form = block.find('form').first();
            var link = block.find('.link').first();
            form.show();
            link.hide();
        });
        $('a.edit').on('click', function (ev) {
            ev.preventDefault();
            var block = $(this).parent().parent();
            var form = block.find('form').first();
            var link = block.find('.link').first();
            form.show();
            link.hide();
        });
        $('form.suggestform').on('submit', function (){
            var block = $(this).parent().parent().parent();
            var form = block.find('form').first();
            var link = block.find('.link').first();
            $(form).hide();
            $.ajax({
                method: 'POST',
                url: $(this).attr('action'),
                data: $(this).serialize(),
                success: function(data, status, xhr) {
                    if (status !== "success") {
                        alert("Could not save");
                        form.show();
                        link.hide();
                    }
                }
            });
            return false;
        });

        $('a.cancel_edit').on('click', function (ev) {
            ev.preventDefault();
            var block = $(this).parent().parent().parent();
            var form = block.find('form').first();
            var link = block.find('.link').first();
            $(form).hide();
            $(link).show();
        });
        $('a.share').on('click', function (ev) {
            ev.preventDefault();
            var block = $(this).parent().parent();
            var url = block.find('.link .title').first().attr('href');
            $.ajax({
                method: 'GET',
                url: '/friends/followers',
                success: function(data, status, xhr) {
                    var followers = "";
                    if (status !== "success") {
                        alert("Could not get followers");
                    } else {
                        $.each(data.followers, function(i, follower) {
                            followers += '<form method="post" action="/share"><input type="hidden" name="id" value="' + follower._id + '"><input type="hidden" name="url" value="' + url + '"><button type="submit">' + follower.username + '</button></form>';
                        });
                        block.append('<div class="followers">' + followers + '</div>');
                    }
                }
            });
        });

        $('form.editform').on('submit', function() {
            var form = $(this);
            var block = form.parent();
            var link = block.find('.link').first();
            var title = form.find('input.title').first().val();
            var description = form.find('input.description').first().val();
            var tags = form.find('input.tags').first().val();
            link.find('.title').first().text(title);
            link.find('.description').first().text(description);
            link.find('.tags').first().html(_.reduce(tags.split(','), function(memo, tag) {
                return memo + '<a href="">' + $.trim(tag) + '</a>';
            }, ""));
            form.hide();
            link.show();

            $.ajax({
                method: 'PUT',
                url: $(this).attr('action'),
                data: $(this).serialize(),
                success: function(data, status, xhr) {
                    if (status !== "success") {
                        alert("Could not update");
                        form.show();
                        link.hide();
                    }
                }
            });
            return false;
        });

        $('.friends a.add').on('click', function (ev) {
            ev.preventDefault();
            var addlink = $(this).parent();
            var parent = addlink.parent();
            var username = parent.find('.username').text();
            $.ajax({
                method: 'POST',
                url: $(this).attr('href'),
                data: {'username': username},
                success: function(data, status, xhr) {
                    if (status !== "success") {
                        alert("Could not save");
                    }
                    else {
                        addlink.hide();
                    }
                }
            });
            return false;
        });

    };
}(jQuery));
