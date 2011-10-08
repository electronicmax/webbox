function _background() {
    console.log("Activities is ", window.Activities);
    var Record = Backbone.Model.extend({});
    var WindowWatcher = Backbone.Model.extend(
        {
            initialize:function() {
                var this_ = this;
                this.data = new Activities();
                this.bind("change", function() { this_.change.apply(this_, arguments); });
                chrome.windows.onCreated.addListener(
                    function(window) {
                        console.log("window >> ", window.id);
                        chrome.tabs.getSelected(window.id, function(tab) {  this_.trigger("change", tab.url);   });
                    });
                chrome.windows.onFocusChanged.addListener(
                     function(window) {
                         chrome.tabs.getSelected(window, function(tab) {
                                                     console.log("focus-change ", window, ", tab ", tab);
                                                     this_.trigger("change", tab !== undefined ? tab.url : undefined);
                                                 });                         
                     });                
                chrome.windows.onRemoved.addListener(
                    function(window) {
                        console.log("window::onRemoved", window);                                             
                        this_.trigger("changed", undefined);

                    });
                chrome.tabs.onUpdated.addListener(
                    function(tabid, changeinfo, t) {
                        //                        console.log("CHANGEINFO STATUS ", changeinfo.status); //  { /* skip */ return; }
                        if (changeinfo.status == 'loading') { return; }
                        console.log("window::tab_updated", t.url, changeinfo.status);                        
                        this_.trigger("change", t.url);
                    });
                chrome.tabs.onSelectionChanged.addListener(
                    function(tabid, info, t) {
                        chrome.tabs.getSelected(info.windowId, function(tab) {
                                                     console.log("tabs-selectionchange ", window, ", tab ", tab);
                                                     this_.trigger("change", tab !== undefined ? tab.url : undefined);
                                                 });                         
                    });

            },
            change:function(url) {
                console.log("Page changed ", url);               
            }
        }
    );
    return {
        background : {
            init:function() {
                this.watcher = new WindowWatcher();
            }
        }
    };        
};
