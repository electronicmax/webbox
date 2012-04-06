require(
    ['/web/webbox/webbox-ns.js','/web/webbox/webbox-model.js'],
    function(ns,webbox) {
	var AnnotationModel = webbox.Model.extend(
	    {
		initialize:function() {
		    this.uri = ns.ls + this.id; 
		},
		save:function() {
		    // returns a promise 
		    return window.backgroundCommand({ cmd: "save",  data: this.toJSON() });
		}
	    }
	);	
	var AnnotationCollection = Backbone.Collection.extend(
	    {
		initialize:function() {
		}
	    }
	);
	return {
	    AnnotationModel:AnnotationModel,
	    AnnotationCollection:AnnotationCollection
	};
    });