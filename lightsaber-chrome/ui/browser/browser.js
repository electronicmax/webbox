define(['/webbox/webbox-models.js','/webbox/webbox-ns.js','/webbox/webbox-kb.js','/webbox/utils.js', '/ui/browser/views.js'],
      function(models,ns,wkb,util,views) {

	  var Browser = Backbone.View.extend(
	      {
		  initialize:function() {
		      this.items = {};
		      this.collections = {};
		  },
		  setup:function() {
		      // run me after initialize to populate my graphs
		      var gi_dfd = this._populate();
		  },
		  _populate:function() {
		      var items = this.items;
		      var all_dfds = [];
		      wkb.get_graphs(function(uris) {
					 uris.map(function(uri) {
						      var m = models.Model({},uri);
						      var d = new $.Deferred();
						      all_dfds.push(d);
						      m.fetch().then(
							  function() {
							      d.resolve();
							      var v = new views.ItemView({model:m});
							      var c = this_._get_collection_for_item(v);
							      items[uri] = v;
							  });
						  });
				     });
		      var D = new $.Deferred();
		      $.when.apply($,all_dfds).then(D.resolve);
		      return D.promise();
		  },
		  _get_collection_for_item:function(v) {		      
		      var collections = this.collections;
		      var model = v.options.model;
		      var type = model.get("_type") || model.get("rdf:type");
		      var d = new $.Deferred();
		      if (!type) {
			  if (!collections.unknown) {
			      collections.unknown = new views.CollectionView({title:"Unknown"});
			  }
			  return d.resolve(collections.unknown);
		      }		      
		      if (!collections[type]) {
			  // need to find the name of the class/type!
			  wkb.query_value(type,"rdfs:label").then(
			      function(label) {
				  collections[type] = new views.CollectionView({title:label,type:type});
				  d.resolve(collections[type]);
			      });
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