window.LightSaber = (function () {
    var base = "http://hip.cat/test#";
    var prefixes = {
        'rdf':'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
        'rdfs':'http://www.w3.org/2000/01/rdf-schema#',
        'scovo':"http://purl.org/NET/scovo#",
        'ls':'http://hip.cat/lightsaber#',
        'plum':'http://projects.csail.mit.edu/connectingme/plum#',
        'rww': 'http://www.w3.org/2011/10/12-rww#'
    };                    
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
                           url: "http://localhost/~electronic/annot.rdf",  //"http://users.ecs.soton.ac.uk/mvk/foaf.rdf",
                           type:"GET"
                       }).success(function(doc) {
                                      this_.db = this_._add_prefixes($.rdf().load(doc, {}));
                                      console.log("loaded ", this_.db.databank.tripleStore.length);
                                  });                
            },
            _add_prefixes:function(kb) {
                // add prefixes
                _(prefixes).keys().map(function(k) { kb = kb.prefix(k,prefixes[k]); });
                return kb;
            },
            dispatch:function(port,msg) {
                var this_ = this;
                switch(msg.cmd) {
                    case 'load_annotations':
                    port.postMessage({ cmd: "annotations_loaded", annotations: this_._match_annotations_for_page(msg.url,msg.text) } );
                    break;                    
                };
            },
            _match_annotations_for_page:function(page,text) {

                // first find textual annotations anchored to this page
                var text_annots = this.db.
                    where("?x a ls:TextualPageAnnotation").
                    where("?x ls:source_url <"+page+">").dump();
;
                var refs = {};                    
                var entity_annots = this.db.
                    where("?x a ls:EntityReferenceAnnotation").
                    where("?x ls:src_references ?ref").each(
                        function() {
                            refs[this.ref] = this.src();
                        });


                // then find references that occur in this page
                
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
