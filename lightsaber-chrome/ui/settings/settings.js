define(['/webbox/util.js','/webbox/settings_storage.js','/webbox/webbox-kb.js'],
      function(utils,storage,wkb) {
	  var Controller = Backbone.View.extend(
	      {
		  
		  events : {
		      "click .save" : "save_settings",
		      "blur #webid" : "fetch_webid"
		  },

		  
		  fields : ['webid','webbox_url','webbox_password'],
		  
		  initialize:function() {
		      var this_ = this;
		      var f_vals = this.load_values(storage.storage);
		      this.fields.map(function(f) {  if (f_vals[f]) { $("#"+f).val(f_vals[f]); } });
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
					  // var sub = this.s.value.toString();
					  // var prop = this.p.value.toString();
					  // var obj = this.o.value.toString();
					  // console.log(prop,obj);					  
					  var wend = this.webbox.value.toString();
					  $("#webbox_url").val(wend);
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
	      return c.load_values(storage.storage);
	  };
	  
	  return {
	      c : c,
	      get_settings:get_settings
	  };
      });