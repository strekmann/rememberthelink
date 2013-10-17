module.exports = {
    userListView: function() {
        $('#user_list').on('change', '.active', function (ev) {
            var checked = $(this).is(':checked');
            var user_id = $(this).parents('tr').attr('data-id');
            $.ajax({
                url: '/admin/permissions/' + user_id,
                method: 'PUT',
                dataType: 'json',
                data: {is_active: checked}
            });
        });

        $('#user_list').on('change', '.admin', function (ev) {
            var checked = $(this).is(':checked');
            var user_id = $(this).parents('tr').attr('data-id');
            $.ajax({
                url: '/admin/permissions/' + user_id,
                method: 'PUT',
                dataType: 'json',
                data: {is_admin: checked}
            });
        });
    }
};
