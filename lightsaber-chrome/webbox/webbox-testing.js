define(
    ['/webbox/webbox-ns.js', '/webbox/webbox-model.js', '/webbox/util.js', '/webbox/webbox-config.js', '/webbox/webbox-kb.js'],
    
    function(ns,m,util,config, wkb) {
	var t1 = function() {
	    var f = new m.Model({},"http://unit.tests.com/t1");
	    var f2 = new m.Model({},"http://unit.tests.com/t2");
	    var d = new $.Deferred();
	    var age = Math.round(100*Math.random());
	    var name = "test1-"+util.guid(10);
	    f.set({name:name, age:age,lover:f2});
	    f.save().then(
		function() {
		    var g = new m.Model({},"http://unit.tests.com/t1");
		    g.fetch().then(function(x) {
				       console.assert(g.get("name") == name, "name !== ", test1, g.get("name"));
				       console.assert(g.get("age") == age, "age !==  ", age, g.get("name"));
				       console.assert(g.get("lover")  && g.get("lover").uri == "http://unit.tests.com/t2", " lover ", g.get("lover"));
				       d.resolve();
				   });
		});
	    return d.promise();	    
	};
	var tests = [t1]; // add unit tests here
	return {
	    run: function() {
		util.intRange(tests.length).map(
		    function(i) {
			console.log(i);
			console.group();
			console.log("Test ", i);
			tests[i]().then(function() { console.log("if no errors, passed T1"); });	
		    });
	    },
	    get_graphs:wkb.get_graphs
	};	
    });
