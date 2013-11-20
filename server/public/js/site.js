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
                type: 'PUT',
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
},{}],"2w5x2s":[function(require,module,exports){
module.exports = {
    account: require('./account'),
};

},{"./account":1}],"s7n":[function(require,module,exports){
module.exports=require('2w5x2s');
},{}]},{},["2w5x2s"])
;