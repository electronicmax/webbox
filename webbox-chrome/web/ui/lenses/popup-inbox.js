define(
    ['/web/ui/lenses/default-lens.js', '/web/lib/text.js!/web/ui/lenses/popup-inbox-template.html'],
    function(defaultlens, template) {
	return {
	    Lens:defaultlens.DefaultLens.extend({
						    className:"popup_inbox_lens lens",
						    template:template
						})
	};	
    });
