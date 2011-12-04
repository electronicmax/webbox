define(
    ['/webbox/webbox-ns.js'],
    function(ns) {
	var Model = Backbone.Model.extend(
	    {
		initialize:function(attrs, uri) {
		    this.__make_uri(uri);		    
		},
		__make_uri:function(attrs) {
		    if (!this.uri) {
			if (attrs && attrs.uri) {
			    this.uri = attrs.uri;
			} else {
			    this.uri = ns.base + this.cid;
			}
		    } 
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