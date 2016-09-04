var physicsEngine = physicsEngine || {};

physicsEngine.Ball = Backbone.Model.extend({

	defaults: {
		x: null,
		y: null,
		mass: 1,
		speedX: 0,
		speedY: 0,
		trace: false,
		traceArray: [],
		radius: 12,
		bounciness: 1.0,
		friction: 0,
		colour: physicsEngine.defaultColour,
		container: physicsEngine.containers.get(1),
		collided: []
	},
	
	applyContainer: function() {
		let x = this.get("x");
		let y = this.get("y");
		let radius = this.get("radius");
		let speedX = this.get("speedX");
		let speedY = this.get("speedY");
		let container = this.get("container");
		let bounciness = this.get("bounciness");
		let xLimits = [container.get("xMin"), container.get("xMax")];
		let yLimits = [container.get("yMin"), container.get("yMax")];
		let traceArray = this.get("traceArray");
		let g = physicsEngine.g;
		let trace = this.get("trace");
		
		if ( (Math.abs(speedX) > 0) || (Math.abs(speedY) > 0) ) {
			// Check for collision with sides
			if ( (y + radius >= yLimits[1]) && (speedY > 0) ) {
				var overlap = y + radius - yLimits[1];
				speedY = speedY + 1.00107*g * (speedY - overlap)/speedY;
				speedY = -1 * bounciness * speedY;
				y = yLimits[1] - radius;
			}
			else if ( (y - radius <= yLimits[0]) && (speedY < 0) ) { 
				var overlap = y - radius - yLimits[0];
				speedY = speedY + g * (speedY - overlap)/speedY;
				speedY = -1 * bounciness * speedY;
				y = radius + yLimits[0];
			}	
			if ( (x + radius >= xLimits[1]) && (speedX > 0) ){
				speedX = -1 * bounciness * speedX;
				x = xLimits[1] - radius;
			} 
			else if ( (x - radius <= xLimits[0]) && (speedX < 0) ) {
				speedX = -1 * bounciness * speedX;
				x = radius + xLimits[0];
			}	

			if ( (trace) ) {
				traceArray.push([x, y]);
			} 
			
		}
		
		this.set("x", x);
		this.set("y", y);
		this.set("speedX", speedX);
		this.set("speedY", speedY);
		this.set("traceArray", traceArray);		

	},
	
	applyGravity: function() {
		this.set("speedY", this.get("speedY")+physicsEngine.g);
	},
	
	applyFriction: function() {
		let speedX = this.get("speedX");
		let speedY = this.get("speedY");
		this.changeSpeedBy(this.get("friction")*modulus([speedX, speedY]), directionTo([speedX, speedY], [0,0])); 
	},
	
	move: function() {
		this.set("x", this.get("x") + this.get("speedX"));
		this.set("y", this.get("y") + this.get("speedY"));
	},
	
	changeSpeedBy: function(modulus, direction) {
		this.set("speedX", this.get("speedX") + dotProduct(direction, [1,0]) * modulus);
		this.set("speedY", this.get("speedY") + dotProduct(direction, [0,1]) * modulus);
	},
	
	getVectorPos: function() {
		return [this.get("x"), this.get("y")];
	},
	
	getVectorSpeed: function() {
		return [this.get("speedX"), this.get("speedY")];
	},
	
});


