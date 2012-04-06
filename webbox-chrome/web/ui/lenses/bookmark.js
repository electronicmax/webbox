define(
    ['/web/ui/lenses/default-lens.js', '/web/lib/text.js!/web/ui/lenses/bookmark-template.html'],
    function(defaultlens, template) {
	var Lens = defaultlens.DefaultLens.extend(
	    {
		template:template
	    });	
	return {
	    Lens:Lens
	};	
    });
