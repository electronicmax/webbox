define(
    [
        '/web/webbox/webbox-core.js',
        '/web/webbox/webbox-config.js',
        '/web/webbox/webbox-model.js',
        '/web/webbox/webbox-ns.js',
        '/web/webbox/webbox-kb.js',
        '/web/webbox/webbox-basic.js',
        '/js/window-watcher.js'
    ],
    function(core, configbox, m, ns, kb, basic, windowwatcher) {

	var watcher = new windowwatcher.WindowWatcher();	
	watcher.bind("changed", function(x) {
			 if (configbox.config.weblogging == 'true') {
			     console.log("webbox::weblogging :: changed ", x);    
			 }
		     });

	var getTitle = function() {
	    var d = new $.Deferred();
	    chrome.windows.getLastFocused(
		function(window) {
		    chrome.tabs.getSelected(window.id,function(tab) { d.resolve(tab.title); });
		});
	    return d.promise();
	};        

	// todo :: Move these to lightsaber/annotation module
	if (configbox.config.page_bookmarking) {
	    chrome.contextMenus.create(
		{
		    type:"normal",
		    title:"Bookmark Page",
		    contexts:["page"],
		    onclick:function(context) {
			try {
			    var model = m.get_resource(ns.me + "bookmark-"+((new Date()).valueOf()));
			    model.set2('rdf:type',m.get_resource('webbox:Bookmark'));
			    model.set2('webbox:url',context.pageUrl);
			    model.set2('dc:created',new Date());
			    getTitle().then(
				function(title) {
				    model.set2('dc:title',title);
				    model.set2('rdfs:label',title);
				    model.save();			    			    
				});			    
			} catch (x) {  console.error(x); }
		    }
		});	    
	    chrome.contextMenus.create(
		{
/*
	var ls = new ls.Lightsaber(watcher);	    	    
	// mechanism with which models may issue requeests
	// but since we're alreayd the bk page, we just execute them.
	
	window.backgroundCommand = function(cmd) {
	    var d = new $.Deferred();
	    var ret = ls.dispatch(cmd, undefined); // party.
	    d.resolve(ret);
	    return d;
	};
*/

		    type:"normal",
		    title:"Save selection",
		    contexts:["selection"],
		    onclick:function(context) {			
			var model = m.get_resource(ns.me + "scrap-"+((new Date()).valueOf()));
			model.set2('rdf:type', m.get_resource('webbox:Scrap'));
			model.set2('webbox:url',context.pageUrl);
			model.set2('webbox:contents', context.selectionText.toString());
			model.set2('rdfs:label', context.selectionText.toString());
			model.set2('dc:created',new Date());			
			getTitle().then(function(title) {
				            model.set2('webbox:src_page_title',title);
				            model.save();			    			    
			                });				    
		    }
		});
	}

        console.log("basic is === ", basic);
        basic.make_basic_types();


/*
	var ls = new ls.Lightsaber(watcher);	    	    
	// mechanism with which models may issue requeests
	// but since we're alreayd the bk page, we just execute them.
	
	window.backgroundCommand = function(cmd) {
	    var d = new $.Deferred();
	    var ret = ls.dispatch(cmd, undefined); // party.
	    d.resolve(ret);
	    return d;
	};
*/
        
	
        
	return {};
    });