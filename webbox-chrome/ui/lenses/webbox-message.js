define(
    ['/ui/lenses/default-lens.js', '/lib/text.js!/ui/lenses/webbox-message-template.html'],
    function(defaultlens, template) {
	return {
	    Lens:defaultlens.DefaultLens.extend({
						    className:"message_lens lens",
						    template:template
						})
	};	
    });
