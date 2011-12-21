require(
    ['/webbox/webbox-model.js','/webbox/webbox-sync.js', '/webbox/util.js', '/webbox/webbox-config.js', '/webbox/webbox-testing.js','/webbox/webbox-kb.js','/webbox/webbox-ns.js', '/js/window-watcher.js'],
    function(m,sync,util,configbox,tests,wkb,ns,ww) {

	var watcher = new ww.WindowWatcher();	
	watcher.bind("changed", function(x) {
			 if (configbox.config.weblogging == 'true') {
			     console.log("webbox::weblogging :: changed ", x);    
			 }
		     });

	if (configbox.config.page_bookmarking) {
	    chrome.contextMenus.create(
		{
		    type:"normal",
		    title:"Bookmark Page",
		    contexts:["page"],
		    onclick:function(context) {
			try {
			    var model = new m.Model({},ns.webbox + "bookmark-"+((new Date()).valueOf()));
			    model.set2('rdf:type',wkb.resource(ns.expand('webbox:Bookmark')));
			    model.set2('webbox:url',wkb.string(context.pageUrl));
			    model.set2('dc:created',wkb.dateTime(new Date()));
			    model.save();			    			    
			} catch (x) {  console.error(x); }
		    }
		});
	    chrome.contextMenus.create(
		{
		    type:"normal",
		    title:"Save selection",
		    contexts:["selection"],
		    onclick:function(context) {
			try {
			    var model = new m.Model({},ns.webbox + "scrap-"+((new Date()).valueOf()));
			    model.set2('rdf:type', wkb.resource(ns.expand('webbox:Scrap')));
			    model.set2('webbox:url',wkb.string(context.pageUrl));
			    model.set2('webbox:contents', wkb.string(context.selectionText));
			    model.set2('dc:created',wkb.dateTime(new Date()));			
			    model.save();					    
			} catch (x) { console.error(x); }
		    }
		});


	    var bookmarkclass = new m.Model({},ns.expand('webbox:Bookmark'));
	    bookmarkclass.set2(ns.expand('rdfs:label'), wkb.string('Bookmark'));
	    bookmarkclass.save();	    
	    var scrapclass = new m.Model({},ns.expand('webbox:Scrap'));
	    scrapclass.set2(ns.expand('rdfs:label'), wkb.string('Information Scrap'));
	    scrapclass.save();
	}
	
	console.log("Core extnding window .. ");
	_(window).extend({
			     m : m,
			     sync : sync,
			     util : util,
			     wkb : wkb,
			     ns : ns,
			     config:configbox.config,
			     test_webbox : function() {
				  tests.run(); 
			     }
			 });
	return {};
    });
