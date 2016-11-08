var physicsEngine = physicsEngine || {};

// Container for any given ball
physicsEngine.Container = Backbone.Model.extend({


	defaults: {
		xMin: physicsEngine.sideOffset,
		xMax: physicsEngine.canvas.width - physicsEngine.sideOffset,
		yMin: physicsEngine.sideOffset,
		yMax: physicsEngine.canvas.height - physicsEngine.sideOffset,
	},
	
	getAttr: function() {
		 return [
			{ "attr":"xMin", "value":this.get("xMin"), "type":"inputFloat"},
			{ "attr":"xMax", "value":this.get("xMax"), "type":"inputFloat"},
			{ "attr":"yMin", "value":this.get("yMin"), "type":"inputFloat"},
			{ "attr":"yMax", "value":this.get("yMax"), "type":"inputFloat"},
		];
	},

});


