/*
 namespaces used internally by webbox
 for serializing bits and bobs
 
 todo: this thing should probably read in all sorts of ns's prefix-cc style
*/

define([],
    function() {
	var base = "http://hip.cat/webbox/";
	var prefix_to_ns = {
	    'xsd':'http://www.w3.org/2001/XMLSchema',
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
	    'webbox':'http://hip.cat/webbox/'
	};
	return _({
		     add_ns:function(prefix,ns) { this[prefix] = ns; prefix_to_ns[prefix] = ns; return ns; },
		     prefixes:function() {  return _(prefix_to_ns).keys(); },		
		     base:base,
		     ns:prefix_to_ns
		 }).extend(prefix_to_ns);
    });
