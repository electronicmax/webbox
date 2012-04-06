define(
    ["/js/models.js", "/web/webbox/webbox-core.js", "/web/webbox/webbox-ns.js"],
    function(models, webbox, ns) {
	// ns = prefix - ns mappings
	var Lightsaber = Backbone.Model.extend(
	    {
		initialize:function(watcher) {
		    var this_ = this;
		    // communication w/ contentscripts
		    chrome.extension.onRequest.addListener(function(msg,sender,sendResponse) {  sendResponse(this_.dispatchMessage(msg));  });
		    // watch for page changes
		    watcher.bind("changed",
				 function(u) {
				     this_.dispatchMessage("window_changed"); // handle the event ourselves
				     this_._fireEvent("window_changed",u); // notify the content scripts                                 
				 });
		    
		    // add context menu(s)
		    this.cmenu = chrome.contextMenus.create(
			{
			    type: "normal", title:"add annotation", contexts:["selection", "link"],
			    onclick:function(o) {
				// get selected tab
				chrome.windows.getLastFocused(
				    function(win) {
					chrome.tabs.getSelected(win.id, function(tab) {
								    console.log("current ", tab);
								    this_._fireEvent({
											 cmd:"add_annotation",
											 contents: o.selectionText,
											 tab_id: tab.id,
											 url:tab.url,
											 created:new Date().valueOf(),
											 anchor_text:o.selectionText,
											 annotation_type:"sticky"
										     });
								});
				    });                            
			    }
			}, function(o) { } );
		    
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
		    _(ns).keys().map(function(k) { kb = kb.prefix(k,ns[k]); });
		    return kb;
		},
		_fireEvent:function(data) {
		    chrome.windows.getAll({populate:true},
					  function(ws) {
					      ws.map(function(x) {
							 x.tabs.map(function(t) { chrome.tabs.sendRequest(t.id, data); });
						     });
					  });
		},
		dispatchMessage:function(msg) {
		    var this_ = this;
		    var result = undefined;
		    switch(msg.cmd) {
		    case 'load_annotations':
			return this_._match_annotations_for_page(msg.url,msg.text);
		    }                
		    return undefined;
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
	return { Lightsaber:Lightsaber };	    
    });
