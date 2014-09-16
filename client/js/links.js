var tagify = function () {
    var options = {},
        callback;

    if (_.isObject(arguments[0])) {
        options = arguments[0];
    }

    callback = arguments[arguments.length-1];

    var selector = options.selector || '#tags',
        url = options.url || '/tags';

    $(selector).select2({
        width: '100%',
        tags: [],
        tokenSeparators: [",", " "],
        minimumInputLength: 2,
        initSelection: function (element, callback) {
            var data = [];
            $(element.val().split(",")).each(function () {
                var self = this,
                    tag = this.trim();
                data.push({id: tag, text: tag});
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
            url: url,
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
    if (_.isFunction(callback)) {
        $(selector).on("change", function(element) {
            callback(element);
        });
    }
};

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
            data: data
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
    },

    acceptSuggestion: function (data) {
        return $.ajax({
            dataType: 'json',
            type: 'PUT',
            url: '/suggestions',
            data: _.pick(data, '_id')
        });
    },

    rejectSuggestion: function (data) {
        return $.ajax({
            dataType: 'json',
            type: 'DELETE',
            url: '/suggestions',
            data: _.pick(data, '_id')
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
                tagify(function (element) {
                    links.set('link.tags', element.val);
                });
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
        tagify({selector: '#edit-tags'}, function (element) {
            modal.set('.link.tags', element.val);
        });
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
            links.createLink(event.context.link)
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

module.exports.suggestions = function (l) {

    var suggestions = new Links({
        el: '#links-suggestions',
        template: '#links-suggestions-template',
        data: {
            suggestions: l
        }
    });

    var suggestion_count = require('s7n').suggestions;

    suggestions.on("acceptSuggestion", function (event) {
        event.original.preventDefault();
        suggestions.acceptSuggestion(event.context)
        .then(function (data) {
            suggestions.get('suggestions').splice(event.keypath.split(".").pop(), 1);
            suggestion_count.subtract('suggestions', 1);
        });
    });

    suggestions.on("rejectSuggestion", function (event) {
        event.original.preventDefault();
        suggestions.rejectSuggestion(event.context)
        .then(function (data) {
            suggestions.get('suggestions').splice(event.keypath.split(".").pop(), 1);
            suggestion_count.subtract('suggestions', 1);
        });
    });
};

module.exports.new_from_extensions = function (l) {
    var links = new Links({
        el: '#links-new',
        template: '#links-new-template',
        data: {
            link: l
        }
    });

    links.on('add-or-update', function (event) {
        event.original.preventDefault();

        if (event.context.link._id) {
            links.updateLink(event.context.link)
            .then(function (data) {
                history.go(-1);
            });
        }
        else {
            links.createLink(evente.context.link)
            .then(function (data) {
                history.go(-1);
            });
        }
    });

    tagify(function (element) {
        links.set('link.tags', element.val);
    });
};
