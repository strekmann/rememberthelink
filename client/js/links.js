(function($){
    $.fn.s7n = $.fn.s7n || {};

    $.fn.s7n.initLinks = function(options) {
        // -- index page
        // new link
        $('form.new').on('submit', function(){
            var form = $(this);
            var input = form.find('input').first();

            // empty field?
            if ($.trim(input.val()) === '') {
                input.addClass('error');
                setTimeout(function(){
                    input.removeClass('error');
                }, 2000);
                return false;
            }

            if (input.val().indexOf("://") === -1) {
                input.val("http://" + input.val());
            }
        });

        // delete link
        $('ul.links').delegate('a.delete', 'click', function(){
            var sure = $(this).parent().find('.sure').first();
            sure.show();
            return false;
        });

        // comfirm delete
        $('ul.links').delegate('a.sure', 'click', function(){
            var self = $(this);
            var block = $(this).parents('li');
            var url = block.find('.link .title a').first().attr('href');
            self.hide();

            $.ajax({
                method: 'DELETE',
                url: '/delete',
                data: {url: url},
                success: function(data, status, xhr) {
                    if (status !== "success") {
                        return alert("Could not delete");
                    }
                    block.remove();
                }
            });
            return false;
        });

        // share link
        $('ul.links').delegate('a.share', 'click', function(){
            var link = $(this),
                block = $(this).parents('li'),
                url = block.find('.link .title a').first().attr('href');

            $.ajax({
                method: 'GET',
                url: '/friends/followers',
                success: function(data, status, xhr) {
                    var followers = "";
                    if (status !== "success") {
                        alert("Could not get followers");
                    } else {
                        $.each(data.followers, function(i, follower) {
                            followers += '<option value="' + follower._id + '">' + follower.username + '</option>';
                        });
                        block.find('form.followers').remove();
                        block.append(
                            '<form class="followers" method="post" action="/share">' +
                                '<div class="row collapse">' +
                                    '<div class="small-10 columns">' +
                                        '<input type="hidden" name="url" value="' + url + '">' +
                                        '<select class="" multiple name="id">' + followers + '</select>' +
                                    '</div>' +
                                    '<div class="small-2 columns">' +
                                        '<button class="button" type="submit">'+ link.data('trans-share') +'</button>' +
                                    '</div>' +
                                '</div>' +
                            '</form>');
                        
                        block.find("select").select2({width: "element"});
                    }
                }
            });
            return false;
        });


        // -- TODO: use delegate
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

    $.fn.s7n.initNewLinks = function(options) {
        $('form.new').on('submit', function(){
            var form = $(this);
            var input = form.find('input').first();

            if (input.val().indexOf("://") === -1) {
                input.val("http://" + input.val());
            }
        });
    };

    $.fn.s7n.initImportLinks = function(options) {
        $('form.import').on('submit', function () {
            $.ajax({
                method: 'POST',
                url : $(this).attr('action'),
                data: $(this).serialize(),
                success: function (data, status, xhr) {
                    if (status !== "success") {
                        alert("Some error");
                    } else {
                        alert("Good!");
                        console.log(data);
                    }
                }
            });
            return false;
        });
    };
}(jQuery));
