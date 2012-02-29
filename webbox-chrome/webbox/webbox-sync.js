// assumes require, $, $.rdf are defined
/**
 * this module is the core connector to webbox:
 *
 */
define(
    ['/webbox/webbox-ns.js', '/webbox/webbox-model.js', '/webbox/util.js', '/webbox/webbox-config.js', '/webbox/webbox-kb.js'],    
    function(ns, models, util, config, wkb) {

	// updates the sync() method so that by default serializes
	// models to rdf
	// backbone-patch
	config = config.config;
	var oldSync = Backbone.sync;

	var parse_etag = function(et) {
	    // etags look like w/"fingerprint" so we really just want fingerprint
	    return et.slice(3,et.length-1);
	};

	var refresh_cache = function(xhr) {
	    var etag = parse_etag(xhr.getResponseHeader('ETag'));
	    var prev_etag = parse_etag(xhr.getResponseHeader('X-ETag-Previous'));
	    var cache_etag = models.get_cache_version();
	    var d = new $.Deferred();
	    // console.log("etags ", etag, prev_etag, "cache version -- ", models.get_cache_version());
	    
	    if (etag == models.get_cache_version()) {
		// console.log('fast forward cache update --- ', prev_etag, ' -> ', etag);
		models.set_cache_version(etag);
		return d.resolve(etag);
	    }
	    
	    // console.log(" getting updates -- tag is ", etag, " prev is ", prev_etag, 'cache version is ', cache_etag);
	    models.set_cache_version(etag);
	    
	    // this gets returned turtle-style:
	    $.ajax({ type:"GET", url:config.GET_REPO_UPDATES, data:{ since: cache_etag }})
		.then(function(data, textStatus, jqXHR) {
			  if (!data) { console.error(' warning -- no data returned on cache update ');  return;   }
			  var kb = wkb.make_kb();
			  kb.load(data, {format:'text/turtle'});
                          // console.log(' data ', data);
			  var subjects = _.uniq($.rdf({databank:kb}).where('?s ?p ?o').map(function() {	return this.s.value.toString(); }));
			  var updated_models = subjects.map(function(s_uri) {
					   var m = models.get_resource(s_uri);
					   update_model_with_raw_rdf_document(m,data,'text/turtle');
					   return m;
				       });
			  d.resolve(updated_models,data,textStatus,jqXHR);
		      });
	    return d.promise();	    
	};

	var update_model_with_raw_rdf_document = function(model,doc,format) {
    	    var kb = wkb.make_kb();
    	    kb.load(doc, {format:format});
	    var obj = {};
	    var set_val = function(o,p,v) {
		if (o[p] === undefined) { o[p] = v; return; }
		if (o[p] !== undefined && $.isArray(o[p])) { o[p].push(v); return; }
		o[p] = [o[p], v];
	    };	    
	    $.rdf({databank:kb}).where('<'+model.uri+'> ?p ?o').each(
		function() {
		    // console.log('got ', model.uri, this.p.value.toString(), this.o.value.toString());
		    var prop = this.p.value.toString();
		    // do we really want to do this? 
		    if (prop.indexOf(ns.me) == 0) { prop = prop.slice(ns.me.length); }
		    // TODO: handle SEQs
		    var val = this.o.value;
		    set_val(obj, prop, !util.is_resource(val) ? val : models.get_resource(val.toString()));
		});
	    model.set(obj);
	};

	var get_update = function(model) {
	    var uri = model.url();
	    var query = _("CONSTRUCT { ?s ?p ?o } WHERE { GRAPH \<<%= uri %>\> { ?s ?p ?o. } } LIMIT 100000").template({uri:uri});
	    var get = $.ajax({ type:"GET", url:config.SPARQL_URL, data:{query:query}});
	    var _d = new $.Deferred();
	    var fetch_model = arguments.callee;
	    get.then(function(doc,textStatus,jqXHR){ update_model_with_raw_rdf_document(model, doc); _d.resolve(model,doc,textStatus,jqXHR);  }).error(_d.fail);
	    return _d;
	};	

	var to_property = function(key) {
	    if (key.indexOf('http') == 0) {
		return $.rdf.resource("<"+key+">");
	    }
	    if (key.indexOf(':') >= 0)  {
		return $.rdf.resource(key, {namespaces:ns});
	    }
	    var r =  $.rdf.resource("<"+ns.me + key+">");
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
	    var uri = model.url();
	    var uri_r = $.rdf.resource("<"+uri+">");
	    var data = model.toJSON();
	    var self = arguments.callee;
	    var triples = [];
	    var this_kb = wkb.make_kb();
	    
	    // make a place for us to store the models as they get serialized
	    serialized_models = (serialized_models !== undefined) ? serialized_models : {};
	    var recursive_serialize = function(v) {
		if (deep && models.is_model(v) && !(v.uri in serialized_models)) {
		    _(serialized_models).extend(self(v[i], true, serialized_models));
		}
	    };
	    
	    var _res = function(prefix,name) {
		return $.rdf.resource("<"+ns[prefix] + name + ">");
		// return $.rdf.resource(name,{namespaces:this_kb.namespaces});
	    };

	    _(data).keys().map(
		function(k) {
		    var v = data[k];
		    var k_r = to_property(k);		    
		    if (v instanceof wkb.ModelSeq) { 
			// if it's a Seq
			var seq_r = _res('webbox', "_seq_"+k);
			this_kb.add($.rdf.triple(seq_r, _res('rdf', 'type'), _res('rdf', 'Seq')));
			util.intRange(0,v.length).map(
			    function(i) {
				var prop_r = $.rdf.resource("<"+ns.rdf+"_"+(i+1)+">");
				var v_r = to_literal_or_resource(v.at(i));
				console.assert( !($.isArray(v[i])), "Not Implemented Yet: Can't handle nested arrays" );				
				this_kb.add($.rdf.triple(seq_r,prop_r,v_r));
				recursive_serialize(v[i]);				
			    });
			var triple = $.rdf.triple(uri_r,k_r,seq_r);
			this_kb.add(triple);
		    } else if ($.isArray(v)) {
			// serialize it straight up as multiple properties
			v.map(function(v_i) {
				  var triple = $.rdf.triple(uri_r,k_r,to_literal_or_resource(v_i));
				  this_kb.add(triple);
				  recursive_serialize(v_i);
			      });			
		    } else {
			// simply party
			var v_r = to_literal_or_resource(v);			    
			var triple = $.rdf.triple(uri_r,k_r,v_r);
			this_kb.add(triple);
			recursive_serialize(v);			
		    }
		});

	    if (config.DEBUG_SERIALIZATION) {
		console.log("setting serialized models ", uri);
		try {
		    console.log("in json: ", this_kb.dump({serialize: true}));
		    console.log("in rdfxml: ", this_kb.dump({format:'application/rdf+xml', serialize: true}));
		} catch (x) {
		    console.error(x);
		    window.E = x;
		}		
	    }
	    serialized_models[uri] = this_kb.dump({format:'application/rdf+xml', serialize: true});
	    return deep ? serialized_models : serialized_models[uri];
	};

	var _put_update = function(uri, serialized_body) {
	    // 
	    var put_uri = config.PUT_URL + (config.mode_4store == 'false' ? "?graph=" + encodeURIComponent(uri) : uri);
	    if (config.DEBUG_SERIALIZATION) { console.log(" >>> putting to ", put_uri); }
	    return $.ajax({ type:"PUT",
			    url: put_uri,
			    data:serialized_body, datatype:"text",
			    headers:{ "Content-Type" : "application/rdf+xml" }});
	};	
	Backbone.sync = function(method, model, options){
	    // try { console.group('sync ' +  model.url());  } catch (x) {    }
	    // log("method - ", method, " model ", model, model.url(), " - options: " , options);
	    var uri = model.url();
	    if (['create', 'update'].indexOf(method) >= 0) {
		// may return multiple models as a result, we want to serialize each one
		var serialized = {};
		var total = new $.Deferred();		
		serialize(model,true,serialized);
		var ds = []; // deferreds
		_(serialized).keys().map(
		    function(uri) {
			var _d = _put_update(uri,serialized[uri]).pipe(function(data,text_resp,xhr) { return refresh_cache(xhr); }); 		      ds.push(_d);
			_d.fail(function(err) {
				     console.error("error with putting ", uri, " :: ", err, err.statusCode().status, err.statusCode().statusText);
				     total.fail();
				 });
		    });
		$.when.apply($,ds).then(total.resolve);		
		return total.promise();
	    } else if (method == 'read') {
		return get_update(model).pipe(function(model,resp,doc,xhr) { return refresh_cache(xhr); });
	    }
	    // try { console.endGroup(); } catch (x) {   }
	};
	return {
	    refresh:function() {
		// manually tickle le cache
		return wkb.ping().pipe(function(d,s,xhr) { console.log(" yoo ", d, s, xhr); return refresh_cache(xhr); }).promise();
	    } 
	};	
    });
