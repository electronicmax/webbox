
var AnnotationModel = Backbone.Model.extend(
    {
        initialize:function() {
        },
        save:function() {
            // returns a promise 
            return window.backgroundCommand({ cmd: "save",  data: this.toJSON() });
        }
    }
);

var AnnotationCollection = Backbone.Collection.extend(
    {
        initailize:function() {
            
        }
    }
);