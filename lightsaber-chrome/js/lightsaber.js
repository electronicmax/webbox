function _lightsaber() {
    var Lightsaber = Backbone.Model.extend(
        {
            initialize:function(watcher) {
                var this_ = this;
                watcher.bind("changed", function(u) {
                                 console.log("hi oshani! ", u);
                                 this_.changed(u);
                             });
            },
            changed:function(u) {
                // winning starts here.
            }            
        }
    );

    return {
        Lightsaber:Lightsaber
    };        
};
