define(
    ['/webbox/webbox-ns.js', '/webbox/webbox-kb.js'],
    function(ns, wkb) {

	var ENABLE_CACHING = false;
	var _model_cache = {};

	var Model = Backbone.Model.extend(
	    {
		initialize:function(attrs, uri) {
		    this.__make_uri(uri);
		},
		__make_uri:function(uri) {
		    if (!this.uri) {
			this.uri = uri ? uri : ns.me + this.cid;
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
		is_fetched:function() { return this.fetched !== undefined; },
		fetch:function(options) {
		    this.fetched = true;
		    // all caching functionality goes in here
		    var this_ = this;
		    if (!ENABLE_CACHING || (options && options.cache == false) || _model_cache[this.uri] === this || _model_cache[this.uri] === undefined) {
			_model_cache[this.uri] = this;
			return Backbone.Model.prototype.fetch.apply(this,arguments);
		    }
		    // update our copy from the cache master
		    this.attributes = _(_model_cache[this.uri].attributes).clone();
		    var d = new $.Deferred();
		    d.resolve(this);
		    return d.promise();
		}
	    }
	);

	var _msg_spool_pointer = new Date(0);	
	var get_remote_updates = function() {
	    // looks in the message spool, updates everything in our cache,
	    // can be called repeatedly as frequently as you want =]
	    var d = new $.Deferred();
	    var ds = [];
	    var updated_uris = [];
	    wkb.get_updated_messages(_msg_spool_pointer).then(
		function(updates) {
		    updates.map(function(update) {
				    // update thing.
				    var _d = new $.Deferred();
				    ds.push(_d);
				    if (update.updated_resource_uri in _model_cache) {
					var m = _model_cache[update.updated_resource_uri];
					m.fetch({cache:false}).then(function() { m.trigger('remote_updated'); _d.resolve(); });
				    }				    
				    // update pointer. 
				    if (_msg_spool_pointer.valueOf() < update.dl.valueOf()) { _msg_spool_pointer = dl; }
				});
		    $.when.apply($.when,ds).then(d);		    
		});
	    return d.promise();
	};
	
	var get_resource =  function(uri) {
	    if (uri === undefined) { throw new Error("get_resource: URI undefined"); }
	    uri = ns.expand(uri);
	    if (_model_cache[uri] === undefined) {
		_model_cache[uri] = new Model({},uri);
	    }
	    return _model_cache[uri];
	};
	
	return {
	    Model:Model,
	    is_model:function(v) {
		return typeof(v) == 'object' && v instanceof Model;
	    },
	    get_resource:get_resource,
	    disable_caching:function() { ENABLE_CACHING = false; }
	};
    });