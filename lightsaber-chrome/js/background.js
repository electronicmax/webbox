define(
    ['lightsaber','window_watcher'],
    function(ls, ww) {
	console.log("ls ", ls, " ww ", ww);
	var watcher = new ww.WindowWatcher();
	var ls = new ls.Lightsaber(watcher);	    	    
	// mechanism with which models may issue requeests
	// but since we're alreayd the bk page, we just execute them.
	window.backgroundCommand = function(cmd) {
	    var d = new $.Deferred();
	    var ret = ls.dispatch(cmd, undefined); // party.
	    d.resolve(ret);
	    return d;
	};
	watcher.bind("changed", function(x) { console.log("changed ", x); });
	return {};
    });