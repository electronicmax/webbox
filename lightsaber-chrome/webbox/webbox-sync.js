// assumes require, $, $.rdf are defined
define(
    ['/webbox/webbox-ns.js', '/webbox/webbox-model.js', '/webbox/util.js', '/webbox/webbox-config.js', '/webbox/webbox-kb.js'],    
    function(ns, models, util, configbox, wkb) {
	// updates the sync() method so that by default serializes
	// models to rdf
	// backbone-patch
	var config = configbox.config;
	var oldSync = Backbone.sync;
	var contract_ns = function(prefixed) {
	    var pref = prefixed.split(':');
	    var pre = pref[0], pos = pref[1];
	    console.assert(ns[pre] !== undefined, "Could not find prefix " + pre);
	    return ns[pre] + pos;
	};
	var to_property = function(key) {
	    if (key.indexOf('http') == 0) {
		return $.rdf.resource("<"+key+">");
	    }
	    if (key.indexOf(':') >= 0)  {
		return $.rdf.resource(key, {namespaces:ns});
	    }
	    var r =  $.rdf.resource("<"+ns.base + key+">");
	    console.log(r.toString());
	    return r;
	};
	var to_literal_or_resource = function(v) {
	    if ( v instanceof $.rdf.resource ) { return v; }
	    if ( v instanceof $.rdf.literal ) { return v; }
	    if ( v instanceof $.rdf.blank ) { return v; }	    
	    if ( typeof(v) == 'number' ) { return $.rdf.literal(v); }
	    if ( typeof(v) == 'string' ) { /* todo: check ? */
		return $.rdf.literal(v, { datatype:ns.expand("xsd:string") });  // ns.ns.xsd+"string" });
	    } 
	    if ( models.is_model(v) ) { return $.rdf.resource("<"+v.uri+">"); }
	    return $.rdf.literal(v);
	};
	var serialize = function(model, deep, serialized_models) {
	    // serializes a single model; however, deep is true and v is a model,
	    // will serialize that too and return an object:
	    //   { u1 : --model_1_serialized--, u2 : ...  }

	    // deep is dangerous, disabling for now
	    deep = false;
	    
	    var base = model.base || model.get("_base") || ns.base;
	    var uri = model.url();
	    var uri_r = $.rdf.resource("<"+uri+">");
	    var data = model.toJSON();
	    var self = arguments.callee;
	    var triples = [];
	    var this_kb = wkb.make_kb();
	    
	    // make a place for us to store the models as they get serialized
	    serialized_models = (serialized_models !== undefined) ? serialized_models : {};

	    var _res = function(prefix,name) {
		return $.rdf.resource("<"+ns[prefix] + name + ">");
		// return $.rdf.resource(name,{namespaces:this_kb.namespaces});
	    };

	    _(data).keys().map(
		function(k) {
		    var v = data[k];
		    var k_r = to_property(k);
		    // console.log(" TO PROPERTY OF ", k, " is ", k_r, k_r.toString());
		    if ($.isArray(v)) { 
			// arrays turn into Seqs:
			var seq_r = _res('webbox', "_seq_"+k);
			this_kb.add($.rdf.triple(seq_r, _res('rdf', 'type'), _res('rdf', 'Seq')));
			util.intRange(0,v.length).map(
			    function(i) {
				var prop_r = $.rdf.resource("<"+ns.rdf+"_"+(i+1)+">");
				var v_r = to_literal_or_resource(v[i]);
				
				console.assert( !($.isArray(v[i])), "Not Implemented Yet: Can't handle nested arrays" );				
				this_kb.add($.rdf.triple(seq_r,prop_r,v_r));
				
				if (deep && models.is_model(v[i]) && !(v[i].uri in serialized_models)) {
				    // serialize and add 'em to our table
				    _(serialized_models).extend(self(v[i], true, serialized_models));
				}
			    });
			var triple = $.rdf.triple(uri_r,k_r,seq_r);
			this_kb.add(triple);
		    } else {
			// non array, simple type or model
			try {
			    var v_r = to_literal_or_resource(v);			    
			    var triple = $.rdf.triple(uri_r,k_r,v_r);
			    this_kb.add(triple);
			    console.log("Adding nonarr triple ", triple.toString());

			    // if model, then we if deep then we want to serialize it too
			    if (deep && models.is_model(v) && !(v.uri in serialized_models)) {
				// then extend the set of serialized dudes to this model
				console.log("serializing model ", v.uri);
				_(serialized_models).extend(self(v, true, serialized_models));
				log("serialized models is ", serialized_models);
			    }
			} catch (x) {
			    console.error(" :( ");
			    console.error(x, x.stack);
			    window.E = x;
			}
			    
		    }
		});
	    console.log("setting serialized models ", uri);
	    try {
		console.log("in json: ", this_kb.dump({serialize: true}));
		console.log("in rdfxml: ", this_kb.dump({format:'application/rdf+xml', serialize: true}));
	    } catch (x) {
		console.error(x);
		window.E = x;
	    }
	    serialized_models[uri] = this_kb.dump({format:'application/rdf+xml', serialize: true});
	    return deep ? serialized_models : serialized_models[uri];
	};	

	var put_update = function(uri, serialized_body) {
	    console.log("Asserting into graph ", uri + " --- " + (config.PUT_URL + uri));
	    return $.ajax({ type:"PUT", url: config.PUT_URL + uri, data:serialized_body, datatype:"text", headers:{ "Content-Type" : "application/rdf+xml" }});
	};

	var get_update = function(model) {
	    var uri = model.url();
	    var query = _("CONSTRUCT { ?s ?p ?o } WHERE { GRAPH \<<%= uri %>\> { ?s ?p ?o. } } LIMIT 100000").template({uri:uri});
	    var get = $.ajax({ type:"GET", url:config.SPARQL_URL, data:{query:query}});
	    var kb = wkb.make_kb();
	    var _d = new $.Deferred();
	    var fetch_model = arguments.callee;
	    get.then(function(doc){
			 console.log("finished getting, now populating --- ");
			 kb.load(doc, {});
			 var obj = {};
			 var recursive_fetch_dfds = [];
			 $.rdf({databank:kb}).where('<'+uri+'> ?p ?o').each(
			     function() {
				 var prop = this.p.value.toString();
				 // console.log(" got prop ", prop);
				 if (prop.indexOf(ns.base) == 0) {
				     prop = prop.slice(ns.base.length);
				 }
				 var val = this.o.value;				 
				 if (!util.is_resource(val)) {
				     obj[prop] = val;    
				 } else {
				     var m = new models.Model({},val.toString());
				     obj[prop] = m;
				     recursive_fetch_dfds.push(fetch_model(m));
				 }				 
			     });
			 model.set(obj);
			 $.when.apply($,recursive_fetch_dfds).then(function() { _d.resolve(model);  });
		     }).error(_d.fail);
	    return _d;
	};
	Backbone.sync = function(method, model, options){
	    // try { console.group('sync ' +  model.url());  } catch (x) {    }
	    // log("method - ", method, " model ", model, model.url(), " - options: " , options);
	    var uri = model.url();
	    if (['create', 'update'].indexOf(method) >= 0) {
		// may return multiple models as a result, we want to serialize each one
		var serialized = {};
		serialize(model,true,serialized);
		var ds = []; // deferreds
		_(serialized).keys().map(
		    function(uri) {
			ds.push(put_update(uri,serialized[uri]));
		    });
		// console.log("Sync Save deferreds ", ds.length);
		return $.when.apply($,ds);
	    } else if (method == 'read') {
		return get_update(model);
	    }
	    // try { console.endGroup(); } catch (x) {   }
	};	
    });
