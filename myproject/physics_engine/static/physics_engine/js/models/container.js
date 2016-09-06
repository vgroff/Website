var physicsEngine = physicsEngine || {};

// Container for any given ball
physicsEngine.Container = Backbone.Model.extend({

	defaults: {
		xMin: physicsEngine.sideOffset,
		xMax: physicsEngine.canvas.width - physicsEngine.sideOffset,
		yMin: physicsEngine.sideOffset,
		yMax: physicsEngine.canvas.height - physicsEngine.sideOffset,
	},

});


