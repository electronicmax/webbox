define(
    ['/webbox/util.js'],
    function(util) {
	var PopupView = Backbone.View.extend(
	    {
		events: {
		    'click .profile': "open_profile",
		    'click .friends': "open_friends",		    
		    'click .settings': "open_settings"
		},
		initialize:function() {
		    
		},
		open_profile:function() {
		    chrome.windows.create({'url': '/ui/profile.html', 'type': 'normal'}, function(window) {});
		},
		open_friends:function() {
		    chrome.windows.create({'url': '/ui/friends.html', 'type': 'normal'}, function(window) {});
		},		
		open_settings:function() {
		    chrome.windows.create({'url': '/ui/settings.html', 'type': 'normal'}, function(window) {});
		}
	    }
	);
	window.view = new PopupView({el:$("#main")[0]}) ;
	return { view : window.view };
    });