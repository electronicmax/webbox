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
                        chrome.tabs.getSelected(window, function(tab) {
                                                    this_.trigger("change", tab.url);
                                                });
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

                setInterval(function() {
                                     if (this_.current_record !== undefined) {
                                         this_.change(this_.current_record.get("location"));
                                     }                                     
                                 }, 200);

            },
            change:function(url) {
               if (this.current_record !== undefined) {
                   if (url == this.current_record.get("location")) {
                       this.current_record.set({end:new Date()});
                       return; 
                   }
                   delete this.current_record;
                   this.trigger("new_record", this.current_record);
               }
               if (url !== undefined) {
                   var now = new Date();
                   this.current_record = this.make_record({start: now, end:now, to: url, location: url});
                   this.data.add(this.current_record);                   
               }
            },
            make_record:function(options) {
                if (options.id === undefined) { options.id = util.guid(); }
                return new Activity(options);
            }
        }
    );
    return {
        background : {
            init:function() {
                this.watcher = new WindowWatcher();
            },
            get_streams:function() {
                return [this.watcher.data];                
            }
        },
        Record:Record
    };        
};
