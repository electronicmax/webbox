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
            this.anchor_dom = this.render_anchor();
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
        render_anchor:function() {
            // find closest textnode to the dude
            var anchor_text = this.model.get("anchor_text").trim();
            console.log("ANCHOR TEXT ", anchor_text);
            if (anchor_text.length == 0) { return ; }
            
            var distances = [];
            $('h1, h2, h3, h4, h5, h6, li, span, p, div, td')
                .contents()
                .each(function() {
                          var t = $(this).text().trim();
                          if (t.length == 0) { return 10000000000000; }
                          var shorter = t.length < anchor_text.length ? t : anchor_text;
                          var longer = t.length > anchor_text.length ? t : anchor_text;
                          var ed = util.edit_distance(t,anchor_text) / 1.0*longer.length;
                          distances.push( [this, ed] );
                      });

            distances.sort(function(a,b){ return a[1] - b[1]; });
            console.log("Winner is ", distances[0][0], distances);
            
/*            
            var hits = $('body')
                .contents()
                .filter(function() {
                            return this.nodeType == Node.TEXT_NODE && $(this).text().indexOf(anchor_text) >= 0 || anchor_text.indexOf($(this).text()) >= 0;
                        });
*/
            var hits = [distances[0][0]];
            if (hits.length == 0) { console.log("annotation_anchor = no love"); }
            hits.map(function(x) {  console.log("Adding annotation_anchor to ", x); $(x).addClass("annotation_anchor");   });
            this.anchor_hits = hits;
        },
        focused:function() { console.log("focused"); $(this.dom).addClass("focused"); },
        blurred:function() { console.log("blurred"); $(this.dom).removeClass("focused"); },
        hide:function() { $(this.dom).slideUp();  },
        show:function() { $(this.dom).slideDown(); }
    }
);
