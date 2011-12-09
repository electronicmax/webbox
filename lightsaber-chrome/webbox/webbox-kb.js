
define(['/webbox/webbox-ns.js'],
       function(ns) {	   
	   var make_kb = function() {
	       return $.rdf.databank([], {base: ns.base, namespaces:ns.ns });
	   };	   
	   return {
	       make_kb:make_kb
	   };
       });