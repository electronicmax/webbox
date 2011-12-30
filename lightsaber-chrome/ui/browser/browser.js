define(['/webbox/webbox-model.js','/webbox/webbox-ns.js','/webbox/webbox-kb.js','/webbox/util.js','/ui/lenses/default-lens.js','/ui/browser/editor.js'],
      function(models,ns,wkb,util,default_lens,editor,sharer) {
	  var Browser = Backbone.View.extend(
	      {
		  events:{
		      'click .edit': "_cb_edit_clicked",
		      'click .share': "_cb_share_clicked"		      
		  },
		  initialize:function() {
		      var this_ = this;
		      this.items = {};
		      this.collections = {};
		      this.bind('load_start', function() { $('.loader').show(); });
		      this.bind('load_end', function() { $('.loader').hide(); });
		  },
		  setup:function() {
		      // run me after initialize to populate my graphs
		      var this_ = this;
		      this.trigger('load_start');
		      this._populate().then(function() { console.log('done --- '); this_.trigger('load_end'); });
		  },
		  _populate:function() {
		      var this_ = this;
		      var items = this.items;
		      var D = new $.Deferred();		      
		      wkb.get_graphs().then(
			  function(uris) {
			      // update count
			      console.log("GOT ", uris);
			      var s = _("<%= c %> items").template({ c: uris.length });
			      $("#count").html(s);
			      var all_dfds = [];
			      uris.map(function(uri) {
					   var m = models.get_resource(uri);
					   var d = new $.Deferred();
					   all_dfds.push(d);
					   m.fetch().then(
					       function() {
						   var l_D = new $.Deferred();
						   this_._get_lens_for_item(m).then(
						       function(lens) {
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
		  _cb_edit_clicked:function(evt) {
		     // console.log("clicked on ", model);
		     var view = $(evt.currentTarget).parents('.item').find('.lens').data('view');
		     var model = view.options.model;
		     var holder = $(evt.currentTarget).parents('.item').find('.editor_holder');
		     var e = new editor.Editor({model:model, el:holder[0]});
 		     e.show();
		  },
		  _cb_share_clicked:function(evt) {
		     // console.log("clicked on ", model);
		     var view = $(evt.currentTarget).parents('.item').find('.lens').data('view');
		     var model = view.options.model;
		     var holder = $(evt.currentTarget).parents('.item').find('.editor_holder');
		     var e = new sharer.Sharer({model:model, el:holder[0]});
 		     e.show();
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
		  _get_label:function(v) {
		      var d = new $.Deferred();
		      if (!models.is_model(v)) {
			  d.resolve(v.toString());
		      } else {
			  v.fetch().then(function() { d.resolve( v.get(ns.expand('rdfs:label')) ); });			  
		      }
		      return d.promise();			  
		  },
		  _get_collection_for_item:function(model) {
		      var this_ = this;
		      var collections = this.collections;
		      var collection = undefined; 
		      if (this.collection_function !== undefined) {
			  collection = this.collection_function(model);
		      } else {
			  collection = model.get(ns.expand("rdf:type")) ;
		      }		      
		      var d = new $.Deferred();
		      if (!collection) {
			  if (!collections.unknown) {
			      collections.unknown = this.make_collection("Other Things"); 
			  }
			  return d.resolve(collections.unknown);
		      }
		      var collection_id = models.is_model(collection) ? collection.url() : collection.toString();		      
		      if (!collections[collection_id]) {
			  // need to find the label for the collection! 
			  var c = this_.make_collection("");
			  collections[collection_id] = c;
			  this._get_label(collection).then(
			      function(label) {
				  c.options.label = label ? label : collection_id;
				  c.render();		      
				  d.resolve(c);				  
			      });				      			  
		      } else {
			  d.resolve(collections[collection_id]);
		      }		      
		      return d;		      
		  }
	      }
	  );

	  return {
	      Browser:Browser
	  };
      });