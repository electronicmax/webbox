define(['/web/webbox/webbox-sync.js', '/web/ui/browser/browser.js', '/web/webbox/webbox-kb.js', '/web/webbox/webbox-model.js'],
      function(sync, browser, wkb, models) {
	  // by default we're the whole set
	  var collection = new Backbone.Collection();
	  var b = new browser.Browser( {el:$("#main")[0], models:collection});
	  var check = function() {
	      console.log("checking for new messages ... ");
	      wkb.get_updated_messages().then(
		  function(messages) {
		      console.log("messages >> ", messages);
		      messages.map(function(m) {
				       console.log("received message -- ", m);
				       if (collection.indexOf(m) < 0) {
					   collection.add(m);
				       }
				   });
		      b._populate();
		  });
	  };
	  check();
	  setInterval(function() { check(); }, 10000);
	  window.b = b;
	  b.setup();		  
      	  return {};
      });