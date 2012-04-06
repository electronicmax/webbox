define(
    ['/web/ui/lenses/default-lens.js', '/web/lib/text.js!/web/ui/lenses/scrap-template.html'],
    function(defaultlens, template) {
	return {
	    Lens:defaultlens.DefaultLens.extend(
		{
		    template:template
		}
	    )
	};	
    });
