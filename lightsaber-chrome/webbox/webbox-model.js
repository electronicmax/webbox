define(
    ['/webbox/webbox-ns.js'],
    function(ns) {
	var Model = Backbone.Model.extend(
	    {
		initialize:function(attrs, uri) {
		    this.__make_uri(uri);		    
		},
		__make_uri:function(uri) {
		    if (!this.uri) {
			this.uri = uri ? uri : ns.base + this.cid;
		    } 
		},
		set2:function(k,v) {
		    var options = {};
		    options[ns.expand(k)] = v;
		    this.set(options);
		    return v;
		},		
		_test:function() {   this.set({"firstname":"fred", "lastname" : "flinstone", gender: "male", alive: false});	},
		// this is a compatibility function used by sync
		url:function() { return this.uri; }
	    }
	);
	return {
	    Model:Model	       
	};
    });