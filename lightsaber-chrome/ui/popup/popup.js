define(
    ['/webbox/util.js'],
    function(util) {
	var PopupView = Backbone.View.extend(
	    {
		events: {
		    'click .profile': "open_profile",
		    'click .explorer': "open_browser",		    
		    'click .settings': "open_settings",
		    'click .inbox': "open_inbox",
		    'click .notes': "open_notes"		    
		},
		initialize:function() {
		    
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
		    chrome.windows.create({'url': '/ui/inbox.html', 'type': 'normal'}, function(window) {});
		},
		open_notes:function() {
		    chrome.windows.create({'url': '/ui/notes.html', 'type': 'popup'}, function(window) {});
		}				
	    }
	);
	window.view = new PopupView({el:$("#main")[0]}) ;
	return { view : window.view };
    });