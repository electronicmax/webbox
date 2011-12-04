define([],
	function() {
	    console.log("window watcher init >> ");
	    var ww = Backbone.Model.extend(
		    {
			initialize:function() {
			    var this_ = this;
			    this.bind("change", function() { this_.change.apply(this_, arguments); });
			    chrome.windows.onCreated.addListener(
				function(window) {
				    chrome.tabs.getSelected(window.id, function(tab) {
								/* this_.injectContentScripts(tab); */
								this_.trigger("changed", tab.url);
							    });
				});
			    chrome.windows.onFocusChanged.addListener(
				function(window) {
				    chrome.tabs.getSelected(window.id, function(tab) {
								this_.trigger("changed", tab !== undefined ? tab.url : undefined);
							    });                         
				});                
			    chrome.windows.onRemoved.addListener(function(window) {
								     this_.trigger("changed", {type:"closed"});
								 });
			    chrome.tabs.onUpdated.addListener(
				function(tabid, changeinfo, t) {
				    if (changeinfo.status == 'loading') { return; }
				    // this_.injectContentScripts(t);                        
				    this_.trigger("changed", t.url);
				});
			    chrome.tabs.onSelectionChanged.addListener(
				function(tabid, info, t) {
				    chrome.tabs.getSelected(info.windowId, function(tab) {
								this_.trigger("changed", tab !== undefined ? tab.url : undefined);
							    });                         
				});

			},
			change:function(url) { }
		    });
	    console.log("returning ", ww);
            return {
		blah:123,
		WindowWatcher : ww
	    };
	});
