
function Stars(el,num_stars) {
    var this_ = this;
    this.el = el;
    this.render(num_stars);
    var stars = $(this.el).children(".star");
    $(this.el).children(".star").mouseover(function(el) {
                                               // console.log("you hovered over ", el.currentTarget);
                                               // if (this_.get_value() !== undefined) { return; }
                                               var i = stars.index($(el.currentTarget));
                                               this_.make_outline(i);                                               
                                               // console.log(i, $(this_.el).children(".star").length, $(this_.el).children(".star_highlight").length);
                                           }).click(function(el) {
                                                        var i = stars.index($(el.currentTarget));
                                                        this_.set_value(i);
                                                        this_.make_outline(undefined);
                                                    }).mouseout(function(el) { this_.make_outline(undefined); });
    

    $(this.el).children('.clear').click(function() {
                                            this_.set_value(undefined);
                                        });
};

Stars.prototype = {
    empty:"&#x2606;",
    filled:"&#x2605;",
    outline:"&#x2730;",
    cancel:"&#x2716;",
    render:function(n) {
        var star = '<span class="star">'+this.empty+'</span>';
        var s = '&nbsp; <span class="clear">'+this.cancel+'</span> - ';        
        for (var i = 0; i < n; i++) {
            s = s + star;
        }

        $(this.el).html(s);
    },
    set_value:function(i) {
        this.value = i;
        this.fill(i);
        this.make_outline(i);
    },
    get_value:function(i) {
        return this.value;
    },
    fill:function(i) {
        var this_ = this;
        if (i == undefined) { i = -1; };
        var stars = $(this.el).children(".star");
        stars.each(function(j) {
                       if (j <= i) {
                           $(this).html(this_.filled);
                       } else {
                           $(this).html(this_.empty);
                       }
                   });        
    },
    make_outline:function(i) {
        var this_ = this;
        if (i == undefined) { i = -1; };
        var stars = $(this.el).children(".star");
        stars.each(function(j) {
                       if (j <= i) {
                           $(this).css("text-decoration", "underline"); 
                       } else {
                           $(this).css("text-decoration", ""); 
                       }
                   });        
    }    
    
};

