define(
    ['/ui/lenses/default-lens.js', '/lib/text.js!/ui/lenses/bookmark-template.html'],
    function(defaultlens, template) {
	var Lens = defaultlens.DefaultLens.extend(
	    {
		template:template
	    });	
	return {
	    Lens:Lens
	};	
    });
