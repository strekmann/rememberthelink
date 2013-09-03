(function($){
    $.fn.s7n = $.fn.s7n || {};

    $.fn.s7n.initIndex = function(options) {
        var settings = $.extend({
            bookmarkletBtn: '.bookmarklet a.fanzybutton'
        }, options);

        var $btn = $(settings.bookmarkletBtn);

        $btn.on('click', function(){
            return false;
        });

        return this;
    };
}(jQuery));