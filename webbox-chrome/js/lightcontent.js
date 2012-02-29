// lightcontent.js - content script for running in DOMspace
// in this environment, window = the window of the page 
// var background = chrome.extension.connect();
require(
    ["annotation_models"],
    function(amodels) {	
	var AnnotationController = function(lightsaber) {
	    var this_ = this;
	    this.annotations = new amodels.AnnotationCollection();
	    this.ls = lightsaber;
	    _(this.message_handlers).keys().map(
		function(h) {
		    lightsaber.setMessageHandler(h, function() { this_.message_handlers[h].apply(this_,arguments); });
		});
	    this.set_up_mouse_listener();
	};
	AnnotationController.prototype = {
	    annotation_type_views : {
		sticky : StickyAnnotationView
	    },    
	    message_handlers: {
		"add_annotation":function(data) {
		    // console.log("add annotation event received ", data);
		    if (this.isRelevantToPage(data)) {
			this.showAnnotation(data);
		    }
		},
		"annotation_changed":function(data) {
		    if (this.isRelevantToPage(data)) { this.updateAnnotation(data); }  
		},
		"annotations_loaded":function(annmodels) {
		    var this_ = this;
		    annmodels.map(function(x) { return this_.isRelevantToPage(data) ? this_.showAnnotation(x) : 0; });                                        
		}
	    },
	    set_up_mouse_listener:function() {
		// we want to keep track of last clicks so that we can figure out where
		// to initially place our annotation
		var this_ = this;
		$('body').mousedown(
		    function(evt) {
			// console.log("event click ", evt.pageX, " ", evt.pageY);
			// console.log(" current target ", evt.currentTarget, " -- ", evt.target, evt);
			this_.last_click = { x : evt.pageX, y: evt.pageY };
			this_.last_target = evt.target;
		    });
	    },    
	    showAnnotation:function(annotation_model) {
		var m = new amodels.AnnotationModel(annotation_model);
		var aui;
		// generalize to multiple annotation types        
		if (m.get("annotation_type")  &&  this.annotation_type_views[m.get('annotation_type')]) {
		    aui = new (this.annotation_type_views[m.get("annotation_type")])({
											 model:m,
											 location:this.last_click,
											 component:this.last_target
										     });
		}
		if (!aui) { return; }
		this.annotations.add(aui);
		$("body").append(aui.dom);
	    },
	    updateAnnotation: function(annotation_model) {
		var v = this.annotations.filter(function(x) { return x.options.model.id == annotation_model.id; });
		if (!v.length) {  return;    }
		v[0].update_model(new amodels.AnnotationModel(annotation_model));   
	    },
	    isRelevantToPage:function(data) {
		return (data.url == window.location.href) || (this.ls.getEntitiesinPage().indexOf(data.referred) >= 0);
	    },    
	    setup:function() {
		backgroundCommand({cmd:"load_annotations", url: location.href,  text: $('body').text()},
				  function(c) {
				      console.log("got back ", c);
				  });
	    }
	};

	return {
	    AnnotationController:AnnotationController
	}
    });

