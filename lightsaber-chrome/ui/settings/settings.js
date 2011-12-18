define(['/webbox/util.js','/webbox/settings_storage.js','/webbox/webbox-kb.js', '/webbox/webbox-config.js'],
      function(utils,storage,wkb) {
	  // todo - do a connection check to make sure it works 
	  var Controller = Backbone.View.extend(
	      {		  
		  events : {
		      "click .save" : "save_settings",
		      "keyup #webid" : "fetch_webid",
		      "keyup #webbox_url" : "_fire_webbox_url_changed"
		  },
		  
		  fields : ['webid','webbox_url','webbox_password'],
		  
		  initialize:function() {
		      var this_ = this;
		      var f_vals = this.load_values(storage.storage);
		      this.bind("_webbox_url_changed", function(val) { this_.test_webbox_connection(val); });
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
		      $.ajax({url:url, type:"GET"}).
			  success(
			      function(doc) {
				  kb.load(doc, {});
				  $.rdf({databank:kb}).where('<'+url+'> foaf:primaryTopic ?me').
				      where('?me webbox:address ?webbox .').each(
				      // where('?me ?p ?o .').each(
				      function() {
					  var wend = this.webbox.value.toString();
					  $("#webbox_url").val(wend);
					  this_.trigger("_webbox_url_changed", wend);
				      });
				  this_.set_fetching_visible(false);
				  this_.set_error("");
			     }).
			  error(
			      function() {
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
					  o[f] = $("#"+f).val().trim();
				      });
		      return o;
		  },
		  load_values:function(storage) {
		      var o = {};
		      this.fields.map(function(f) { o[f] = (storage[f] || undefined); });
		      return o;
		  },
		  save_values:function(storage) {
		      var o = {};
		      var vals = this.get_values_from_fields();
		      this.fields.map(function(f) { storage[f] = (vals[f] || undefined); });
		      return o;
		  },		  
		  save_settings:function() {
		      this.set_saving_visible(true);
		      this.save_values(storage.storage);
		      var this_ = this;
		      setTimeout(function() { this_.set_saving_visible(false); }, 1000);
		  }
	  });

	  var c = new Controller({ el : $('#main')[0] });
	  
	  var get_settings = function() {
	      // gets called by webbox-core to retrieve values and
	      // smash default config values
	      return c.load_values(storage.storage);
	  };
	  
	  return {
	      c : c,
	      get_settings:get_settings
	  };
      });