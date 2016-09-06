var physicsEngine = physicsEngine || {};

physicsEngine.BallView = Backbone.View.extend({
	
	tagname: "li",

	// Instead of generating a new element, bind to the existing skeleton of
	// the App already present in the HTML.

	events: {
		
	},

	
	initialize: function() {
		this.$el.html("hi");
	},
	
	render: function() {
				
	},

});

