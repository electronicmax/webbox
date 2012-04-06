define(
    [
        '/web/webbox/webbox-model.js',
        '/web/webbox/webbox-sync.js',
        '/web/webbox/util.js',
        '/web/webbox/webbox-config.js',
        '/web/webbox/webbox-testing.js',
        '/web/webbox/webbox-kb.js',
        '/web/webbox/webbox-ns.js',
    ],
    function(m,sync,util,configbox,tests,wkb,ns) {
	console.log("Core extnding window .. ");
	_(window).extend({
			     m : m,
			     sync : sync,
			     util : util,
			     wkb : wkb,
			     ns : ns,
			     tests:tests,
			     config:configbox.config,
			     test_webbox : function() {
				  tests.run(); 
			     }
			 });
	return {};
    });
