define(
    [
        '/webbox/webbox-model.js',
        '/webbox/webbox-sync.js',
        '/webbox/util.js',
        '/webbox/webbox-config.js',
        '/webbox/webbox-testing.js',
        '/webbox/webbox-kb.js',
        '/webbox/webbox-ns.js',
        '/js/window-watcher.js',
        '/webbox/webbox-basic.js'
    ],
    function(m,sync,util,configbox,tests,wkb,ns,ww,basic) {
	console.log("Core extnding window .. ");
	_(window).extend({
			     m : m,
			     sync : sync,
			     util : util,
			     wkb : wkb,
			     ns : ns,
			     tests:tests,
			     basic: basic,
			     config:configbox.config,
			     test_webbox : function() {
				  tests.run(); 
			     }
			 });
	return {};
    });
