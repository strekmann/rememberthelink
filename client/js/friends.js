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
    }
};