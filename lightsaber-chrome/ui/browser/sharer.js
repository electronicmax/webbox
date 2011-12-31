// editor
define(['/webbox/webbox-model.js', '/webbox/webbox-ns.js','/webbox/webbox-kb.js','/webbox/util.js','/ui/browser/box.js','/lib/text.js!/ui/browser/share-template.html'],
       function(m,ns,wkb,util,box,template) {
	   return {
	       Sharer: Backbone.View.extend(
	       {
		   template:template,
		   events:{  'click .ok' : "_cb_save"  },
		   initialize:function() {
		       var this_ = this;
		       this.box = new box.Box({el:this.el});
		       this.box.bind("close", function() { this_._cb_save(); });
		   },
		   show:function() {
		       return this.render();
		   },
		   render:function() {
		       var main_el = $(this.box.render()).find('.main');
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
						  console.log("foo ", p.toJSON());
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
		   },
		   _cb_save:function() {
		       try {
			   var values = $(this.el).find('select').val() || [];
			   var model = this.options.model;
			   var resources = values.map(function(uri) {
							  console.log("Getting resource ", uri, typeof(uri), m, m.get_resource);
							  return m.get_resource(uri);
						      });
			   model.set2('sioc:addressed_to', resources); 
			   model.save();
		       } catch (x) {  console.error('ERROR trying to save updated sharing state ', x);  }
		   },		       
		   _cb_close:function() {
		       var this_ = this;
		       $(this_.el).html('');
		   }
	       })};
       });

		       /*
		       var this_ = this;
		       // populate people who are already being shared with
		       var sharees = $(main_el).find('.peeps');
		       if (this.options.model.get(ns.expand("sioc:addressed_to"))) {
			   this.options.model.get(ns.expand("sioc:addressed_to")).map(
			       function(p) {
				   p.fetch().then(
				       function() {	
					   this_.options.browser._get_lens_for_item(m).then(
					       function(lens) {
						   var l = new lens.Lens({model:m});
						   sharees.append(l.render());
					       });			       
				       });
			       });
		       }
			*/

