var Links = Ractive.extend({
    data: {
        links: [],
        isodate: function (date) {
            if (date) {
                return moment(date).format();
            }
        },
        shortdate: function (date) {
            if (date) {
                return moment(date).format("LL");
            }
        }
    },

    getTitle: function (data) {
        return $.ajax({
            type: 'GET',
            url: '/title',
            data: {
                url: data.link.url
            }
        });
    },

    createLink: function (data) {
        return $.ajax({
            type: 'POST',
            url: '/',
            data: data.link
        });
    }
});

module.exports.indexView = function (l) {
    var links = new Links({
        el: '#links-index',
        template: '#template',
        data: {
            links: l
        }
    });

    links.on('cancel', function (event) {
        links.set('link', {});
        links.toggle("expanded");
    });

    links.on('addLink', function (event) {
        event.original.preventDefault();
        if (event.context.link && event.context.link.url) {
            links.getTitle(event.context)
            .then(function (data) {
                links.set('link.title', data.title);
                links.toggle('expanded');
            });
        }
    });

    links.on('saveLink', function (event) {
        event.original.preventDefault();
        if (event.context.link && event.context.link.url && event.context.link.title) {
            links.createLink(event.context)
            .then(function (data) {
                links.get('links').unshift(data);
                links.set('link', {});
                links.toggle('expanded');
            });
        }
    });
};
