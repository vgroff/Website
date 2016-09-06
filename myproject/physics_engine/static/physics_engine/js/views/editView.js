var physicsEngine = physicsEngine || {};

physicsEngine.EditView = Backbone.View.extend({

	// Instead of generating a new element, bind to the existing skeleton of
	// the App already present in the HTML.
	tagname: 'div',

	events: {
		
	},

	
	initialize: function(collection) {
		var self = this;
		collection.forEach( function(childModel) {
			let childView = new collection.childView({model:childModel});
			self.$el.append(childView.$el);
		});		
	},
	
	render: function() {
				
	},

});

// this should create different child views depending on which models it gets passed, the views can access all necessary models
