module.exports = {
    user_list: function() {
        $('#user-list').on('change', '.is_active', function (ev) {
            var box = $(this);
            var checked = box.is(':checked');
            var user_id = box.parents('tr').attr('data-id');
            $.ajax({
                url: '/admin/permissions/' + user_id,
                method: 'PUT',
                dataType: 'json',
                data: {is_active: checked},
                success: function (data) {
                    if (!data.status) {
                        box.prop('checked', !checked);
                    }
                }
            });
        });

        $('#user-list').on('change', '.is_admin', function (ev) {
            var box = $(this);
            var checked = box.is(':checked');
            var user_id = box.parents('tr').attr('data-id');
            $.ajax({
                url: '/admin/permissions/' + user_id,
                method: 'PUT',
                dataType: 'json',
                data: {is_admin: checked},
                success: function (data) {
                    if (!data.status) {
                        box.prop('checked', !checked);
                    }
                }
            });
        });
    }
};
