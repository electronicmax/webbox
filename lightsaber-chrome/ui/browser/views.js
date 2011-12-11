define(['/webbox/webbox-ns.js', '/webbox/webbox-model.js','/webbox/util.js'],
      function(ns,model,utils) {
	  var CollectionView = Backbone.View.extend(
	      {
		  template:$('#collection_template').text(),
		  initialize:function() {
		      this.views = [];
		  },
		  addItemIfNotPresent:function(itemview) {
		      if (this.views.indexOf(itemview) < 0) {
			  $(this.items_dom).append(itemview.render());
			  this.views.push(itemview);
		      }
		  },		  
		  render:function() {
		      $(this.el).html(
			  _(this.template).template(this.options)
		      );
		      this.items_dom = $(this.el).find('.items')[0];
		      this.views.map(function(v) { $(this.items_dom).append(v.render()); });
		      return this.el;
		  }
	      }
	  );
	  
	  var ItemView = Backbone.View.extend(
	      {
		  template:$('#item_template').text(),
		  initialize:function() {
		  },
		  update:function(m) {
		      this.options.model = m;
		      this.render();
		  },
		  _convert_names:function(model) {
		      var n = {};
		      var json = model.toJSON();
		      _(json).keys().map(
			  function(k) {
			      var nk = k;
			      if (k.indexOf('#') > 0) {
				  nk = k.substring(k.indexOf('#') + 1);
			      }
			      n[nk] = json[k];
			  }
		      );
		      n.uri = model.url();
		      return n;
		  },
		  render:function() {
		      $(this.el).data("view", this);
		      $(this.el).html(
			  _(this.template).template({ m : this._convert_names(this.options.model) })
		      );
		      return this.el;
		  }
	      }
	  );
 
	  return {
	      ItemView:ItemView,
	      CollectionView:CollectionView
	  };
      })

