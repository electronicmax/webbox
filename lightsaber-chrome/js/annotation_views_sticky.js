window.StickyAnnotationView = Backbone.View.extend(
    {
        template:'<div class="annotation"><div class="close">X</div><textarea><%= contents %></textarea></div>',
        initialize:function() {
            console.log("Sticky initialize", this.options.model);
            var m = this.options.model;
            // make sure it has required bits
            var dirty = false;
            console.log(" m get location ", m.get("location"));
            if (m.get("location") == undefined) {
                m.set({location:{ top: this.options.location ? this.options.location.y : 100, left: this.options.location ? this.options.location.x : 100 }});
                dirty=true;
            }
            if (!m.get("width")) { m.set({width:200}); dirty = true; }
            if (!m.get("height")) { m.set({height:150}); dirty = true; }        
            if (dirty) { console.log("Saving model ", m); m.save(); }
            this.dom = this.render();
            this.anchor_dom = this.options.component || this.getNodeFromXPath(this.options.model.get("anchor_xpath")); // !this.options.component ? this.get_anchor() : this.options.component;
            if (this.anchor_dom) {
                this.render_anchor(this.anchor_dom);
                if (m.get("anchor_xpath") === undefined) {
                    m.set({anchor_xpath:util.getXPath2(this.anchor_dom)});
                    console.log("model updated now ", m.attributes);
                }
                m.save();
            }
        },
        getNodeFromXPath:function(xp) {
            var d = document.evaluate(xp,document);
            var nodes = [];
            var n;
            while (d && (n = d.iterateNext())) {
                nodes.push(n);
            }
            return nodes.length ? nodes[0] : undefined;            
        },
        render:function() {
            var this_ = this;
            var d = $( _.template(this.template)(this.options.model.attributes) );
            d.data("view", this);
            d.css("left", this.options.model.get("location").left);
            d.css("top", this.options.model.get("location").top);
            d.css("width", this.options.model.get("width"));
            d.css("height", this.options.model.get("height"));
            $(d).draggable();
            $(d).resizable();
            $(d).css("position","absolute");
            $(d).find(".close").click(function() { this_.hide(); });
            $(d).find("textarea").focus(function() { this_.focused(); });
            $(d).find("textarea").blur(function() { this_.blurred(); });
            return d;            
        },
        get_anchor:function() {
            // find closest textnode to the dude
            var anchor_text = this.model.get("anchor_text").trim();
            if (anchor_text.length == 0) { return ; }
            // method 0: containment
            console.log("anchor text ", anchor_text);
            var hits = [];
            $('h1, h2, h3, h4, h5, h6, li, span, div, td, p')
                .each(function() {
                          var t = $(this).text().trim();
                          if (t.length == 0) { return 10000000000000; }
                          if (t.indexOf(anchor_text) >= 0) {
                              hits.push([util.getXPath2(this),this]);
                          }
                          return -1;
                      });            
            // duplicate elim
            hits = hits.filter(function(x) {
                                   // hypothesis : x is the deepest
                                   // then, there will be nothing _deeper_ that is not itself
                                   return hits.filter(function(y) { return x[0] !== y[0] && y[0].indexOf(x[0]) >= 0; }).length == 0;
                               });
            // console.log("hits ", hits.map(function(x) { return x.name; }));
            // console.log("hits !! ", hits);
            hits = hits.map(function(x) { return x[1]; });
            return hits;
        },
        render_anchor:function(x) {
            var this_ = this;
            $(x).addClass("annotation_anchor");
            $(x).click(function() {
                           if (!$(this_.dom).is(":visible")) {  this_.show();      }
                       });
        },
        focused:function() { console.log("focused"); $(this.dom).addClass("focused"); },
        blurred:function() { console.log("blurred"); $(this.dom).removeClass("focused"); },
        hide:function() { $(this.dom).slideUp();  },
        show:function() { $(this.dom).slideDown(); }
    }
);
