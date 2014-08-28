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
    },

    deleteLink: function(data){
        return $.ajax({
            dataType: 'json',
            type: 'DELETE',
            url: '/',
            data: _.pick(data, '_id')
        });
    },

    shareLink: function (data) {
        return $.ajax({
            dataType: 'json',
            type: 'POST',
            url: '/suggestions',
            data: data
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
        el: '#edit-modal',
        template: '#edit-modal-template',
        data: {
            print: function(obj){
                return JSON.stringify(obj, null, 2);
            }
        }
    });

    var sharemodal = new Ractive({
        el: '#share-modal',
        template: '#share-modal-template'
    });

    // Share modal section
    sharemodal.on('closeModal', function(event){
        event.original.preventDefault();
        $('#sharemodal').foundation('reveal', 'close');
    });

    sharemodal.on('shareLink', function (event) {
        event.original.preventDefault();

        links.shareLink(event.context.link)
        .then(function (data) {
            links.set('link', {});
            $('#share-modal').foundation('reveal', 'close');
        });
    });

    // Modal section
    modal.on('closeModal', function(event){
        event.original.preventDefault();
        $('#edit-modal').foundation('reveal', 'close');
    });

    modal.on('updateLink', function(event){
        event.original.preventDefault();
        links.updateLink(event.context.link).then(
            function(link){
                links.set(event.context.link.key, link);
                $('#edit-modal').foundation('reveal', 'close');
            },
            function(err){
                modal.set('error', err.responseJSON.error);
            });
    });

    // Links section
    links.on('cancelAddLink', function (event) {
        event.original.preventDefault();
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
            })
            .fail(function(){
                // Failed to fetch title
                links.toggle('expanded');
            });
        }
    });

    links.on('editLink', function(event){
        event.original.preventDefault();
        var link = _.clone(event.context);
        link.key = event.keypath;
        modal.set('link', link);
        modal.set('error', undefined);
        $('#edit-modal').foundation('reveal', 'open');
    });

    links.on('toggleDelete', function(event){
        event.original.preventDefault();
        links.toggle(event.keypath + '.confirmDelete');
    });

    links.on('deleteLink', function(event){
        event.original.preventDefault();
        var parts = event.keypath.split('.'),
            index = parts.pop();

        links.deleteLink(event.context).then(function(){
            links.splice(parts.join('.'), index, 1);
        });
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

    links.on('toggleShareLink', function(event){
        event.original.preventDefault();
        sharemodal.set('link', event.context);
        sharemodal.set('link.to', undefined);
        $('#share-modal').foundation('reveal', 'open');
        $('#share-to').select2({
            width: '100%',
            multiple: true,
            tokenSeparators: [",", " "],
            minimumInputLength: 2,
            ajax: {
                url: "/friends/followers",
                dataType: "json",
                quietMillis: 100,
                data: function (term, page) {
                    return {
                        q: term
                    };
                },
                results: function (data, page) {
                    return {results: _.map(data.followers, function(follower) {
                        return {id: follower._id, text: follower.name};
                    })};
                }
            }
        });
        $('#share-to').on("change", function(e) {
            sharemodal.set('.link.to', e.val);
        });
        setTimeout(function () {
            $('#s2id_share-to input').first().focus();
        }, 500);
    });
};
