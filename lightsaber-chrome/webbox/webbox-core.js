require(
    ['/webbox/webbox-model.js','/webbox/webbox-sync.js', '/webbox/util.js', '/webbox/webbox-testing.js'],
    function(models,sync,util,tests) {
	window.m = models;
	window.s = sync;
	window.util = util;
	window.test_webbox = function() { tests.run(); };
	return {};
    });
