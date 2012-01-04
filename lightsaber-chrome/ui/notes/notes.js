define([
           '/webbox/webbox-kb.js',
           '/webbox/webbox-model.js',
           '/ui/lenses/note.js',
           '/webbox/util.js',
	   '/webbox/webbox-ns.js',
           '/webbox/webbox-sync.js'
       ],
      function(wkb, models, notelens, util, ns, ws) {
          
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
                      // $(this.el).find('#notes').sortable({revert:true});
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
			  newn.set2('webbox:contents', v);
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

                  // these two methods are callbacks from the collection
		  _add:function(m) {
		      var this_ = this;
		      var mzuris = this.views.map(function(x) { return x.options.model.uri; });
		      if (mzuris.indexOf(m.uri) < 0) {
			  var v = this.make_view(m);
			  this.views.push(v);			  
			  m.fetch().then(function() {
                                             $(this_.el).find('#notes').append(v.render());
                                             $(v.el).draggable({
                                                                   handle : '.handle',
                                                                   appendTo:'body',
                                                                   helper:'clone'
                                                               });
                                         });
                          
		      } 
		  },
		  _remove:function(m) {
                      // callback from the 
		      var ms = this.views.map(function(x) { return x.options.model; });
		      if (ms.indexOf(m) >= 0) {
			  var v = this.views[ms.indexOf(m)];
			  this.views = _(this.views).without(v);
			  $(v.el).remove();			  
		      }
		  },
		  make_view:function(m) {
		      var this_ = this;
		      var nl = new notelens.Lens({model:m});
		      nl.bind('kill', function() { this_.collection.remove(m);  m.delete()   });
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

          var SheetView = Backbone.View.extend(
              {
                 className:'sheet',
                 initialize:function() {
                     
                 },
                 render:function(appendTo) {
                     var this_ = this;
                     $(appendTo).append(this.el);
                     $(this.el).data('model',this.options.model);
                     $(this.el).data('view',this);
                     this.views = [];
                     // we are a drop target
                     $(this.el).droppable(
                              {
                                  drop:function(el, ui) {
                                      // console.log("drop! add model to sheet ", this_.options.model.uri);
                                      //console.log(" thing being dragged ", $(ui.draggable).data('view'));
                                      this_._add_model_to_sheet($(ui.draggable).data('view').options.model);                                            
                                  }
                              }
                     );
                     return this.el;
                 },
                  _add_model_to_sheet:function(m) {
                      // make a new lens
                      if (this.views[m.uri] !== undefined) { return; }
                      var nl = new notelens.Lens({model:m});
                      this.views[m.uri] = nl;
                      $(this.el).append(nl.render());
                      $(nl.el).draggable({
                                             handle:'.handle',
                                             stop:function(evt,ui) {
                                                 console.log(' dragged to ', evt, ui);
                                             }
                                         }).find('.contents');
                  }                  
              });
          
          
          var SheetController = Backbone.View.extend(
              {
                  events: {
                      'click .new': '_cb_new',
                      'change .sheet_selector': '_cb_switch'
                  },
                  initialize:function() {
                      // populate known sheets
                      var this_ = this;
                      this.sheets = [];
                      wkb.get_objects_of_type('webbox:Sheet').then(
                          function(uris) {
                              this_._populate_sheets(uris.map(function(url) { return models.get_resource(url); }));
                          });                      
                      
                  },
                  _populate_sheets:function(sheet_models) {
                      // create and hook up buttons
                      var this_ = this;
                      var dfds = [];
                      sheet_models.map(function(sm) {
                                           var sm_d = new $.Deferred();
                                           dfds.push(sm_d);
                                           sm.fetch().then(
                                               function() {
                                                   this_._add_option_for_sheet(sm);
                                                   sm_d.resolve();
                                               });
                                       });
                      var d = new $.Deferred();                      
                      $.when.apply($.when,dfds).then(d.resolve);
                      return d.promise();
                  },
                  _add_option_for_sheet:function(sm) {
                      var l = sm.get(ns.expand('rdfs:label'));
                      var selector_buttons = $(this.el).find('.sheet_selector')[0];
                      var t = _("<option value='<%=uri%>'><%= l %></option>").template({uri:sm.uri, l:l});
                      var td =  $(t);
                      td.data('model',sm);
                      $(selector_buttons).append(td);
                      this.sheets[sm.uri] = this._render_sheet_hidden(sm);
                  },
                  _render_sheet_hidden:function(m) {
                      var sv = new SheetView({model:m});
                      var svel = sv.render();
                      $(svel).hide();
                      console.log("appending to sheets ", $(this.el).find('.sheets'), svel);
                      $(this.el).find('.sheets').append(svel);
                      return sv;
                  },                  
                  _cb_new:function() {
                      // let's for now create a sheet and populate
                      var this_ = this;
                      var d = new $.Deferred();
                      wkb.get_objects_of_type('webbox:Sheet').then(
                          function(ms) {
                              var uri = ns.me + 'sheet-'+util.guid();
                              console.log('new sheet uri ', uri);
                              var newr = models.get_resource(ns.me + 'sheet-'+util.guid());                              
                              newr.set2('rdf:type',models.get_resource('webbox:Sheet'));
                              newr.set2('rdfs:label','Sheet ' + ms.length);
                              newr.save().then(function() {
                                                   this_._add_option_for_sheet(newr);
                                                   d.resolve(newr);
                                               });
                          });
                      return d.promise();
                  },
                  _cb_switch:function(evt) {
                      var target = $(evt.currentTarget).find(':selected');                      
                      var uri = target.attr('value');
                      $(this.el).find('.sheets').children(':visible').hide();
                      $(this.sheets[uri].el).show();
                  }
              });
          

	  var nv = new NotesView({ el: $('#main_lhs')[0] });
          var sc = new SheetController({ el: $('#main_rhs')[0] });
          var res = function() {
              console.log('resize ', $(window).width());
              var rhs = $('#main_rhs')[0];
              $(rhs).width( $(window).width() - 430 );              
          };
          $(window).resize(res);
          res();
          
          
	  nv.render();
	  // by default we're the whole set

	  window.nv = nv;
	  window.models = models;
	  window.ns = ns;

	  return {
	      nv : nv
	  };
      });