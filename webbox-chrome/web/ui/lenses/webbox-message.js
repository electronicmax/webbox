define(
    ['/web/ui/lenses/default-lens.js', '/web/lib/text.js!/web/ui/lenses/webbox-message-template.html'],
    function(defaultlens, template) {
	return {
	    Lens:defaultlens.DefaultLens.extend({
						    className:"message_lens lens",
						    template:template
						})
	};	
    });
