define(['/webbox/webbox-model.js','/webbox/webbox-ns.js','/webbox/webbox-kb.js','/webbox/util.js', '/ui/lenses/default-lens.js'],
      function(models,ns,wkb,util,default_lens) {
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
			      $('div.collections').roundabout({	 childSelector:'div.collection' });
			  });
		  },
		  _key_rotate:function(evt) {
		     if (evt.keyCode == 37) { // left
			 $(this.el).find('.collections').roundabout_animateToPreviousChild(); 
		     }
		     if (evt.keyCode == 39) { // right
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
						   var l_D = new $.Deferred();
						   this_._get_lens_for_item(m).then(
						       function(lens) {
							   console.log("------------------- lens ---- ", lens.Lens);
							   var l = new lens.Lens({model:m});
							   items[uri] = l;
							   l_D.resolve(l);							   
						       });
						   this_._get_collection_for_item(m).then(
						       function(c) {
							   l_D.then(function(lens) {
									c.addItemIfNotPresent(lens);
									d.resolve({collection:c, lens:lens});
								    });
						       });
					       });
				       });
			      $.when.apply($,all_dfds).then(function() { console.log("DONE !"); D.resolve();  });
			  });
		      return D.promise();
		  },
		  make_collection:function(t) {
		     var c = new default_lens.CollectionView({label:t});
		     $(this.el).find('.collections').append(c.render());
		     return c;
		  },
		  _get_lens_for_item:function(v) {
		      var d = new $.Deferred();
		      if (models.is_model(v)) {
			  var typeclass = v.get(ns.expand("rdf:type"));
			  if (typeclass && models.is_model(typeclass)) {
			      var go_on = function() {
				  var lens = typeclass.get("browser_lens");
				  if (lens !== undefined && typeof(lens) == 'string') {
				      require([lens],
					     function(lensc) {
						 if (lensc) {
						     d.resolve(lensc);
						 } else {
						     d.resolve({ Lens:default_lens.DefaultLens });
						 }
					     });
				  } else {
				      // fall back to default.
				      // console.error('lens :: could not load ', lens, ' falling back to default');				      
				      d.resolve({ Lens:default_lens.DefaultLens });
				  }
			      };
			      // is it ready or do we have to fetch? 
			      if (false && _(typeclass.toJSON()).keys().length > 0) {
				  go_on();
			      } else {
				  typeclass.fetch().then(go_on);
			      }
			  } else {
			      // not a model, so we can resort 
			      d.resolve({ Lens:default_lens.DefaultLens });
			  }
		      }		      
		      return d.promise();
		  },
		  _get_collection_for_item:function(model) {
		      var this_ = this;
		      var collections = this.collections;
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