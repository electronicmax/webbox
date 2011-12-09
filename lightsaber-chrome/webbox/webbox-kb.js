
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
	   var get_graphs = function(cont) {
		var query = "CONSTRUCT { ?g a <http://webbox.ecs.soton.ac.uk/webbox/Object> } WHERE { GRAPH ?g { ?s ?p ?o. } } LIMIT 100000";
		console.log("get ");
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
	       get_graphs:get_graphs
	   };
       });