define(
    ['/webbox/webbox-ns.js'],
    function(ns) {
	var Model = Backbone.Model.extend(
	    {
		initialize:function() {
		    console.log("initialize ", this.attributes, ns.base, !('urlRoot' in this.attributes));
		    if (!('urlRoot' in this.attributes)) {
			this.set({"urlRoot": ns.base});
		    }
		    this.url();		    
		},
		_test:function() {
		    this.set({"firstname":"fred", "lastname" : "flinstone", gender: "male", alive: false});
		},
		url:function() {
		    if (!('__uri__' in this.attributes)) {
			this.set({"__uri__" : this.get("urlRoot") + this.cid});
		    }
		    return this.get("__uri__");
		}
	    }
	);
	return {
	    Model:Model	       
	};
    });