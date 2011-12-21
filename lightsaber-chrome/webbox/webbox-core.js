require(
    ['/webbox/webbox-model.js','/webbox/webbox-sync.js', '/webbox/util.js', '/webbox/webbox-config.js', '/webbox/webbox-testing.js','/webbox/webbox-kb.js','/webbox/webbox-ns.js'],
    function(models,sync,util,config,tests,wkb,ns) {
	_(window).extend({
			     m : models,
			     sync : sync,
			     util : util,
			     wkb : wkb,
			     ns : ns,
			     config:config.config,
			     test_webbox : function() {
				  tests.run(); 
			     }
			 });
	return {};
    });
