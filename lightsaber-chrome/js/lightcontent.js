// lightcontent.js - content script for running in DOMspace
// in this environment, window = the window of the page 
// var background = chrome.extension.connect();

var Annotation = Backbone.View.extend(
    {
        template:'<div class="annotation"><button value="close"></button><textarea></textarea></div>',
        initialize:function() {
            
        }
    }
);

function LightsaberUI() {
    var this_ = this;
    this.port = chrome.extension.connect();
    this.port.onMessage.addListener(function(msg) {  this_.dispatchMessage(msg);   });
};

LightsaberUI.prototype = {
    setup:function() {
        // load annotations from triple store
        this.port.postMessage({ cmd:'load_annotations', url: location.href, text: $('body').text() });                               
    },
    dispatchMessage:function(msg) {
        switch (msg.cmd) {
            case 'annotations_loaded':
            console.log("Got annotations ", msg);
            break;            
        }
    }
};

$(document).ready(
    function() {
        window.lsui = new LightsaberUI();
        lsui.setup();
        // console.log("--- content script ready");
        // console.log($("body").rdf().databank.tripleStore);
        // jQuery("div:last").each(function(i) {  new Stars($(this), 15);     });
    });

