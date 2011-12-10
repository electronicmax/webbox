
define(['/webbox/webbox-ns.js', '/webbox/webbox-config.js' ],
       function(ns, config) {	   
	   var make_kb = function() {
	       return $.rdf.databank([], {base: ns.base, namespaces:ns.ns});
	   };
	   var make_spo_query = function(query, cont) {
		var get = $.ajax({ type:"GET", url:config.ENDPOINT+"/sparql/", data:{query:query}});
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
	   var get_sp_object = function(subject, predicate, graph) {
	       var d = new $.Deferred();
	       var q = graph ?
		   _.template("SELECT ?o WHERE { GRAPH \<<%= g %>\> { \<<%=s%>\> \<<%=p%>\> ?o . }} LIMIT 100000")({s:subject,p:predicate, g:graph}) :
	       _.template("SELECT ?o WHERE { \<<%=s%>\> \<<%=p%>\> ?o . } LIMIT 100000").template({s:subject,p:predicate});
	       console.log("get_value query ", query);
	       var get = $.ajax({ type:"GET", url:config.ENDPOINT+"/sparql/", data:{query:query}}).then(
		   function(doc) {
		       window.doc = doc;
		       console.log(" Okay, party ", doc);
		   });	       
	   };	   
	   
	   var get_graphs = function(cont) {
	       // gets list of distinct ORM entities in the KB:
	       // TODO: make this more efficient so that we don't have to parse all the triples
	       
	       var query = "CONSTRUCT { ?g a <http://webbox.ecs.soton.ac.uk/webbox/Object> } WHERE { GRAPH ?g { ?s ?p ?o. } } LIMIT 100000";
	       var get = $.ajax({ type:"GET", url:config.ENDPOINT+"/sparql/", data:{query:query}});
	       var kb = make_kb();
	       var gs = [];
	       get.then(function(doc){
			    kb.load(doc, {});
			    $.rdf({databank:kb}).where('?s ?p ?o').each(
				function() {
				    var graph = this.s.value.toString();
				    gs.push(graph);
				});
			    if(cont) { cont(gs); }
			});
	   };	   
	   return {
	       make_kb:make_kb,
	       get_graphs:get_graphs,
	       get_sp_object:get_sp_object
	   };
       });