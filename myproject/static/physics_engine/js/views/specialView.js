var physicsEngine = physicsEngine || {};

// The view for a given collection
physicsEngine.SpecialView = Backbone.View.extend({
	
	template: _.template( $('#specialViewTemplate').html() ),

	events: {
		"click .addNew": "addOne",
	},

	
	initialize: function() {
		var self = this;
		
		this.$el.html( this.template );
		this.$el.addClass("physicsEditingSection");   
		
		var graphEditView = new physicsEngine.GraphEditView();
		this.$el.append( graphEditView.$el );
		
		this.render();
				
		this.listenTo(physicsEngine.physicsRouter, "routed", this.toggleVisibility);
	},
	
	// Hides itself if not on the right heading
	toggleVisibility: function() {
		if (physicsEngine.editFilter === "Special") {
			this.$el.show();
		}
		else {
			this.$el.hide();
		}
	},

});
