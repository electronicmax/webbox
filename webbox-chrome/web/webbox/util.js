define([],
       function(models) {
	    Date.prototype.toShortStringUK = function(){
		var hours = (this.getHours() < 10 ? "0" : "") + this.getHours();
		var minutes = (this.getMinutes() < 10 ? "0" : "") + this.getMinutes();
		return this.getDate() +  "/" +  this.getMonth() + "/" + this.getFullYear() + " at " + hours + ":" + minutes;
	    };
	    window.DEBUG=true;
	    window.LOG = true;
	    _.mixin({
			capitalize : function(string) {
			    return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase();
			},
			withoutAny:function(src,ofwhat, keyfn) {
			    if (keyfn !== undefined) {
				ofwhat = ofwhat.map(function(x) { return keyfn(x); });
			    }
			    var _ofwhat = _(ofwhat);
			    return src.filter(function(x) {
						  if (keyfn !== undefined) { x = keyfn(x); }
						  return !_ofwhat.contains(x);
					      });
			}
		    });
	    window.debug = function() {
		try{
		    if (DEBUG) {
			console.log.apply(console,arguments);
		    }
		}catch(e) {}
	    };
	    window.log = function() {
		try{
		    if (LOG) {
			console.log.apply(console,arguments);
		    }
		}catch(e) {}
	    };
	    window.error = function() {
		try{
		    console.error.apply(console,arguments);
		}catch(e) {}
	    };

	    function getElementXPath(elt)
	    {
		var path = "";
		for (; elt && elt.nodeType == 1; elt = elt.parentNode)
		{
		    idx = getElementIdx(elt);
		    xname = elt.tagName;
		    if (idx > 1) xname += "[" + idx + "]";
		    path = "/" + xname + path;
		}
		
		return path;
	    }
	    function getElementIdx(elt)
	    {
		var count = 1;
		for (var sib = elt.previousSibling; sib ; sib = sib.previousSibling)
		{
		    if(sib.nodeType == 1 && sib.tagName == elt.tagName)count++
		}
		
		return count;
	    }
	    return {
		is_resource : function(r) {
		    return r && r instanceof $.uri || r instanceof $.rdf.resource;
		},
		edit_distance : function(a,b) {
		    // return the smallest of the three values passed in
		    var minimator = function(x,y,z) {
			if (x < y && x < z) { return x; } 
			if (y < x && y < z) { return y; }
			return z;
		    };
		    var cost;	
		    // get values
		    var m = a.length;
		    var n = b.length;
		    
		    // make sure a.length >= b.length to use O(min(n,m)) space, whatever that is
		    if (m < n) {
			var c=a;a=b;b=c;
			var o=m;m=n;n=o;
		    }
		    
		    var r = [];
		    r[0] = [];
		    for (var c = 0; c < n+1; c++) {
			r[0][c] = c;
		    }
		    
		    for (var i = 1; i < m+1; i++) {
			r[i] = new Array();
			r[i][0] = i;
			for (var j = 1; j < n+1; j++) {
			    cost = (a.charAt(i-1) == b.charAt(j-1))? 0: 1;
			    r[i][j] = minimator(r[i-1][j]+1,r[i][j-1]+1,r[i-1][j-1]+cost);
			}
		    }
		    return r[m][n];
		},
		getXPath:function(elt) {
		    var path = '';  //  && elt.nodeType==1
		    for (; elt && elt.nodeType == 1; elt=elt.parentNode)
		    {
			var idx=$(elt.parentNode).children(elt.tagName).index(elt)+1;
			idx > 1 ? (idx='['+idx+']') : (idx='');
			path='/'+elt.tagName.toLowerCase()+idx+path;
		    }
		    return path;
		},
		getXPath2:function(node,path) {
		    return '/' + this.getXPath2Helper(node,path).join('/');
		},
		getXPath2Helper:function(node, path) {
		    path = path || [];
		    if(node.parentNode) {
			path = arguments.callee(node.parentNode, path);
		    }

		    if(node.previousSibling) {
			var count = 1;
			var sibling = node.previousSibling;
			do {
			    if(sibling.nodeType == 1 && sibling.nodeName == node.nodeName) {count++;}
			    sibling = sibling.previousSibling;
			} while(sibling);
			if(count == 1) {count = null;}
		    } else if(node.nextSibling) {
			var sibling = node.nextSibling;
			do {
			    if(sibling.nodeType == 1 && sibling.nodeName == node.nodeName) {
				var count = 1;
				sibling = null;
			    } else {
				var count = null;
				sibling = sibling.previousSibling;
			    }
			} while(sibling);
		    }

		    if(node.nodeType == 1) {
			path.push(node.nodeName.toLowerCase() + (node.id ? "[@id='"+node.id+"']" : count > 0 ? "["+count+"]" : ''));
		    }
		    return path;
		},
		zip2obj:function(z) {
		    var o = {};
		    _(z).map(function(x) {  o[x[0]] = x[1];   });
		    return o;
		},
		randomlyPick:function(l) {
		    return l[Math.floor(l.length*Math.random())];
		},    
		txt2html: function(oldText) {
		    var newText = oldText.replace(/</g,'&lt;');
		    newText = newText.replace(/>/g,'&gt;');
		    newText = newText.replace(/\n/g,'<br>');
		    newText = newText.replace(/&lt;(\/?)(b|i|em|strong|sub|sup|u|p|br|ins|del|strike|s)&gt;/ig,
					      "<$1$2>");
		    newText = newText.replace(/((mailto\:|javascript\:|(news|file|(ht|f)tp(s?))\:\/\/)[A-Za-z0-9,\.:_\/~%\-+&#?!=()@\x80-\xB5\xB7\xFF]+)/g,
					      "<a onclick=\"openLink(event);\" href=\"$1\">$1</a>");
		    newText = newText.replace(/<a onclick=\"openLink\(event\);\" href=\"(((http(s?))\:\/\/)?[A-Za-z0-9\._\/~\-:]+\.(?:png|jpg|jpeg|gif|bmp))\">(((http(s?))\:\/\/)?[A-Za-z0-9\._\/~\-:]+\.(?:png|jpg|jpeg|gif|bmp))<\/a>/g,
					      "<img src=\"$1\" alt=\"$1\"/>");
		    newText = newText.replace(/  /g,' &nbsp;');
		    newText = newText.replace(/\t/g,' &nbsp;&nbsp;&nbsp&nbsp;');
		    
		    return newText;
		},
		intRange: function(low,high,skip)  {
		    if (arguments.length == 1) {
			high = low; low = 0; 
		    }
		    var result = [];
		    if (skip === undefined) { skip = 1; }
		    for (var i = low; i < high; i += skip) {
			result.push(i);
		    }
		    return result;    
		},
		refang: function(oldText) {
		    var newText = oldText.replace(/&lt;/g,'<');
		    newText = newText.replace(/&gt;/g, '>');
		    newText = newText.replace(/<br>/g, '\n');
		    newText = newText.replace(/&nbsp;/g, ' ');
		    return newText;
		},
		guid: function(len) {
		    var alphabet = 'abcdefghijklmnopqrstuvwxyz1234567890';
		    if (!len) { len = 12; }
		    var s = '';
		    for (var i = 0; i < len; i++) {
			s += alphabet[Math.floor(alphabet.length*Math.random())];
		    }
		    return s;
		}
	    };	    
	});
