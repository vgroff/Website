var physicsEngine = physicsEngine || {};

// Container for any given ball
physicsEngine.Ramp = Backbone.Model.extend({


	defaults: {
		x1: 0,
		y1: 0,
		x2: 0,
		y2: 0,
	},
	
	getVectorPositions: function() {
		return [ [this.get("x1"), this.get("y1")], [this.get("x2"), this.get("y2")] ]
	},
	
	getAttr: function() {
		 return [
			{ "attr":"x1", "value":this.get("x1"), "type":"inputFloat"},
			{ "attr":"y1", "value":this.get("y1"), "type":"inputFloat"},
			{ "attr":"x2", "value":this.get("x2"), "type":"inputFloat"},
			{ "attr":"y2", "value":this.get("y2"), "type":"inputFloat"},
		];
	},

});
