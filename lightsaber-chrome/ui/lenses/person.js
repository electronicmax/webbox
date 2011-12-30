define(['/ui/lenses/default-lens.js', '/lib/text.js!/ui/lenses/person-template.html'],
    function(defaultlens, template) {
	return {
	    Lens:defaultlens.DefaultLens.extend({  template:template })
	};	
    });
