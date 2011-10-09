
function Stars(el,num_stars) {
    var this_ = this;
    this.el = el;
    this.render(num_stars);
    var stars = $(this.el).children(".star");
    $(this.el).children(".star").mouseover(function(el) {
                                               // console.log("you hovered over ", el.currentTarget);
                                               var i = stars.index($(el.currentTarget));

                                               // highlight everything >=
                                               stars.each(function(j) {
                                                              if (j <= i) {
                                                                  $(this).addClass("star_highlight");
                                                              } else {
                                                                  $(this).removeClass("star_highlight");
                                                              }
                                                          });
                                               
                                               console.log(i, $(this_.el).children(".star").length, $(this_.el).children(".star_highlight").length);
                                           });;
};

Stars.prototype = {
    render:function(n) {
        var star = '<span class="star">&#x2605;</span>';
        var s = '';
        for (var i = 0; i < n; i++) {
            s = s + star;
        };
        $(this.el).html(s);
    }
};

