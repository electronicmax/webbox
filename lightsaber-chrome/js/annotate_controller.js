_(window.LightSaber).extend(
    (function() {
        var Annotroller = function(lightsaber) {
            this.ls = lightsaber;
            this.initialize();
        };
        Annotroller.prototype = {
            initialize:function() {
                var this_ = this;
                this.cmenu = chrome.contextMenus.create(
                    {
                        type: "normal", title:"add annotation", contexts:["selection", "link"],
                        onclick:function(o) { this_.start_annotation(o);  }
                    },
                    function(o) {
                        console.log("created --");
                    }
                );
            },
            start_annotation:function(info) {
                console.log("annotation info" , info);                
            }
        };
        return {
            Annotroller : Annotroller
        };
    }()));