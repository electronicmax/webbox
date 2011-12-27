// editor
define(['/webbox/webbox-model.js', '/webbox/webbox-ns.js','/webbox/webbox-kb.js','/webbox/util.js',
	'/lib/text.js!/ui/browser/editor-template.html', '/lib/text.js!/ui/browser/editor-row-template.html'],
       function(m,ns,wkb,util,editor_template,row_templ) {
	   var EditorView = Backbone.View.extend(
	       {
		   template:editor_template,
		   events:{
		       'click .save' : "_cb_save",
		       'click .new_row' : "_cb_new_row",
		       'click .del_row' : "_cb_del_row",
		       'click .close' : "_cb_close"
		   },
		   initialize:function() {},
		   show:function() {		       
		       return this.render();		       
		   },
		   render:function() {
		       var model_kv = this.options.model.toJSON();
		       $(this.el).html(_(this.template).template({uri:this.options.model.uri, m:model_kv}));		       
		       var rows_dom = $(this.el).find('.rows');
		       _(model_kv).keys().map(
			   function(k) {
			       var k = k;
			       var v = model_kv[k];
			       rows_dom.append(_(row_templ).template({
									 key:ns.contract(k),
									 val: v.uri ? ns.contract(v.uri) :(v.value ? v.value : v.toString())
								     }));
			   });
		       if ($(this.el).find('.row').length == 0) {
			   // console.log('rows templ ', row_templ, _(row_templ).template);
			   rows_dom.append(_(row_templ).template({key:'',val:''}));
		       }
		       return this.el;		       
		   },
		   guess_type:function(v) {
		       // is it a resource?
		       if (parseInt(v).toString() == v.toString()) {  return parseInt(v);      }
		       if (ns.expand(v) !== v) {  return new m.Model({},ns.expand(v));  }
		       // if ((new Date(v)).toString() !== 'Invalid Date') {  return new Date(v);  }
		       return v;
		   },
		   _cb_save:function() {
		       var this_ = this;
		       var new_vals =  $(this.el).find('.editor_row').map(
			       function() {
				   var k = $(this).find(".key").val().trim();
				   var v = $(this).find(".val").val().trim();
				   // var prop = ns.expand(k,true);
				   return {p:k,v:v};
			       }).filter(function() {
				       return this.p && this.p.length > 0;
				   }).get();
		       this_.options.model.clear();
		       new_vals.map(function(x) { this_.options.model.set2(ns.expand(x.p,true), this_.guess_type(x.v));  });
		       console.log("resulting model >> ", this.options.model.toJSON());
		       this._cb_close();
		       return this.options.model.save();
		   },
		   _cb_new_row:function() {
		       var t = _($('#editor_row_template').html()).template({});
		       $(this.el).find('.rows').append(t);
		   },
		   _cb_del_row:function(evt) {
		       var row = $(evt.currentTarget).parent();
		       console.log("row to delete is ", row);
		       $(row).remove();		       
		   },		   
		   _cb_close:function() {
		       var this_ = this;
		       $(this.el).find('.modal_back').fadeOut("fast", function() {  $(this).remove(); });
		   }
	       });
	   return {
	       Editor:EditorView
	   };	   
       });