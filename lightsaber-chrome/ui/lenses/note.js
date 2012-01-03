define(
    ['/ui/lenses/default-lens.js', '/lib/text.js!/ui/lenses/note-template.html'],
    function(defaultlens, template) {
	return {
	    Lens:defaultlens.DefaultLens.extend(
		{
		    className:'note_lens lens',
		    template:template
		}
	    )
	};	
    });
