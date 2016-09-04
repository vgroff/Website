var physicsEngine = physicsEngine || {};

physicsEngine.Spring = Backbone.Model.extend({

	defaults: {
		point1: null,
		point2: null,
		k: 0.001,
		length: 20,
		dampening: 0,
		colour: "strengthMap",
		direction: "both",
		failPoint: null,
		extension: 0
	},
	
	actionSpring: function() {
		let point1 = this.get("point1");
		let point2 = this.get("point2");
		
		if ( point1 instanceof Array ) {
			var vector = point1;
		}
		else {
			var vector = point1.getVectorPos();
		}	
		if (point2 instanceof Array) {
			var vector1 = point2;
		}
		else {
			var vector1 = point2.getVectorPos();
		}
		var extension = distanceTo(vector, vector1) - this.get("length");
		this.set("extension", extension);
		let direction = this.get("direction");	
		if ( (direction == "both") || (direction == "pull" && extension > 0) || (direction == "push" && extension < 0) ) {
			force = this.get("k") * extension;
			if ( !( point1 instanceof Array ) ) {
				point1.changeSpeedBy(force/point1.get("mass"), directionTo(vector, vector1));
				point1.changeSpeedBy(this.get("dampening")*dotProduct(point1.getVectorSpeed(), directionTo(vector, vector1)), directionTo(vector1, vector));
			}	
			if ( !( point2 instanceof Array ) ) {
				point2.changeSpeedBy(force/point2.get("mass"), directionTo(vector1, vector));
				point2.changeSpeedBy(this.get("dampening")*dotProduct(point2.getVectorSpeed(), directionTo(vector1, vector)), directionTo(vector, vector1));
			}
		}
		//console.log(this.extension);
		if (this.failPoint) {
			if (extension	>= this.get("failPoint")) {
				this.destroy();
			}
		}

	},
});
