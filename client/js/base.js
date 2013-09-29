module.exports = {
    indexView: function() {
        var btn = $('.bookmarklet a.fanzybutton');
        btn.on('click', function(){
            return false;
        });
    }
};