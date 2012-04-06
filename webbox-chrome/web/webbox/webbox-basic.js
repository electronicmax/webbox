define(
    ['/web/webbox/webbox-model.js','/web/webbox/util.js','/web/webbox/webbox-config.js','/web/webbox/webbox-kb.js','/web/webbox/webbox-ns.js'],
    function(m,util,config,wkb,ns) {
	return {
            make_basic_types:function() {
                var bookmarkclass = m.get_resource(ns.expand('webbox:Bookmark'));
	        bookmarkclass.set2('rdfs:label', 'Bookmark');
	        bookmarkclass.set2('webbox:browser_lens', '/web/ui/lenses/bookmark.js');
	        bookmarkclass.save();
                
	        var scrapclass = m.get_resource(ns.expand('webbox:Scrap'));
	        scrapclass.set2('rdfs:label', 'Information Scrap');
	        scrapclass.set2('webbox:browser_lens', '/web/ui/lenses/scrap.js');	    
	        scrapclass.save();
                
	        var mclass = m.get_resource(ns.expand('webbox:WebboxMessage'));
	        mclass.set2('rdfs:label', 'Incoming Message Notifications');
	        mclass.set2('webbox:browser_lens', '/web/ui/lenses/webbox-message.js');	    
	        mclass.save();
                
	        var persons = m.get_resource(ns.expand('foaf:Person'));
	        persons.set2('rdfs:label', 'A Person');
	        persons.set2('webbox:browser_lens', '/web/ui/lenses/person.js');
	        persons.save();	                                
            },
	    make_pageblossom_demo_types:function() {
		var m = m.get_resource('me:mc');
	        m.set2('rdfs:label', ('mc schraefel'));
		m.set2('rdf:type',m.get_resource('webbox:Person'));
	        m.save();
	    }
        };
    });
    
