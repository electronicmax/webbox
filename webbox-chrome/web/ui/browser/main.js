define(['/web/webbox/webbox-sync.js', '/web/ui/browser/browser.js', '/web/webbox/webbox-kb.js', '/web/webbox/webbox-model.js'],
      function(sync, browser, wkb, models) {
	  // by default we're the whole set
	  wkb.get_graphs().then(
	      function(uris) {
		  console.log("loading collection ... ", uris.length);
		  var collection = new Backbone.Collection();
		  collection.reset(uris.map(function(uri) { return models.get_resource(uri); }));
		  var b = new browser.Browser( {el:$("#main")[0], models:collection});
		  window.b = b;
		  b.setup();		  
	      });
	  return {};
      });