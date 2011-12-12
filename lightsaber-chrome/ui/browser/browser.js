define(['/webbox/webbox-model.js','/webbox/webbox-ns.js','/webbox/webbox-kb.js','/webbox/util.js', '/ui/browser/views.js'],
      function(models,ns,wkb,util,views) {

	  var Browser = Backbone.View.extend(
	      {
		  initialize:function() {
		      var this_ = this;
		      this.items = {};
		      this.collections = {};
		      // set up count display etc
		      $(window).keyup(function(evt) { this_._key_rotate(evt); });
		  },
		  setup:function() {
		      // run me after initialize to populate my graphs
		      this._populate().then(
			  function() {
			      console.log("applying roundabout-------------- ", $('div.collections'));
			      $('div.collections').roundabout({	 childSelector:'div.collection' });

			  });
		  },
		  _key_rotate:function(evt) {
		      console.log("key up");
		     if (evt.keyCode == 37) { // left
			 console.log("left!");
			 $(this.el).find('.collections').roundabout_animateToPreviousChild(); 
		     }
		     if (evt.keyCode == 39) { // right
			 console.log("right!");
			 $(this.el).find('.collections').roundabout_animateToNextChild(); 
		     }
		  },		  
		  _populate:function() {
		      var this_ = this;
		      var items = this.items;
		      var D = new $.Deferred();		      
		      wkb.get_graphs().then(
			  function(uris) {
			      // update count
			      var s = _("<%= c %> items").template({ c: uris.length });
			      console.log(" updating count ", s, $("#count").length);
			      $("#count").html(s);
			      var all_dfds = [];
			      uris.map(function(uri) {
					   var m = new models.Model({},uri);
					   var d = new $.Deferred();
					   all_dfds.push(d);
					   m.fetch().then(
					       function() {
						   var itemview = items[uri];
						   if (itemview) {
						       itemview.update(m);
						   } else {
						       itemview = new views.ItemView({model:m});
						       items[uri] = itemview;
						   }
						   var c = this_._get_collection_for_item(itemview).then(
						       function(c) {
							   c.addItemIfNotPresent(itemview);						   
							   d.resolve();	//
							   console.log("resolving " , c);
						       });
					       });
				       });
			      $.when.apply($,all_dfds).then(function() { console.log("DONE !"); D.resolve();  });
			  });
		      return D.promise();
		  },
		  make_collection:function(t) {
		      var c = new views.CollectionView({label:t});
		      $(this.el).find('.collections').append(c.render());
		      return c;
		  },
		  _get_collection_for_item:function(v) {
		      var this_ = this;
		      var collections = this.collections;
		      var model = v.options.model;
		      var type = model.get(ns.expand("rdf:type")) && model.get(ns.expand("rdf:type")).url ?
			  model.get(ns.expand("rdf:type")).url() : undefined;
		      var d = new $.Deferred();
		      if (!type) {
			  if (!collections.unknown) {
			      collections.unknown = this.make_collection("Other Things"); 
			  }
			  return d.resolve(collections.unknown);
		      }		      
		      if (!collections[type]) {
			  // need to find the name of the class/type!
			  var c = this_.make_collection("");
			  collections[type] = c;
			  wkb.get_sp_object(type,"rdfs:label").then(
			      function(labels) {
				  if (labels.length > 0) {
				      c.options.label = labels[0];
				      c.render();
				  }
			      });
			  d.resolve(c);				      			  
		      } else {
			  d.resolve(collections[type]);
		      }		      
		      return d;		      
		  }
	      }
	  );

	  return {
	      Browser:Browser
	  };
      });