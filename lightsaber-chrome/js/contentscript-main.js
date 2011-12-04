

require(
    "contentscript-main",
    ["annotation-controller", "annotation-models"],
    function(controller, models) {
	
	function LightsaberUI() {
	    var this_ = this;
	    // communication w/ the backend
	    this.message_handlers = {};
	    chrome.extension.onRequest.addListener(function(msg, sender, sendResponse)  {   sendResponse({data:this_.dispatchMessage(msg)});   });
	    // instantiate controller
	    this.ahandler = new controller.AnnotationController(this);
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
    }
);