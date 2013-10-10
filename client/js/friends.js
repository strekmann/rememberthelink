module.exports = {
    indexView: function() {
        $('.friends a.add').on('click', function (ev) {
            ev.preventDefault();
            var target = $(this),
                parent = $(this).parents('.row'),
                username = parent.find('.username').text().trim();

            console.log(parent, username);

            $.ajax({
                method: 'POST',
                url: $(this).attr('href'),
                data: {'username': username},
                success: function(data) {
                    target.hide();
                    window.location.href = '/friends';
                }
            });
            return false;
        });
    },

    profileView: function() {
        $('ul.links').on('click', 'a.grab', function(){
            var link = $(this),
                block = $(this).parents('li'),
                titleBlock = block.find('.title a').first(),
                url = titleBlock.attr('href'),
                title = titleBlock.text().trim();
            $.ajax({
                method: 'POST',
                url: '/accept',
                data: {url: url, title: title},
                success: function(data) {
                    block.hide();
                }
            });
            return false;
        });
    }
};
