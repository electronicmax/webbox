define([
           '/web/webbox/webbox-kb.js',
           '/web/webbox/webbox-model.js',
           '/web/ui/lenses/note.js',
           '/web/webbox/util.js',
	   '/web/webbox/webbox-ns.js',
           '/web/webbox/webbox-sync.js'
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
		      'keyup .input': '_cb_search'
		  },
		  initialize:function() {
		      var this_ = this;
		      this.views = [];
		      this.collection = new NotesCollection();
		      this.collection.bind('add', function(x) {
					       // console.log('got an add for ', x);
					       if (this_.get_filter()(x)) { this_._add(x);  }
					   });
		      this.collection.bind('remove', function(x) {
					       // console.log('got a remove for ', x);
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
		  _cb_search:function(evt) {
		      var this_ = this;
		      var v = $('.input').text();		      
		      if (evt.keyCode == 13) {
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
					      var contents = m.get('webbox:contents');
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
                          m.bind('change', function(evt) {
                                     console.log(" CHANGE event ", evt );
                                     // v.render();
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
 
                                      console.log('ui position x:', ui.position.left, ' y:', ui.position.top);
                                      console.log('ui offset x:', ui.offset.left, ' y:', ui.offset.top);
                                      
                                      console.log('el position x:', $(this_.el).position().left, ' y:', $(this_.el).position().top);
                                      console.log('el offset x:', $(this_.el).offset().left, ' y:', $(this_.el).offset().top);      
                                      this_._add_model_to_sheet($(ui.draggable).data('view').options.model,
                                                                {
                                                                    left : ui.position.left - $(this_.el).offset().left,
                                                                    top:  ui.position.top - $(this_.el).offset().top
                                                                });
                                  }
                              }
                     );
                     return this.el;
                 },
                  _add_model_to_sheet:function(m, position) {
                      // make a new lens
                      if (this.views[m.uri] !== undefined) { return; }
		      console.log("Adding model to sheet ", m.get("webbox:contents"));
                      var nl = new notelens.Lens({model:m});
		      nl.bind('kill', function() {
				  this_.$el.remove(nl.el);
				  delete this_.views[m.uri];
			      });		      
                      nl.setPosition(position);
                      this.views[m.uri] = nl;
                      this.$el.append(nl.render());
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
                      this.sheets = {};
                      wkb.get_objects_of_type('webbox:Sheet').then(
                          function(uris) {
                              this_._populate_sheets(uris.map(function(url) {
                                                                  return models.get_resource(url);
                                                              })).then(
                                  function() {
                                      // done populating, let's select one
                                      console.log('this sheets is ', this_.sheets);
                                      this_.set_selected_sheet(_(this_.sheets).values()[0]);
                                  });
                          });
                     console.log("ADDING droppable handler to ", $(this.el).find('.plotify'));
                     $(this.el).find('.plotify').droppable(
                         {
                             tolerance:'touch',
                             drop:function(el,ui) {
                                 var m = $(ui.draggable).data('view').options.model;
                                 var v = $(ui.draggable).data('view');
                                 var update_plot = function() {
                                     // try to parse out the first line
                                     console.log(" PARSING OUT ", m.get('webbox:contents'));
                                     var valstext = m.get('webbox:contents');
                                     valstext = valstext.value ? valstext.value : valstext;
                                     var vals = parse_values(valstext);
                                     console.log(" resulting vals ", vals);
                                     if ($(v.el).find('.extras').find('.plot').length > 0) {
                                         $(v.el).find('.extras').find('.plot').remove();
                                     }
                                     var a = $("<div class='plot'></div>").appendTo(  $(v.el).find('.extras') );
                                     a.height(200);
                                     a = $(v.el).find('.plot');
                                     $.plot(a, vals);
                                 };
                                 m.bind('change', update_plot);
                                 update_plot();
                                 $(v.el).css("top", 10);
                                 $(v.el).css("left", 10);
                             }
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
                      var sheet = this._make_sheet(sm);
                      console.log('sheet >> ', sheet, sm.uri);
                      this.sheets[sm.uri] = sheet;
                  },
                  _make_sheet:function(m) {
                      var sv = new SheetView({model:m});
                      var svel = sv.render();
                      $(svel).hide();
                      // console.log("appending to sheets ", $(this.el).find('.sheets'), svel);
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
                              // console.log('new sheet uri ', uri);
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
                  set_selected_sheet:function(sheet) {
                      $(this.el).find('.sheets').children(':visible').hide();
                      $(sheet.el).show();
                  },
                  _cb_switch:function(evt) {
                      var target = $(evt.currentTarget).find(':selected');                      
                      var uri = target.attr('value');
                      this.set_selected_sheet(this.sheets[uri]);
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

	  // pidgin parser
          var parse_values = function(s) {
              return s.split('\n').map(
		  function(line) {
                      if (line.split(':').length == 2 && line.split(',').length >= 2 && line.indexOf(':') < line.indexOf(',')) {
                          var series = line.substring(0,line.indexOf(':'));
                          var datas = line.substring(line.indexOf(':')+1).split(',').
                              map(function(x) { return parseFloat(x.trim()); }).
                              filter(function(x) { return !isNaN(x); });
                          datas = _.zip(util.intRange(0,datas.length), datas);
                          console.log('CHART options', {
                                          name: series,
                                          data: datas,
                                          bars:{ show:true }
                                      });
                          return {
                              name: series,
                              data: datas,
                              bars:{ show:true }
                          };  
                      }
                      return undefined;
                  }).filter(function(y) { return y !== undefined; });
          };	  
	  
	  window.nv = nv;
	  window.models = models;
	  window.ns = ns;

	  return {
	      nv : nv
	  };
      });