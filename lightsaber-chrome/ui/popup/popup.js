define(
    ['/webbox/util.js','/webbox/webbox-model.js','/ui/lenses/popup-inbox.js'],
    function(util,models,pl) {
	var PopupView = Backbone.View.extend(
	    {
		events: {
		    'click .profile': "open_profile",
		    'click .explorer': "open_browser",		    
		    'click .settings': "open_settings",
		    'click .inbox': "open_inbox",
		    'click .notes': "open_notes",
		    'click .book': "open_book"	    		    
		},
		initialize:function() {
		    this.populate_inbox(); // for a test
		},
                populate_inbox:function() {
                    var m = models.get_resource('me:test-inbox-1');
		    m.set2('rdfs:label',"<b>Question</b> : dear jon, I've noticed...");
		    m.set2('rdfs:typename','Information Scrap');
		    m.set2('webbox:received','13:22 yesterday');
		    m.set2('webbox:from','mc schraefel');
                    var l = new pl.Lens({model:m});
		    var d = l.render();
		    // $(d).addClass('selected');		    
                    // m.set2('rdfs:label','Wifi password for Robot Den');
                    // m.set2('rdfs:typename','Information Scrap');
                    // m.set2('webbox:received','13:22 yesterday');
                    // m.set2('webbox:from','Dan Smith');

                    $(this.el).find('.inbox_feed').append(d);

                    m = models.get_resource('me:test-inbox-2');
                    m.set2('rdfs:label','Notes from webbox dev mtg');
                    m.set2('rdfs:typename','Information Scrap');
                    m.set2('webbox:received','17:04 yesterday');
                    m.set2('webbox:from','Dan Smith');
                    l = new pl.Lens({model:m});
                    $(this.el).find('.inbox_feed').append(l.render());

                    m = models.get_resource('me:test-inbox-3');
                    m.set2('rdfs:label','Test infoscrap');
                    m.set2('rdfs:typename','Information Scrap');
                    m.set2('webbox:received','10:32');
                    m.set2('webbox:from','Dan Smith');
                    l = new pl.Lens({model:m});
                    $(this.el).find('.inbox_feed').append(l.render());                    
                    
                },
		open_profile:function() {
		    chrome.windows.create({'url': '/ui/profile.html', 'type': 'normal'}, function(window) {});
		},
		open_browser:function() {
		    chrome.windows.create({'url': '/ui/browser.html', 'type': 'normal'}, function(window) {});
		},		
		open_settings:function() {
		    chrome.windows.create({'url': '/ui/settings.html', 'type': 'normal'}, function(window) {});
		},
		open_inbox:function() {
		    chrome.windows.create({'url': '/ui/popup.html', 'type': 'normal'}, function(window) {});
		},
		open_notes:function() {
		    chrome.windows.create({'url': '/ui/notes.html', 'type': 'popup'}, function(window) {});
		},
		open_book:function() {
		    chrome.windows.create({'url': '/ui/book.html', 'type': 'popup'}, function(window) {});
		}						
	    }
	);
	window.view = new PopupView({el:$("#main")[0]}) ;
	return { view : window.view };
    });