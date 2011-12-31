/*
 namespaces used internally by webbox
 for serializing bits and bobs
 
 todo: this thing should probably read in all sorts of ns's prefix-cc style
*/

define([],
    function() {
	var prefix_to_ns = {
	    'xsd':'http://www.w3.org/2001/XMLSchema#',
	    'rdf':'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
	    'rdfs':'http://www.w3.org/2000/01/rdf-schema#',
	    'scovo':"http://purl.org/NET/scovo#",
	    'dc': 'http://purl.org/dc/elements/1.1/',
	    'foaf':'http://xmlns.com/foaf/0.1/',
	    'doap':'http://usefulinc.com/ns/doap#',
	    'ls':'http://hip.cat/lightsaber#',
	    'plum':'http://projects.csail.mit.edu/connectingme/plum#',
	    'rww': 'http://www.w3.org/2011/10/12-rww#',
	    'emax':'http://hip.cat/emax#',
	    'webbox':'http://webbox.ecs.soton.ac.uk/ns#',
	    'enakting':'http://enakting.org/data/',
	    'enakting_people':'http://enakting.org/people/',
	    'sioc':'http://rdfs.org/sioc/ns#'
	};
	var base = prefix_to_ns.webbox;	
	return _({
		     add_ns:function(prefix,ns) {
			 this[prefix] = ns; prefix_to_ns[prefix] = ns; return ns;
		     },
		     prefixes:function() {  return _(prefix_to_ns).keys(); },		
		     base:base,
		     ns:prefix_to_ns,
		     expand:function(uri,add_base) {
			 var prefcombo = uri.split(':');
			 if (prefcombo.length < 2) {
			     if (add_base) { return base + uri; }
			     return uri;
			 }
			 if (prefcombo[0].indexOf('http') == 0)  {
			     return uri;			     
			 }
			 if (prefix_to_ns[prefcombo[0]]) {
			     return prefix_to_ns[prefcombo[0]] + prefcombo[1];
			 }
			 throw new Error("Unknown ns " + prefcombo[0]);
		     },
		     contract:function(uri) {
			 var matching = _(prefix_to_ns).keys().filter(function(k) { return uri.indexOf(prefix_to_ns[k]) == 0; });
			 if (matching.length > 0) {
			     var mk = matching[0];
			     return mk + ":" + uri.slice(prefix_to_ns[mk].length);
			 }
			 return uri;			 
		     }
		 }).extend(prefix_to_ns);
    });
