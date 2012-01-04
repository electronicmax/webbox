define(
    ['/webbox/webbox-model.js','/webbox/util.js','/webbox/webbox-config.js','/webbox/webbox-kb.js','/webbox/webbox-ns.js'],
    function(m,util,config,wkb,ns) {
	return {
            make_basic_types:function() {
                var bookmarkclass = m.get_resource(ns.expand('webbox:Bookmark'));
	        bookmarkclass.set2('rdfs:label', wkb.string('Bookmark'));
	        bookmarkclass.set2('webbox:browser_lens', wkb.string('/ui/lenses/bookmark.js'));
	        bookmarkclass.save();
                
	        var scrapclass = m.get_resource(ns.expand('webbox:Scrap'));
	        scrapclass.set2('rdfs:label', wkb.string('Information Scrap'));
	        scrapclass.set2('webbox:browser_lens', wkb.string('/ui/lenses/scrap.js'));	    
	        scrapclass.save();
                
	        var mclass = m.get_resource(ns.expand('webbox:WebboxMessage'));
	        mclass.set2('rdfs:label', wkb.string('Incoming Message Notifications'));
	        mclass.set2('webbox:browser_lens', wkb.string('/ui/lenses/webbox-message.js'));	    
	        mclass.save();
                
	        var persons = m.get_resource(ns.expand('foaf:Person'));
	        persons.set2('rdfs:label', 'A Person');
	        persons.set2('webbox:browser_lens', '/ui/lenses/person.js');
	        persons.save();	                                
            }
        };
    });
    
