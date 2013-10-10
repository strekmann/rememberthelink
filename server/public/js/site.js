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
},{}],"Dk0A7s":[function(require,module,exports){
module.exports = {
    base: require('./base'),
    account: require('./account'),
    links: require('./links'),
    friends: require('./friends')
};
},{"./account":1,"./base":2,"./friends":3,"./links":6}],"s7n":[function(require,module,exports){
module.exports=require('Dk0A7s');
},{}],6:[function(require,module,exports){
function interactivate_tags () {
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
                    return {id: tag.text, text: tag.text};
                })};
            }
        }
    });
}

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
        $('ul.links').on('click', 'a.delete', function(){
            var sure = $(this).parent().find('.sure').first();
            sure.show();
            return false;
        });

        // comfirm delete
        $('ul.links').on('click', 'a.sure', function(){
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
        $('ul.links').on('click', 'a.share', function(){
            var link = $(this),
                block = $(this).parents('li'),
                titleBlock = block.find('.title a').first(),
                url = titleBlock.attr('href'),
                title = titleBlock.text().trim(),
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
                            title: title,
                            url: url,
                            followers: data.followers,
                            share_translation: link.data('trans-share')
                        }));

                        block.find("select").select2({width: "element", placeholder: "User"});
                    }
                }
            });
            return false;
        });


        $('ul.links').on('submit', 'form.suggestform', function (){
            var form = $(this);
            $.ajax({
                method: 'POST',
                url: $(this).attr('action'),
                data: $(this).serialize(),
                success: function(data) {
                    form.remove();
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

        interactivate_tags();
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

        interactivate_tags();
    },

    suggestionsView: function() {
        $('ul.links').on('click', 'a.accept', function(ev){
            ev.preventDefault();
            var block = $(this).parents('li');
            var url = block.find('.url').first().text().trim();
            var title = block.find('.title a').text().trim();
            $.ajax({
                method: 'POST',
                url: 'accept',
                data: {url: url, title: title},
                success: function(data) {
                    block.hide();
                }
            });
            return false;
        });

        $('ul.links').on('click', 'a.reject', function (ev) {
            ev.preventDefault();
            var block = $(this).parents('li');
            var url = block.find('.url').first().text().trim();

            $.ajax({
                method: 'DELETE',
                url: 'reject',
                data: {url: url},
                success: function(data) {
                    block.hide();
                }
            });
            return false;
        });
    }
};

},{"../templates/sharelink.html":7}],7:[function(require,module,exports){
module.exports = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<form class="suggestform" method="post" action="/share">\n    <div class="row collapse">\n        <div class="small-10 columns">\n            <input type="hidden" name="url" value="'+
((__t=( url ))==null?'':_.escape(__t))+
'">\n            <input type="hidden" name="title" value="'+
((__t=( title ))==null?'':_.escape(__t))+
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
'</button>\n        </div>\n    </div>\n    <div class="row collapse">\n        <div class="small-10 columns">\n            <input type="text" name="description" placeholder="Message">\n        </div>\n    </div>\n</form>';
}
return __p;
};

},{}]},{},["Dk0A7s"])
;