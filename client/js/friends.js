module.exports = {
    indexView: function() {
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
    }
};