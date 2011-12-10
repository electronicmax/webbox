require(
    ['/webbox/webbox-model.js','/webbox/webbox-sync.js', '/webbox/util.js', '/webbox/webbox-config.js', '/ui/settings/settings.js','/webbox/webbox-testing.js','/webbox/webbox-kb.js','/webbox/webbox-ns.js'],
    function(models,sync,util,config,settings,tests,wkb,ns) {
	window.m = models;
	window.s = sync;
	window.util = util;
	var user_settings = settings.get_settings();
	if (user_settings) {
	    config.WEBID = user_settings.webid ? user_settings.webid : undefined ;
	    config.ENDPOINT = user_settings.webbox_url ? user_settings.webbox_url : config.ENDPOINT ;	    
	    config.PASSWORD = user_settings.webbox_password ? user_settings.webbox_password : undefined ;
	}
	window.test_webbox = function() { tests.run(); };
	window.tests = tests;
	window.wkb = wkb;
	window.ns = ns;
	return {};
    });
