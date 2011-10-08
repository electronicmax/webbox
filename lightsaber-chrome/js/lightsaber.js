function _lightsaber() {
    var Lightsaber = Backbone.Model.extend(
        {
            initialize:function(watcher) {
                var this_ = this;
                chrome.extension.onConnect.addListener(
                    function(port) {
                        port.onMessage.addListener(function(msg) {
                                                       console.log("on message ", msg);
                                                       this_.dispatch(port,msg);
                                                   });
                    });
                watcher.bind("changed", function(u) {
                                 console.log("hi oshani! ", u);
                                 this_.changed(u);
                             });
            },
            dispatch:function(port,msg) {
                console.log("something from content script ", port, " and it looked like ", msg);
                // how we send back is :
                port.postMessage({question: "hello back"});
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
