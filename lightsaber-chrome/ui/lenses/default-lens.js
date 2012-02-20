define([
	   '/webbox/webbox-ns.js',
	   '/webbox/webbox-model.js',
	   '/webbox/util.js',
	   '/lib/text.js!/ui/lenses/collection-template.html',
	   '/lib/text.js!/ui/lenses/toolbar-template.html',	
	   '/lib/text.js!/ui/lenses/default-lens-template.html',
	   '/lib/text.js!/ui/lenses/default-compact-lens.html'
       ],

      function(ns,model,utils,collection_template,toolbar_template,default_lens_template,compact_lens_template) {
	  var ToolbarView = Backbone.View.extend(
	      {
		  template:toolbar_template,
		  className:"item",
		  initialize:function() {
		  },
		  render:function() {
		      $(this.el).html(_(this.template).template({m:this.options.lens.options.model.toJSON()}));
		      $(this.el).find('.main').append(this.options.lens.render());
		      return this.el;
		  }
	      }
	  );
	  var CollectionView = Backbone.View.extend(
	      {
		  template:collection_template,
		  className:"collection",
		  initialize:function() {
		      var this_ = this;
		      this.tbviews = [];
		      this.bind('init_complete',function() { $(this_.el).find('.items').isotope(this_.ISOTOPE_OPTIONS); });
		  },
		  ISOTOPE_OPTIONS:{
		      itemSelector : '.item',
		      layoutMode : 'fitRows'
		  },		  		  
		  addItemIfNotPresent:function(itemview) {
		      if (this.tbviews.map(function(tbv) { return tbv.options.lens; }).indexOf(itemview) < 0) {
			  var tv = new ToolbarView({lens:itemview});
			  $(this.items_dom).append(tv.render());
			  $(this.items_dom).find(".lens").slideDown();
			  this.tbviews.push(tv);
			  itemview.collection = this;
		      }
		  },		  
		  render:function() {
		      $(this.el).html(
			  _(this.template).template(this.options)
		      );
		      this.items_dom = $(this.el).find('.items')[0];
		      this.tbviews.map(function(v) { $(this.items_dom).append(v.render()); });
		      return this.el;
		  },
		  remove:function(itemview) {
		      var matching = this.tbviews.filter(
			  function(tbv) {
			      return tbv.lens == itemview;
			  });
		      matching.map(function(x) {  $(x.el).remove(); });
		      this.tbviews = _().without.apply(_(this.tbviews),[matching]);		      
		  }
	      }
	  );
	  
	  var DefaultLens = Backbone.View.extend(
	      {
		  template:default_lens_template,
		  events: {
		      "click" : "_cb_click"  
		  },
		  className:"itemview lens",
		  initialize:function() {},
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
		  _cb_click:function() {
		      this.trigger('click', this.options.model);
		  },
		  render:function() {
		      $(this.el).html(
			  _(this.template).template({
							uri: this.options.model.uri,
							m : this.options.model.toJSON(),
							ns: ns.expand
						    })
		      );
		      $(this.el).data("view", this);
		      return this.el;
		  },
		  remove:function() {
		      if (this.collection !== undefined) {
			  this.collection.remove(this);
		      }
		      $(this.el).html('');
		  }
	      }
	  );
	  
	  return {
	      DefaultLens:DefaultLens,
	      CollectionView:CollectionView,
	      DefaultCompactLens:DefaultLens.extend({ template:compact_lens_template })
	  };
      })

