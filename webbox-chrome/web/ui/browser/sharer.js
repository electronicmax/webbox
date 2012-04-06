// editor
define(['/web/webbox/webbox-model.js', '/web/webbox/webbox-ns.js','/web/webbox/webbox-kb.js','/web/webbox/util.js','/web/ui/browser/box.js','/web/lib/text.js!/web/ui/browser/share-template.html'],
       function(m,ns,wkb,util,box,template) {
	   return {
	       Sharer: Backbone.View.extend(
	       {
		   template:template,		   
		   events:{
		       'click .save' : "_cb_save",
		       'click .close' : "_cb_close"
		   },
		   initialize:function() {},
		   show:function() { return this.render(); },
                   _enable:function() {
                       this.delegateEvents();
                   },
                   _disable:function() {
                       this.undelegateEvents();
                   },                   
		   render:function() {
		       var main_el = this.$el;
		       main_el.html(_(this.template).template({m:this.options.model,ns:ns}));
		       var shared_addressees = [];
		       if (this.options.model.get(ns.expand("sioc:addressed_to"))) {
			   shared_addressees = $.isArray(this.options.model.get(ns.expand("sioc:addressed_to"))) ?
			       this.options.model.get(ns.expand("sioc:addressed_to")) :
			       [this.options.model.get(ns.expand("sioc:addressed_to"))];
		       }
		       // populate chosen with options
		       var select = $(this.el).find('select')[0];
		       $(select).chosen();		       
		       wkb.get_objects_of_type('foaf:Person').then(
			   function(ps) {
			       ps.map(function(puri) {
					  var p = m.get_resource(puri);
					  p.fetch().then(
					      function() {
						  var option = _('<option value="<%= m.uri %>" <%= selected ? "selected" : ""%>><%= m.get(ns.expand("rdfs:label")) || m.get(ns.expand("foaf:name")) %></option>').template(
						      {
							  ns:ns,
							  m:p,
							  selected:shared_addressees.indexOf(p.uri) >= 0
						      });
						  console.log(option);
						  $(select).append(option);
						  $(select).trigger('liszt:updated');
					      });
				      });
			   });
		       return this.el;		       
		   },
		   _cb_save:function() {
                       this._disable();
		       try {
			   var values = $(this.el).find('select').val() || [];
			   var model = this.options.model;
			   var resources = values.map(function(uri) {
							  console.log("Getting resource ", uri, typeof(uri), m, m.get_resource);
							  return m.get_resource(uri);
						      });
			   model.set2('sioc:addressed_to', resources); 
			   model.save();
                           console.log("ASSERTING SHARING ", model);
                           this._cb_close();
		       } catch (x) {  console.error('ERROR trying to save updated sharing state ', x);  }
		   },		       
		   _cb_close:function() {
		       var this_ = this;
		       $(this_.el).html('');
		       this.trigger('close');
		   }
	       })};
       });
