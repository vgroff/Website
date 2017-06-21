var physicsEngine = physicsEngine || {};

// Container for any given ball
physicsEngine.Graph = Backbone.Model.extend({


	defaults: {
		plottingBalls: [],
		plottingOption: 0,
		plottingOptions: null,
		plottingDirection: [null,null],
	},
	
	initialize: function() {
		this.set("plottingOptions", [ ["Speed in direction", this.getSpeed], ["Distance in direction", this.getDistance] ]);
	},
	
	getPoint: function(ball) {
		var option = this.get("plottingOption");
		var func = this.get("plottingOptions")[option][1];
		var result = func(ball, this);
		return result;
	},
	
	getSpeed: function(ball, self) {
		var speed = ball.getVectorSpeed();
		var plottingDirection = self.get("plottingDirection");
		if (plottingDirection[0] !== null && plottingDirection[1] !== null) {
			var unitDir = directionTo([0,0], plottingDirection);
			return dotProduct(speed, unitDir)
		}
		else {
			return modulus(speed);
		}
	},
	
	getDistance: function(ball, self) {
		var pos = ball.getVectorPos();
		var plottingDirection = self.get("plottingDirection");
		if (plottingDirection[0] !== null && plottingDirection[1] !== null) {
			var unitDir = directionTo([0,0], plottingDirection);
			return dotProduct(pos, unitDir);		
		}
		else {
			return modulus(pos);
		}
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
