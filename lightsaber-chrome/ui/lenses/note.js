define(
    ['/ui/lenses/default-lens.js', '/lib/text.js!/ui/lenses/note-template.html'],
    function(defaultlens, template) {
	return {
	    Lens:defaultlens.DefaultLens.extend(
		{
		    className:'note_lens lens',
		    template:template,
		    events: {	'click .close': '_cb_kill'   },
		    _cb_kill:function() { this.trigger('kill'); }
		}
	    )
	};	
    });
