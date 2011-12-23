define(['/webbox/webbox-ns.js', '/webbox/webbox-model.js','/webbox/util.js', '/ui/browser/editorview.js'],
      function(ns,model,utils,editor) {
	  var CollectionView = Backbone.View.extend(
	      {
		  template:$('#collection_template').text(),
		  className:"collection",
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
	  
	  var DefaultLens = Backbone.View.extend(
	      {
		  template:$('#item_template').text(),
		  events: {
		      "click" : "_cb_toggle_visible"  
		  },
		  initialize:function() {
		  },
		  update:function(m) {
		      this.options.model = m;
		      if (this.editor) { this.editor.options.model = m; }
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
		  _cb_toggle_visible:function(evt) {
		      return;
		      // console.log("target ", evt.target, this.el);
		      if (evt.target !== this.el) {
			  return;
		      }
		      if ($(this.el).find('.properties').is(":visible")) {
			  console.log("hiding propreties for ", this.options.model.url());
			  $(this.el).find('.properties').slideUp(); 
		      } else {
			  console.log("showing propreties for ", this.options.model.url());
			  $(this.el).find('.properties').slideDown();
		      }
		  },
		  render:function() {
		      $(this.el).data("view", this);
		      $(this.el).html(
			  _(this.template).template({ m : this._convert_names(this.options.model) })
		      );
		      
		      this.editor = new editor.EditorView({ el:$(this.el).find('.properties')[0], model:this.options.model });
		      console.log('editor attached to ', $(this.el).find('.properties')[0]);
		      this.editor.render();
		      return this.el;
		  }
	      }
	  );
 
	  return {
	      DefaultLens:DefaultLens,
	      CollectionView:CollectionView
	  };
      })

