define(['/ui/browser/browser.js'],
      function(browser) {
	  window.browser = browser.Browser({el:$("#main")[0]});
	  return {
	      browser:window.browser
	  };
      });