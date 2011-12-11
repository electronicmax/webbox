define(['/webbox/webbox-sync.js', '/ui/browser/browser.js'],
      function(sync, browser) {
	  var browser = new browser.Browser({el:$("#main")[0]});
	  window.b = browser;
	  b._populate();
	  return {
	      browser:window.browser
	  };
      });