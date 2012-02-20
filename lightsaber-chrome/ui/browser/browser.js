define(['/webbox/webbox-model.js','/webbox/webbox-ns.js','/webbox/webbox-kb.js','/webbox/util.js','/ui/lenses/default-lens.js','/ui/browser/editor.js',
	'/ui/browser/sharer.js'],
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
		      this._populate().then(function() {
						this_.apply_post_render();
						console.log('done --- '); this_.trigger('load_end');
					    });
		  },
		  apply_post_render:function() {
		      _(this.collections).values().map(function(c) { c.trigger('init_complete'); });
		  },
		  _populate:function() {
		      // todo: rename "_update"
		      var this_ = this;
		      var items = this.items;
		      var D = new $.Deferred();
		      var set = this.options.models;		      
		      var s = _("<%= c %> items").template({ c: set.length });
		      $("#count").html(s);		      
		      var all_dfds = [];
		      set.map(function(m) {
				  var d = new $.Deferred();
				  all_dfds.push(d);
				  m.fetch().then(
				      function() {
					  var l_D = new $.Deferred();
					  if (items[m.uri] == undefined) {
					      this_._get_lens_for_item(m).then(
						  function(lens) {
						      var l = new lens.Lens({model:m});
						      items[m.uri] = l;
						      l_D.resolve(l);
						  });
					      this_._get_collection_for_item(m).then(
						  function(c) {
						      l_D.then(function(lens) {
								   c.addItemIfNotPresent(lens);
								   d.resolve({collection:c, lens:lens});
							       });
						  });						       
					  } else {
					      items[m.uri].update(m);
					      d.resolve({lens:items[m.uri]});
					  }
				      });
			      });
		      // now remove excess guys --
		      _.difference(_(items).keys(), set.map(function(x) { return x.uri; })).map(
			  function(intruder_uri) {
			      items[intruder_uri].remove();
			      delete items[intruder_uri];
			  });
				 
		      $.when.apply($,all_dfds).then(function() { console.log("DONE !"); D.resolve();  });
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
		     var e = new sharer.Sharer({browser:this,model:model,el:holder[0]});
 		     e.show();
		  },
		  make_collection:function(t) {
		      var c = new default_lens.CollectionView({label:t});
		      var el = c.render();
		      $(this.el).find('.collections').append(el);
		      return c;
		  },
		  _get_lens_for_item:function(v) {
		      var d = new $.Deferred();
		      console.assert(models.is_model(v), " Error - " +  v.toString()  + " is not an item. ");
		      var typeclass = v.get(ns.expand("rdf:type"));
		      // if we don't know the class then we just return default lens
		      if (!typeclass || !models.is_model(typeclass)) { 
			  d.resolve({ Lens:default_lens.DefaultCompactLens }); return d.promise();
		      }
		      // now we have typeclass, we just have to load the lens 
		      typeclass.fetch().then(
			  function(tc) {
			      
			      // load 'em
			      window.TC = typeclass;
			      console.log('typeclass ', typeclass.uri, ' ',
					  _(typeclass.attributes).keys().join(':'),
					  typeclass.get('webbox:browser_lens'), typeclass.get('browser_lens'));
			      require(typeclass.get('webbox:browser_lens') ? [typeclass.get('webbox:browser_lens')] : [],
				      function(lensc) {
					  if (!lensc) {
					      console.error("Warning could not load ", typeclass.get('webbox:browser_lens'));
					      return d.resolve({ Lens:default_lens.DefaultCompactLens });
					  }
					  console.log('resolving with ', typeclass.get('webbox:browser_lens'), lensc);
					  d.resolve(lensc);
				      });								 
			  });
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