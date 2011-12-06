define(
    ['/webbox/webbox-ns.js', '/webbox/webbox-model.js', '/webbox/util.js', '/webbox/webbox-config.js'],
    function(ns,m,util,config) {
	var t1 = function() {
	    var f = new m.Model({},"http://unit.tests.com/t1");
	    var f2 = new m.Model({},"http://unit.tests.com/t2");
	    var d = new $.Deferred();
	    var age = Math.round(100*Math.random());
	    var name = "test1-"+util.guid(10);
	    f.set({name:name, age:age,lover:f2});
	    f.save().then(function() {

					     console.log(" saving complete -----------, fetching ");
					     var g = new m.Model({},"http://unit.tests.com/t1");
					     g.fetch().then(function(x) {
								console.log("finished fetching ", x.url(), g.url(), x.toJSON(), g.toJSON());
								window.G = g;
								console.log("testing");
								console.assert(g.get("name") == name, "name !== test1 ",g.get("name"));
								console.assert(g.get("age") == age, "age !== 2398 ", g.get("name"));
								console.assert(g.get("lover")  && g.get("lover").uri == "http://unit.tests.com/t2", " lover ", g.get("lover"));
								d.resolve();
							    });
			  });
	    return d.promise();	    
	};

	var tests = [t1];
	return {
	    run: function() {
		console.log("runnnnnnnnnnnn", tests.length);
		util.intRange(tests.length).map(
		    function(i) {
			console.log(i);
			console.group();
			console.log("Test ", i);
			tests[i]().then(function() { console.log("if no errors, passed T1"); });	
		    });
	    }
	};	
    });
