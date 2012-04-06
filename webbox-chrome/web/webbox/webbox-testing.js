define(
    ['/web/webbox/webbox-ns.js', '/web/webbox/webbox-model.js', '/web/webbox/util.js', '/web/webbox/webbox-config.js', '/web/webbox/webbox-kb.js'],
    
    function(ns,m,util,config, wkb) {
	
	m.disable_caching();
	
	var t1 = function() {
	    var f = m.get_resource("http://unit.tests.com/t1");
	    var f2 = m.get_resource("http://unit.tests.com/t2");
	    var d = new $.Deferred();
	    var age = Math.round(100*Math.random());
	    var name = "test1-"+util.guid(10);
	    f.set({name:name, age:age,lover:f2});
	    f.save().then(
		function() {
		    var g = m.get_resource("http://unit.tests.com/t1");
		    g.fetch().then(function(x) {
				       console.assert(g.get("name") == name, "name !== ", name, g.get("name"));
				       console.assert(g.get("age") == age, "age !==  ", age, g.get("name"));
				       console.assert(g.get("lover")  && g.get("lover").uri == "http://unit.tests.com/t2", " lover ", g.get("lover"));
				       d.resolve();
				   });
		});
	    return d.promise();	    
	};
	var tests = [t1]; // add unit tests here

	var make_person = function(first, last, seed, add_guid) {
	    var uri = ns.expand('enakting_test:'+[first, last, (seed ? seed :''), (add_guid ? "_"+util.guid() : '')].filter(function(x) { return x.length > 0; }).join('_'));
	    var props = {};
	    props[ns.expand('foaf:givenName')] = first;
	    props[ns.expand('foaf:lastName')] = last;		
	    props[ns.expand('rdf:type')] = ns.expand('foaf:Person');
	    // let's not blow up the world right now >> props[ns.expand('webbox:address')] = m.get_resource(config.config.webbox_url);
	    props[ns.expand('foaf:mbox')] = util.guid() + "@mbox.hip.cat"; 
	    props[ns.expand('foaf:page')] = 'http://hip.cat/peeps/' + util.guid();		
	    props[ns.expand('rdfs:label')] = first + " " + last;
	    return new m.Model(props,uri);
	};
	
	var make_people = function() {
	    var seed = util.guid();
	    var objs = {};
	    console.log("Creating 25 people");
	    util.intRange(0,25).map(
		function() {
		    var u = make_person(
			util.randomlyPick(['Cat', 'Nichola', 'Nigel', 'Jack', 'Peter','Susan', 'monica', 'Daniel', 'Yang', 'Nick', 'Hugh', 'Ian', 'Tim', 'Wendy', 'Antonio', 'Igor']),
			util.randomlyPick(['Shadbolt', 'Smith', 'Need', 'Electron', 'Yang', 'Gibbins', 'Berners-Lee', 'Hall', 'Penta', 'schraefel', 'West', 'Saunders', 'Popov']),
			seed,
			true);
		    objs[u.url()] = u;
		    console.log(u.url(), u);
		    u.save();
		});
	    return objs;
	};

	var make_places = function() {
	    var places = ["Building 32","Robot fortress", "Hartley Library", "The Stag\'s", "SUSU Cafe", "Student Union", "Arlott Bar (Staff Club)", "Staff Club", "Trago Lounge" ];
	    var cs = places.map(function(place) {
			   var uri = ns.expand("enakting:"+place.replace(/ /g,'_').toLowerCase());
			   var options = {};
			   options[ns.expand('rdfs:label')] = place;
			   options[ns.expand('rdf:type')] = ns.expand('webbox:Place');
			   var mn = new m.Model(options,uri);
			   mn.save();
			   return mn;
		       });
	    var place = m.get_resource(ns.expand('webbox:Place'));
	    var options = {};
	    options[ns.expand('rdfs:label')] = 'Places';
	    place.set(options);
	    place.save();
	    return cs;
	};
	

	var make_sharing = function() {
	    var a = make_person('Lisbeth', 'Salander', '');
	    a.save();	    
	    var model = m.get_resource(ns.me + "scrap-"+((new Date()).valueOf()));
	    model.set2('rdf:type', wkb.get_resource('webbox:Scrap'));
	    model.set2('webbox:url','http://web.mit.edu');
	    model.set2('webbox:contents', "After all we're all alike");
	    model.set2('rdfs:label', "After all we're all alike");
	    model.set2('sioc:addressed_to', a);
	    model.set2('dc:created',wkb.dateTime(new Date()));			
	    model.set2('webbox:src_page_title','Hackers Manifesto ' + (new Date()).toString());
	    model.save();
	    // now let them save	    
	};

	var make_random_person = function() {
	    var first = "Fred"+util.guid().slice(0,5);
	    var last = "Smith"+util.guid().slice(0,5);
	    var uri = ns.expand('enakting_test:'+[first, last, util.guid()].join('_'));
	    var props = {};
	    props[ns.expand('foaf:givenName')] = "Last name"; 
	    props[ns.expand('foaf:lastName')] = "First name";		
	    props[ns.expand('rdf:type')] = ns.expand('foaf:Person');
	    // let's not blow up the world right now >> props[ns.expand('webbox:address')] = m.get_resource(config.config.webbox_url);
	    props[ns.expand('foaf:mbox')] = util.guid() + "@mbox.hip.cat"; 
	    props[ns.expand('foaf:page')] = 'http://hip.cat/peeps/' + util.guid();		
	    props[ns.expand('rdfs:label')] = first + " " + last + util.guid().slice(0,3);
	    var pp = new m.Model(props,uri);
	    pp.save();
	    console.log(uri);
	    return pp;
	};

	var modify_random_person = function(p) {
	    var newl = p.get(ns.expand('foaf:givenName')) + " " + p.get(ns.expand('foaf:lastName')) + util.guid().slice(0,3);
	    p.set2('rdfs:label', newl);
	    p.save();
	    return p;    
	};

	var make_random_person_with_webbox_address = function(addr) {
	    var first = "Danielistair"+util.guid().slice(0,5);
	    var last = "Smithi"+util.guid().slice(0,5);
	    var uri = addr; // ns.expand('enakting_test:'+[first, last, util.guid()].join('_'));
	    var props = {};
	    props[ns.expand('foaf:givenName')] = first;
	    props[ns.expand('foaf:lastName')] = last;
	    props[ns.expand('rdf:type')] = ns.expand('foaf:Person');
	    props[ns.expand('webbox:address')] = addr;
	    props[ns.expand('rdfs:label')] = first + " " + last + util.guid().slice(0,3);
	    var pp = m.get_resource(uri);
            pp.attributes = {};
            pp.set(props);
	    pp.save();
	    return pp;
	};        
	
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
	    get_graphs:wkb.get_graphs,
	    make_people:make_people,
	    make_places:make_places,
	    make_sharing:make_sharing,
	    make_random_person:make_random_person,
	    make_random_person_with_webbox_address:make_random_person_with_webbox_address,
	    modify_random_person:modify_random_person
	};	
    });


/* old bits

 	var make_bookmarks = function() {	    
	    var mk_bkmk = function(name,url) {
		var bkmk = m.get_resource( ns.expand(url.replace(/ /g,'_').toLowerCase()));
		// omit type
		bkmk.set2("rdfs:label", name);
		bkmk.set2("webbox:href", url);
		return bkmk;
	    };;

	    var mk_bkmks = function(kv, typeuri, typelabel) {
		var typeclass = m.get_resource( ns.expand(typeuri));
		typeclass.set2("rdfs:label", typelabel);
		typeclass.save();
		return _(kv).keys().map(
		    function(k) {
			var m = mk_bkmk(k,kv[k]);
			m.set2("rdf:type", typeclass);
			m.save();
			return m;
		    });
	    };

	    mk_bkmks({
			 "Google Public Data": 'http://www.google.com/publicdata/home',
			 "Data.gov.uk": "http://www.data.gov.uk",
			 "OS OpenData": "http://www.ordnancesurvey.co.uk/oswebsite/opendata/",
			 "London datastore": "http://data.london.gov.uk/",
			 "Dbpedia": "http://dbpedia.org"
		     },
		     ns.expand("webbox:OpenDataBookmarks"),
		     "Open Data Resources");	    

	    mk_bkmks({
			 'Backbone.js' : 'http://documentcloud.github.com/backbone/',
			 'Underscore.js' : 'http://documentcloud.github.com/backbone/',
			 'Less.js' : 'http://lesscss.org/',
			 'Require.js' : 'http://requirejs.org/',
			 'jQuery' : 'http://jquery.org/',
			 'NodeJS' : 'http://nodejs.org/'
		     },
		     ns.expand("webbox:JavascriptBookmarks"),
		     "Javascript Resources");	  	    

	};
*/