// lightcontent.js - content script for running in DOMspace
// in this environment, window = the window of the page 
// var background = chrome.extension.connect();

var PageAnnotations = function(lightsaber) {
    var this_ = this;
    this.annotations = new AnnotationCollection();
    this.ls = lightsaber;
    _(this.message_handlers).keys().map(
        function(h) {
            lightsaber.setMessageHandler(h, function() { this_.message_handlers[h].apply(this_,arguments); });
        });
    this.set_up_mouse_listener();
};

PageAnnotations.prototype = {
    annotation_type_views : {
        sticky : StickyAnnotationView
    },    
    message_handlers: {
        "add_annotation":function(data) {
            console.log("add annotation event received ", data);
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
        $('body').mouseup(
            function(evt) {
                // console.log("event click ", evt.pageX, " ", evt.pageY);
                this_.last_click = { x : evt.pageX, y: evt.pageY };
            });
    },    
    showAnnotation:function(annotation_model) {
        var m = new AnnotationModel(annotation_model);
        var aui;
        // generalize to multiple annotation types        
        if (m.get("annotation_type")  &&  this.annotation_type_views[m.get('annotation_type')]) {
            aui = new (this.annotation_type_views[m.get("annotation_type")])({
                                                                                 model:m,
                                                                                 location:this.last_click
                                                                             });
        }
        if (!aui) { return; }
        this.annotations.add(aui);
        $("body").append(aui.dom);
    },
    updateAnnotation: function(annotation_model) {
        var v = this.annotations.filter(function(x) { return x.options.model.id == annotation_model.id; });
        if (!v.length) {  return;    }
        v[0].update_model(new AnnotationModel(annotation_model));   
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

function LightsaberUI() {
    var this_ = this;
    // communication w/ the backend
    this.message_handlers = {};
    chrome.extension.onRequest.addListener(function(msg, sender, sendResponse)  {   sendResponse({data:this_.dispatchMessage(msg)});   });
    // instantiate controller
    this.ahandler = new PageAnnotations(this);
};

LightsaberUI.prototype = {
    getEntitiesinPage:function() {
        // TODO 
        return [];
    },
    setup:function() {
        // TODO ---         
    },
    dispatchMessage:function(msg) {
        if( this.message_handlers[msg.cmd] ) {
            return this.message_handlers[msg.cmd](msg);
        } else {
            // console.log("Did not know how to handle ", msg);
        }
        return undefined;
    },
    setMessageHandler:function(msg_cmd, listener) {
        this.message_handlers[msg_cmd] = listener;
    }
};

window.backgroundCommand = function(data) {
    var d = new $.Deferred();
    chrome.extension.sendRequest(data,function(x) { d.resolve(x); });
    return d.promise();
};

$(document).ready(
    function() {
        var lsui = new LightsaberUI();
        window.lsui = lsui;
        lsui.setup();
    });

