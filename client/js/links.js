function interactivate_tags () {
    $('#tags').select2({
        tags: $('#tags').val().split(', '),
        tokenSeparators: [",", " "],
        minimumInputLength: 2,
        initSelection: function (element, callback) {
            var data = [];
            $(element.val().split(", ")).each(function () {
                data.push({id: this, text: this});
            });
            callback(data);
        },
        createSearchChoice: function(term, data) {
            if ($(data).filter(function() {
                return this.text.localeCompare(term) === 0;
            }).length === 0) {
                return {
                    id: term,
                    text: term
                };
            }
        },
        ajax: {
            url: "/tags",
            dataType: "json",
            quietMillis: 100,
            data: function (term, page) {
                return {
                    q: term
                };
            },
            results: function (data, page) {
                return {results: _.map(data.tags, function(tag) {
                    return {id: tag.text, text: tag.text};
                })};
            }
        }
    });
}

module.exports = {
    indexView: function() {
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
        $('ul.links').on('click', 'a.delete', function(){
            var sure = $(this).parent().find('.sure').first();
            sure.show();
            return false;
        });

        // comfirm delete
        $('ul.links').on('click', 'a.sure', function(){
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
        $('ul.links').on('click', 'a.share', function(){
            var link = $(this),
                block = $(this).parents('li'),
                titleBlock = block.find('.title a').first(),
                url = titleBlock.attr('href'),
                title = titleBlock.text().trim(),
                template = require('../templates/sharelink.html');

            $.ajax({
                method: 'GET',
                url: '/friends/followers',
                success: function(data, status, xhr) {
                    var followers = "";
                    if (status !== "success") {
                        alert("Could not get followers");
                    } else {
                        block.find('form.followers').remove();

                        block.append(template({
                            title: title,
                            url: url,
                            followers: data.followers,
                            share_translation: link.data('trans-share')
                        }));

                        block.find("select").select2({width: "element", placeholder: "User"});
                    }
                }
            });
            return false;
        });


        $('ul.links').on('submit', 'form.suggestform', function (){
            var form = $(this);
            $.ajax({
                method: 'POST',
                url: $(this).attr('action'),
                data: $(this).serialize(),
                success: function(data) {
                    form.remove();
                }
            });
            return false;
        });
    },

    newView: function() {
        $('form.new').on('submit', function(){
            var form = $(this);
            var input = form.find('input').first();

            if (input.val().indexOf("://") === -1) {
                input.val("http://" + input.val());
            }
        });

        interactivate_tags();
    },

    importView: function() {
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
    },

    editView: function() {
        $('button.cancel_edit').on('click', function(){
            history.back();
        });

        interactivate_tags();
    },

    suggestionsView: function() {
        $('ul.links').on('click', 'a.accept', function(ev){
            ev.preventDefault();
            var block = $(this).parents('li');
            var url = block.find('.url').first().text().trim();
            var title = block.find('.title a').text().trim();
            $.ajax({
                method: 'POST',
                url: 'accept',
                data: {url: url, title: title},
                success: function(data) {
                    block.hide();
                }
            });
            return false;
        });

        $('ul.links').on('click', 'a.reject', function (ev) {
            ev.preventDefault();
            var block = $(this).parents('li');
            var url = block.find('.url').first().text().trim();

            $.ajax({
                method: 'DELETE',
                url: 'reject',
                data: {url: url},
                success: function(data) {
                    block.hide();
                }
            });
            return false;
        });
    }
};
