define(
    ['/webbox/webbox-ns.js'],
    function(ns) {

	var ENABLE_CACHING = false;
	var _model_cache = {};
	
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
		clear:function() {
		    this.attributes = {};
		},
		set2:function(k,v) {
		    var options = {};
		    options[ns.expand(k)] = v;
		    this.set(options);
		    return v;
		},		
		// this is a compatibility function used by sync
		url:function() { return this.uri; },
		fetch:function(options) {
		    // all caching functionality goes in here
		    var this_ = this;
		    if (!ENABLE_CACHING || (options && options.cache == false) || _model_cache[this.uri] == undefined) {
			_model_cache[this.uri] = this;
			return Backbone.Model.prototype.fetch.apply(this,arguments);
		    }
		    // return a cached copy instead
		    this.attributes = _(_model_cache[this.uri].attributes).clone();
		    var d = new $.Deferred();
		    d.resolve(this);
		    return d.promise();
		}
	    }
	);
	
	return {
	    Model:Model,
	    is_model:function(v) {
		return typeof(v) == 'object' && v instanceof Model;
	    }
	};
    });