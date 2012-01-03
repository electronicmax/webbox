define(['/webbox/webbox-sync.js', '/ui/browser/browser.js', '/webbox/webbox-kb.js', '/webbox/webbox-model.js', '/ui/lenses/note.js', '/webbox/util.js',
	'/webbox/webbox-ns.js'],
      function(sync, browser, wkb, models, notelens, util, ns) {

	  

	  var NotesCollection = Backbone.Collection.extend(
	      {
		  fetch:function() {
		      var this_ = this;
		      var d = new $.Deferred();
		      wkb.get_objects_of_type('webbox:Scrap').then(
			  function(note_uris) {
			      var ds = [];
			      note_uris.map(function(uri) {
						var r = models.get_resource(uri);
						if (this_.models.indexOf(r) < 0) {
						    console.log("NOT there, so adding");
						    this_.add(r);
						    var _d = new $.Deferred();
						    ds.push(_d);
						    r.fetch().then(_d.resolve);						    
						}						
					    });
			      // get rid of notes we haven't heard about
			      var to_remove = this_.models.filter(function(x) {	return note_uris.indexOf(x.uri) < 0; });
			      to_remove.map(function(trm) { this_.remove(trm); });
			      $.when.apply($.when, ds).then(function() { d.resolve(this_.models); });			      
			  });
		      return d.promise();
		  }							      
	      });

	  var NotesView = Backbone.View.extend(
	      {
		  events: {
		      'keyup .input': '_cb_search',
		      'keyup .contents': '_cb_edit'
		  },
		  initialize:function() {
		      var this_ = this;
		      this.views = [];
		      this.collection = new NotesCollection();
		      this.collection.bind('add', function(x) {
					       console.log('got an add for ', x);
					       if (this_.get_filter()(x)) { this_._add(x);  }
					   });
		      this.collection.bind('remove', function(x) {
					       console.log('got a remove for ', x);
					       this_._remove(x);
					   });

		      this.collection.fetch().then(function() { this_.render(); });
		  },
		  get_filter:function() {
		      return this._filter || function() { return true; };
		  },
		  set_filter:function(f) {
		      this._filter = f;
		  },
		  _clear_input:function() {
		      $(this.el).find('.input').html('');
		  },
		  _cb_edit:function(evt) {
		      var contents = $(evt.currentTarget).html().trim();
		      var view = $(evt.currentTarget).parent().data("view");
		      var m = view.options.model;
		      m.set2('webbox:contents', contents.trim());
		      m.save();
		      console.log("saving ... ", m.uri, contents);
		  },
		  _cb_search:function(evt) {
		      var this_ = this;
		      var v = $('.input').text();		      
		      console.log("evt keycode ", evt.keyCode);
		      if (evt.keyCode == 13) {
			  console.log("new note!! ", v);
			  // make a new note
			  var newn = new models.Model({},ns.expand('me:note-'+util.guid()));
			  newn.set2('rdf:type', models.get_resource('webbox:Scrap'));			  
			  newn.set2('dc:created', wkb.dateTime(new Date()));
			  newn.set2('webbox:contents', wkb.string(v));
			  this_._clear_input();
			  delete this_._filter;			  
			  newn.save().then(function() {
					       this_.collection.fetch().then(
						   function() {
						       this_.render();						       
						   });					       
					   });
			  return;
		      }
		      if (v.length > 0) {
			  // set a filter
			  this.set_filter(function(m) {
					      // textual filter
					      var contents = m.get(ns.expand('webbox:contents'));
					      return contents !== undefined && contents.indexOf(v) >= 0;
					  });			  
		      } else {
			  console.log('clearing filter');
			  delete this._filter;
		      }
		      // now update with render
		      this.render();
		  },
		  _add:function(m) {
		      var this_ = this;
		      var mzuris = this.views.map(function(x) { return x.options.model.uri; });
		      if (mzuris.indexOf(m.uri) < 0) {
			  var v = this.make_view(m);
			  this.views.push(v);			  
			  m.fetch().then(function() { $(this_.el).find('#notes').append(v.render());	 });
		      } 
		  },
		  _remove:function(m) {
		      var models = this.views.map(function(x) { return x.options.model; });
		      if (models.indexOf(m) >= 0) {
			  var v = this.views[models.indexOf(m)];
			  this.views = _(this.views).without(v);
			  $(v.el).remove();			  
		      }
		  },
		  make_view:function(m) {
		      var this_ = this;
		      var nl = new notelens.Lens({model:m});
		      nl.bind('kill', function() {
				  this_.collection.remove(m);
				  m.delete();
			      });
		      return nl;
		  },
		  render:function() {
		      var this_ = this;
		      this_.collection.map(
			  function(x) {
			      if (this_.get_filter()(x)) {  this_._add(x);  } else {  this_._remove(x);     }
			  });
		  }
	      });


	  var nv = new NotesView({ el: $('body')[0] });
	  nv.render();
	  // by default we're the whole set

	  window.nv = nv;
	  window.models = models;
	  window.ns = ns;

	  return {
	      nv : nv
	  };
      });