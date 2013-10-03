require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = {
    indexView: function(){
        var btn = $('#savebtn'),
            username = $('#username'),
            form = btn.parents('form'),
            errors = $('#errors');

        btn.on('click', function(){
            errors.empty();
            $.ajax({
                type: 'POST',
                url: window.location.href,
                data: form.serialize(),
                success: function(data) {
                    if (data.message) {
                        errors.append('<div data-alert class="alert-box success">'+ data.message +'<a href="#" class="close">&times;</a></div>');
                    }

                    if (data.error) {
                        errors.append('<div data-alert class="alert-box alert">'+ data.error +'<a href="#" class="close">&times;</a></div>');
                    }

                    if (data.errors) {
                        var err = '';
                        $.each(data.errors, function(i, error){
                            err += '<div data-alert class="alert-box alert">'+ error.msg +'<a href="#" class="close">&times;</a></div>';
                        });
                        errors.append(err);
                    }
                }
            });
            return false;
        });
    }
};
},{}],2:[function(require,module,exports){
module.exports = {
    indexView: function() {
        var btn = $('.bookmarklet a.fanzybutton');
        btn.on('click', function(){
            return false;
        });
    }
};
},{}],3:[function(require,module,exports){
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
},{}],"1IuhEK":[function(require,module,exports){
module.exports = {
    base: require('./base'),
    account: require('./account'),
    links: require('./links'),
    friends: require('./friends')
};
},{"./account":1,"./base":2,"./friends":3,"./links":5}],5:[function(require,module,exports){
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
        $('ul.links').delegate('a.delete', 'click', function(){
            var sure = $(this).parent().find('.sure').first();
            sure.show();
            return false;
        });

        // comfirm delete
        $('ul.links').delegate('a.sure', 'click', function(){
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
        $('ul.links').delegate('a.share', 'click', function(){
            var link = $(this),
                block = $(this).parents('li'),
                url = block.find('.link .title a').first().attr('href'),
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
                            url: url,
                            followers: data.followers,
                            share_translation: link.data('trans-share')
                        }));

                        block.find("select").select2({width: "element"});
                    }
                }
            });
            return false;
        });


        // -- TODO: use delegate
        $('a.reject').on('click', function (ev) {
            ev.preventDefault();
            var self = $(this);
            var block = $(this).parent().parent();
            var url = block.find('.link .title').first().attr('href');
            block.hide();
            $.ajax({
                method: 'DELETE',
                url: 'reject',
                data: {url: url},
                success: function(data, status, xhr) {
                    if (status !== "success") {
                        alert("Could not delete");
                        self.hide();
                        block.show();
                    }
                }
            });
            return false;
        });

        $('a.accept').on('click', function (ev) {
            ev.preventDefault();
            var block = $(this).parent().parent();
            var form = block.find('form').first();
            var link = block.find('.link').first();
            form.show();
            link.hide();
        });



        $('form.suggestform').on('submit', function (){
            var block = $(this).parent().parent().parent();
            var form = block.find('form').first();
            var link = block.find('.link').first();
            $(form).hide();
            $.ajax({
                method: 'POST',
                url: $(this).attr('action'),
                data: $(this).serialize(),
                success: function(data, status, xhr) {
                    if (status !== "success") {
                        alert("Could not save");
                        form.show();
                        link.hide();
                    }
                }
            });
            return false;
        });


        $('a.cancel_edit').on('click', function (ev) {
            ev.preventDefault();
            var block = $(this).parent().parent().parent();
            var form = block.find('form').first();
            var link = block.find('.link').first();
            $(form).hide();
            $(link).show();
        });


        $('form.editform').on('submit', function() {
            var form = $(this);
            var block = form.parent();
            var link = block.find('.link').first();
            var title = form.find('input.title').first().val();
            var description = form.find('input.description').first().val();
            var tags = form.find('input.tags').first().val();
            link.find('.title').first().text(title);
            link.find('.description').first().text(description);
            link.find('.tags').first().html(_.reduce(tags.split(','), function(memo, tag) {
                return memo + '<a href="">' + $.trim(tag) + '</a>';
            }, ""));
            form.hide();
            link.show();

            $.ajax({
                method: 'PUT',
                url: $(this).attr('action'),
                data: $(this).serialize(),
                success: function(data, status, xhr) {
                    if (status !== "success") {
                        alert("Could not update");
                        form.show();
                        link.hide();
                    }
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

        $('#tags').select2({
            tags: [],
            tokenSeparators: [",", " "]
        });
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
                        return {id: tag, text:tag};
                    })};
                }
            }
        });
    }
};

},{"../templates/sharelink.html":6}],6:[function(require,module,exports){
module.exports = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<form class="followers" method="post" action="/share">\n    <div class="row collapse">\n        <div class="small-10 columns">\n            <input type="hidden" name="url" value="'+
((__t=( url ))==null?'':_.escape(__t))+
'">\n            <select class="" multiple name="id">\n            ';
 _.each( followers, function(follower){ 
__p+='\n                <option value="'+
((__t=( follower._id ))==null?'':_.escape(__t))+
'">'+
((__t=( follower.username ))==null?'':_.escape(__t))+
'</option>\n            ';
 }); 
__p+='\n            </select>\n        </div>\n        <div class="small-2 columns">\n            <button class="button prefix" type="submit">'+
((__t=( share_translation ))==null?'':_.escape(__t))+
'</button>\n        </div>\n    </div>\n</form>';
}
return __p;
};

},{}],"s7n":[function(require,module,exports){
module.exports=require('1IuhEK');
},{}]},{},["1IuhEK"])
;