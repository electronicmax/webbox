// just a box you can close
define(['/web/webbox/webbox-model.js', '/web/webbox/webbox-ns.js','/web/webbox/webbox-kb.js','/web/webbox/util.js', '/web/lib/text.js!/web/ui/browser/box-template.html'],
       function(m,ns,wkb,util,box_template) {
	   var Box = Backbone.View.extend(
	       {
		   template:box_template,
		   events:{ 'click .close' : "_cb_close" },
		   initialize:function() {
		       var this_ = this;
		   },
		   show:function() { return this.render(); },
		   render:function(child_el) {
		       $(this.el).html(_(this.template).template());
		       if(child_el) { $(this.el).find('.main').append(child_el); }
		       return this.el;		       
		   },
		   _cb_close:function() {
		       this.trigger("close");
		       $(this.el).children().slideUp();
		   }		   
	       });
	   return { Box:Box };	   
       });