define(['/webbox/webbox-sync.js', '/ui/browser/browser.js'],
      function(sync, browser) {
	  var b = new browser.Browser({el:$("#main")[0]});
	  window.b = b;
	  b.setup();
	  return {
	      browser:b
	  };
      });