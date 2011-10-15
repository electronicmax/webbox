window.LightSaber = (function () {
    var Lightsaber = Backbone.Model.extend(
        {
            initialize:function(watcher) {
                var this_ = this;
                this.ports = [];
                // communication w/ contentscripts
                chrome.extension.onConnect.addListener(
                    function(port) {
                        this_.ports.push(port);
                        port.onMessage.addListener(function(msg) {
                                                       console.log("on message ", msg);
                                                       this_.dispatch(port,msg);
                                                   });
                    });

                // watch for page changes
                watcher.bind("changed", function(u) {  this_.changed(u);     });
                this.annotator = new LightSaber.Annotroller();
                this.load_db();
            },
            load_db:function() {
                var this_ = this;
                $.ajax({
                           // replace this with path to our server ----
                           url: "http://users.ecs.soton.ac.uk/mvk/foaf.rdf",
                           type:"GET"
                       }).success(function(doc) {
                                      console.log("got doc ", doc);
                                      this_.db = $.rdf().load(doc, {});
                                      console.log("loaded ",this_.db);
                                  });
            },
            dispatch:function(port,msg) {
                var this_ = this;
                switch(msg.cmd) {
                    case 'load_annotations':
                    port.postMessage({ cmd: "annotations_loaded", annotations: this_._match_annotations_for_text(msg.text) } );
                    break;                    
                };
            },
            _match_annotations_for_text:function(text) {
                var anns = [
                    { id: 2123, key: "foo", text : "foodkfjdfkjdfk" },
                    { id: 12389, key: "library", text: "library0293" }
                ];
                text = text.toLowerCase();
                var results = anns.filter(function(k) {  return text.indexOf(k.key) >= 0;  });
                console.log("Sending back ", results);
                return results;
            },
            changed:function(u) {
                // winning starts here.
            }            
        }
    );
    return {
        Lightsaber:Lightsaber
    };        
})();
