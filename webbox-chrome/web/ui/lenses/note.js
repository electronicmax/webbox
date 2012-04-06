define(
    [
        '/web/ui/lenses/default-lens.js',
        '/web/webbox/webbox-kb.js',
        '/web/lib/text.js!/web/ui/lenses/note-template.html',
        '/web/ui/pretext.js'
    ],
    function(defaultlens, wkb, template, pretext) {
	return {
	    Lens:defaultlens.DefaultLens.extend(
		{
		    className:'note_lens lens',
		    template:template,
		    events: {
                        'click .close': '_cb_kill',
		        'keyup .contents': '_cb_edit'                        
                    },
		    _cb_kill:function() { this.trigger('kill'); },
		    _cb_edit:function(evt) {
		        var contents = $(evt.currentTarget).getPreText(); // .text().trim();
		        var m = this.options.model;
		        m.set2('webbox:contents', contents);
		        m.save();
		        console.log("saving ... ", m.uri, contents);
		    },
                    setPosition:function(p) {
                        if (p.left !== undefined) { $(this.el).css('left', p.left); }
                        if (p.top !== undefined) { $(this.el).css('top', p.top); }
                        if (p.bottom !== undefined) { $(this.el).css('bottom', p.bottom); }
                        if (p.right !== undefined) { $(this.el).css('right', p.right); }
                    }
		}
	    )
	};	
    });
