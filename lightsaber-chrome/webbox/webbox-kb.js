
define(['/webbox/webbox-ns.js', '/webbox/webbox-config.js','/webbox/util.js'],
       function(ns, configbox, util) {

	   var is_model = function(v) { return typeof(v) == 'object' && v instanceof Model; };
	   
	   var config = configbox.config;
	   var make_kb = function() {
	       return $.rdf.databank([], {base: ns.base, namespaces:ns.ns});
	   };
	   var ping = function(url) {
	       var this_ = this;
	       var query = "SELECT ?s ?p ?o WHERE { ?s ?p ?o . } LIMIT 1";
	       if (this.get !== undefined) {
		   this.get.abort();
		   delete this.get;
	       }
	       this.get = $.ajax({ type:"GET", url:( url !== undefined ? url + "/sparql/" : config.SPARQL_URL ), data:{query:query}});
	       var D = new $.Deferred();
	       this.get.success(function() { delete this_.get; D.resolve.apply(D,arguments); }).error(D.reject);
	       return D.promise();
	   };
	   // @Deprecated, should not be used	   
	   var make_spo_query = function(query, cont) {
		var get = $.ajax({ type:"GET", url:config.SPARQL_URL, data:{query:query}});
		var kb = make_kb();
		get.then(function(doc){
			     var results = [];
			     kb.load(doc, {});
			     $.rdf({databank:kb}).where('?s ?p ?o').each(
			     function() {
				 results.push(
				     {s:this.s ? this.s.value : undefined,
				      p:this.p ? this.p.value : undefined,
				      o:this.o ? this.o.value : undefined });
			     });
			     if(cont) { cont(results); }
			 });
	   };
	   var get_objects_of_type = function(type_uri) {
	       var d = new $.Deferred();
	       if (util.is_resource(type_uri)) { type_uri = type_uri.value.toString(); }
	       if (is_model(type_uri)) {  type_uri = type_uri.uri; }
	       if (typeof(type_uri) !== 'string') { type_uri = type_uri.toString();     }
	       type_uri = ns.expand(type_uri);	       
	       var query = _("SELECT ?s WHERE { GRAPH ?s { ?s a \<<%= type_uri %>\> . }} LIMIT 100000").template({type_uri:type_uri});
	       var get = $.ajax({ type:"GET", url:config.SPARQL_URL, data:{query:query}}).then(
		   function(doc) {		       
		       var resources = $(doc, "results").find('uri').map(
			   function(x) {
			       return $(this).text();
			   }).get();
		       console.log("resources : ", resources);		       
		       d.resolve(resources);
		   });
	       return d.promise();	       
	   };
	   var get_sp_object = function(subject, predicate, graph) {
	       // subject should be a uri,
	       subject = ns.expand(subject.toString());
	       predicate = ns.expand(predicate.toString());
	       var d = new $.Deferred();
	       var query = graph ?
		   _("SELECT ?o WHERE { GRAPH \<<%= g %>\> { \<<%=s%>\> \<<%=p%>\> ?o . }} LIMIT 100000").template({s:subject,p:predicate, g:graph}) :
	       _("SELECT ?o WHERE { \<<%=s%>\> \<<%=p%>\> ?o . } LIMIT 100000").template({s:subject,p:predicate});
	       console.log("get_value query ", query, config.SPARQL_URL);
	       var get = $.ajax({ type:"GET", url:config.SPARQL_URL, data:{query:query}}).then(
		   function(doc) {
		       var lits = $(doc, "results").find('literal');
		       if (lits.length > 0) {
			   d.resolve(lits.map(function() { return $(this).text(); }));
			   return;
		       }
		       var uris = $(doc, "results").find('uri');
		       if (uris.length > 0) {
			   d.resolve(uris.map(function() { return $(this).text(); }));
		       }		       
		   });
	       return d.promise();	       
	   };	   	   
	   var get_graphs = function() {
	       // gets list of distinct ORM entities in the KB:
	       // TODO: make this more efficient so that we don't have to parse all the triples	       
	       var query = "CONSTRUCT { ?g a <http://webbox.ecs.soton.ac.uk/webbox/Object> } WHERE { GRAPH ?g { ?s ?p ?o. } } LIMIT 100000";
	       console.log("get_graphs() calling ", config, config.SPARQL_URL);
	       var get = $.ajax({ type:"GET", url:config.SPARQL_URL, data:{query:query}});
	       var kb = make_kb();
	       var gs = [];
	       var d = new $.Deferred();
	       get.then(function(doc){
			    kb.load(doc, {});
			    $.rdf({databank:kb}).where('?s ?p ?o').each(
				function() {
				    var graph = this.s.value.toString();
				    gs.push(graph);
				});
			    d.resolve(gs);
			}).fail(d.reject);
	       return d.promise();
	   };

	   var string = function(s) {
	       return $.rdf.literal(s,{datatype:ns.expand("xsd:string")});
	   };
	   var integer = function(d) {
	       return $.rdf.literal(d,{datatype:ns.expand("xsd:integer")});
	   };
	   var dateTime = function(d) {
	       console.assert(d instanceof Date, "d must be a date");
	       return $.rdf.literal(d.toISOString(),{datatype:ns.expand("xsd:dateTime")});
	   };	   
	   var resource = function(s) {
	       s = ns.expand(s);
	       return $.rdf.resource("<"+s+">");
	   };
	   var get_updated_messages = function(since_time) {
	       var query_template = 'SELECT ?msg ?time ?entity WHERE { GRAPH <http://webbox.ecs.soton.ac.uk/ns#ReceivedSIOCGraph> { ?msg a <http://rdfs.org/sioc/ns#Post> . ?msg <http://purl.org/dc/terms/created> ?time . ?msg <http://xmlns.com/foaf/0.1/primaryTopic> ?entity. } FILTER (?time > "<%= since_time.toISOString() %>") }'; 
	       var query = _(query_template).template({ since_time:since_time || new Date(0) });
	       var d = new $.Deferred();	       
	       var get = $.ajax({ type:"GET", url:config.SPARQL_URL, data:{query:query}}).success(
		   function(doc) {
		       var lits = $(doc, "results").find('result').map(
			   function() {
			       var entity_uri = $(this).find('binding[name=entity]').find('uri').text();
			       var date_literal = $(this).find('binding[name=time]').find('literal').text();
			       var dl = new Date(date_literal);
			       return { updated_resource_uri: entity_uri,  date:dl  };
			   }).get();
		       d.resolve(lits);
		   }).error(d.fail);
	       return d.promise();	       
	   };
	   
	   return {
	       get_updated_messages:get_updated_messages,
	       ping:ping,
	       make_kb:make_kb,
	       get_graphs:get_graphs,
	       get_sp_object:get_sp_object,
	       get_objects_of_type:get_objects_of_type,
	       string:string,
	       integer:integer,
	       dateTime:dateTime,
	       resource:resource
	   };
       });