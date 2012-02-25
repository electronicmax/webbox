define(['/webbox/util.js','/webbox/webbox-kb.js', '/webbox/webbox-config.js'],
      function(utils,wkb,configbox) {
	  // todo - do a connection check to make sure it works
	  var storage = configbox.config;
	  var Controller = Backbone.View.extend(
	      {		  
		  events : {
		      "click .save" : "save_settings",
		      "keyup #webid" : "fetch_webid",
		      "keyup #webbox_url" : "_fire_webbox_url_changed"
		  },
		  
		  fields : ['webid','webbox_url','weblogging','page_bookmarking','mode_4store'], 
		  
		  initialize:function() {		      
		      var this_ = this;
		      var f_vals = this.load_values();
		      this.bind("_webbox_url_changed", function(val) {   this_.test_webbox_connection(val);});
		      this.$('input[type=checkbox]').iphoneStyle();
		      
		  },
		  _fire_webbox_url_changed:function() {
		      var this_ = this;
		      this.trigger("_webbox_url_changed",$("#webbox_url").val());
		  },
		  test_webbox_connection:function(url) {
		      console.log("attempting to test", url);
		      var this_ = this;
		      wkb.ping(url).done(function(x) {
							 console.log("success callback", x);
							 $('#webbox_dead').slideUp();
							 $('#webbox_alive').slideDown();
						     }).fail(function(y) {
								 console.log("fail callback");
								 $('#webbox_alive').slideUp();						  
								 $('#webbox_dead').slideDown();
							     });
		  },
		  fetch_webid:function() {
		      var url = $('#webid').val();
		      var this_ = this;
		      this.set_fetching_visible(true);
		      var kb = wkb.make_kb();
		      if (this._fetching) {
			  console.log("Calling abort ---- ", this._fetching);
			  this._fetching.abort();
			  delete this._fetching;
		      }
		      this._fetching = $.ajax({url:url, type:"GET"}).
			  success(
			      function(doc) {
				  delete this_.fetching;
				  this_.set_error("");
				  this_.set_fetching_visible(false);
				  try {
				      kb.load(doc, {});
				      console.log("Got document" , doc);
				      $.rdf({databank:kb}).where('<'+url+'> foaf:primaryTopic ?me').
					  where('?me webbox:address ?webbox .').each(
					      // where('?me ?p ?o .').each(
					      function() {
						  console.log(" ----------------------- ", wend);
						  var wend = this.webbox.value.toString();
						  $("#webbox_url").val(wend);
						  this_.trigger("_webbox_url_changed", wend);
					      });
				  } catch (x) {
				      this_.set_error("Could not parse " + url + " - are you sure this is a foaf file?");
				  }				      
			     }).
			  error( 
			      function(x) {
				  
				  console.log("fetch_webid fail callback", x);
				  delete this_._fetching;
				  this_.set_fetching_visible(false);
				  this_.set_error("Could not fetch foaf from " + url);
			      }
			  );
		  },
		  set_error:function(err) {
		      $('#error').html(err).slideDown();
		  },
		  set_fetching_visible:function(b) {
		      if (b) { this.$('#fetching').show(); return; }
		      this.$('#fetching').hide();
		  },
		  set_saving_visible:function(b) {
		      if (b) { this.$('.saving').show(); return; }
		      this.$('.saving').hide();
		  },
		  get_values_from_fields:function() {
		      var o = {};
		      this.fields.map(function(f) {
					  console.log(f, $("#"+f), $("#"+f).val());
					  o[f] = $("#"+f).attr("type") == 'checkbox' ? $("#"+f)[0].checked : $("#"+f).val().trim();
				      });
		      return o;
		  },
		  load_values:function() {
		      var o = {};
		      this.fields.map(function(f) {
					  o[f] = (storage[f] || '');
					  if ($("#"+f).attr("type") !== 'checkbox') {
					      $("#"+f).val(o[f]);
					  } else {
					      $("#"+f)[0].checked = (storage[f] == 'true');
					  }
				      });
		      return o;
		  },
		  save_values:function() {
		      var o = {};
		      var vals = this.get_values_from_fields();
		      this.fields.map(function(f) { storage[f] = vals[f]; });
		      if (vals['mode_4store']) {
			  // then set the endpoint
			  storage['SPARQL_URL'] = storage['webbox_url'] + '/sparql/';
			  storage['PUT_URL'] = storage['webbox_url'] + '/data/'; // webbox_url+"/data/"
		      } else {
			  // todo : dan
			  storage['SPARQL_URL'] = storage['webbox_url'] + 'webbox/sparql/';
			  storage['GET_REPO_UPDATES'] = storage['webbox_url'] + 'update';			  
			  storage['PUT_URL'] = storage['webbox_url'] + 'webbox/'; // storage['webbox_url'] + '/?graph=';
		      }
		      console.log("Set SPARQL: ", storage['SPARQL_URL'] + " //  PUT: " + storage['PUT_URL']); 
		      return o;
		  },		  
		  save_settings:function() {
		      this.set_saving_visible(true);
		      this.save_values();
		      var this_ = this;
		      setTimeout(function() { this_.set_saving_visible(false); }, 1000);
		  }
	  });
	  
	  var c = new Controller({ el : $('#main')[0] });
	  return {
	      c : c
	  };
      });