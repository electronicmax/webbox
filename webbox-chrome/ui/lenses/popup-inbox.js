define(
    ['/ui/lenses/default-lens.js', '/lib/text.js!/ui/lenses/popup-inbox-template.html'],
    function(defaultlens, template) {
	return {
	    Lens:defaultlens.DefaultLens.extend({
						    className:"popup_inbox_lens lens",
						    template:template
						})
	};	
    });
