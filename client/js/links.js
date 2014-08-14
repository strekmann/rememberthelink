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
            dataType: 'json',
            type: 'GET',
            url: '/title',
            data: {
                url: data.link.url
            }
        });
    },

    createLink: function (data) {
        return $.ajax({
            dataType: 'json',
            type: 'POST',
            url: '/',
            data: data.link
        });
    },

    updateLink: function(data){
        return $.ajax({
            dataType: 'json',
            type: 'PUT',
            url: '/',
            data: _.pick(data, '_id', 'title', 'description', 'tags')
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

    var modal = new Ractive({
        el: '#modal',
        template: '#modal-template',
        data: {
            print: function(obj){
                return JSON.stringify(obj, null, 2);
            }
        }
    });

    // Modal section
    modal.on('closeModal', function(event){
        event.original.preventDefault();
        $('#modal').foundation('reveal', 'close');
    });

    modal.on('updateLink', function(event){
        event.original.preventDefault();
        links.updateLink(event.context.link).then(
            function(link){
                links.set(event.context.link.key, link);
                $('#modal').foundation('reveal', 'close');
            },
            function(err){
                modal.set('error', err.responseJSON.error);
            });
    });

    // Links section
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

    links.on('edit', function(event){
        var link = _.clone(event.context);
        link.key = event.keypath;
        modal.set('link', link);
        modal.set('error', undefined);
        $('#modal').foundation('reveal', 'open');
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
