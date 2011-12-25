define(['/webbox/webbox-ns.js', '/webbox/webbox-model.js','/webbox/util.js',
	'/lib/text.js!/ui/lenses/collection-template.html',
	'/lib/text.js!/ui/lenses/toolbar-template.html',	
	'/lib/text.js!/ui/lenses/default-lens-template.html'],

      function(ns,model,utils,collection_template,toolbar_template,default_lens_template) {

	  var ToolbarView = Backbone.View.extend(
	      {
		  template:toolbar_template,
		  className:"item",
		  events:{
		      'click .edit': '_cb_edit'
		  },
		  initialize:function() {
		  },
		  render:function() {
		      $(this.el).html(_(this.template).template({m:this.options.lens.options.model.toJSON()}));
		      $(this.el).find('.main').append(this.options.lens.render());
		      return this.el;
		  },
		  _cb_edit:function() {
		      var this_ = this;
		      this.trigger('edit', function() { this_.options.lens.trigger('edit',this_.options.lens.options.model); });
		  }
	      }
	  );

	  var CollectionView = Backbone.View.extend(
	      {
		  template:collection_template,
		  className:"collection",
		  initialize:function() {
		      this.views = [];
		  },
		  addItemIfNotPresent:function(itemview) {
		      if (this.views.indexOf(itemview) < 0) {
			  var tv = new ToolbarView({lens:itemview});
			  $(this.items_dom).append(tv.render());
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
	  
	  var DefaultLens = Backbone.View.extend(
	      {
		  template:default_lens_template,
		  events: {
		      "click" : "_cb_click"  
		  },
		  className:"itemview lens",
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
		  _cb_click:function() {
		      this.trigger('click', this.options.model);
		  },
		  render:function() {
		      $(this.el).html(
			  _(this.template).template({ m : this._convert_names(this.options.model) })
		      );
		      $(this.el).data("view", this);
		      return this.el;
		  }
	      }
	  );
 
	  return {
	      DefaultLens:DefaultLens,
	      CollectionView:CollectionView
	  };
      })

