var physicsEngine = physicsEngine || {};

physicsEngine.Ball = Backbone.Model.extend({

	defaults: {
		x: 20,
		y: 20,
		mass: 1,
		speedX: 0,
		speedY: 0,
		trace: false,
		traceArray: [],
		radius: 12,
		bounciness: 1.0,
		friction: 0,
		colour: "",
		containerId: 1,
		collided: [],
	},
	
	initialize: function() {
		if (this.get("colour") === "") {
			this.set("colour", physicsEngine.colours[ Math.floor(Math.random() * physicsEngine.colours.length)])
		}
		this.set("traceArray", []);
	},
	
	applyContainer: function() {
		let x = this.get("x");
		let y = this.get("y");
		let radius = this.get("radius");
		let speedX = this.get("speedX");
		let speedY = this.get("speedY");
		let container = physicsEngine.containers.get(this.get("containerId"));
		let bounciness = this.get("bounciness");
		if (container) {
			var xLimits = [container.get("xMin"), container.get("xMax")];
			var yLimits = [container.get("yMin"), container.get("yMax")];
		}
		else {
			return;
			var xLimits = [-5000, 5000];
			var yLimits = [-5000, 5000];
		}
		let traceArray = this.get("traceArray");
		let g = physicsEngine.g;
		let trace = this.get("trace");
		
		if ( (Math.abs(speedX) > 0) || (Math.abs(speedY) > 0) ) {
			// Check for collision with sides
			if ( (y + radius >= yLimits[1]) && (speedY > 0) ) {
				var overlap = y + radius - yLimits[1];
				speedY = speedY + 1.00120*g * (speedY - overlap)/speedY; //1.00107
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
		
		this.set("x", x, {silent:true});
		this.set("y", y, {silent:true});
		this.set("speedX", speedX, {silent:true});
		this.set("speedY", speedY, {silent:true});
		this.set("traceArray", traceArray, {silent:true});		

	},
	
	applyGravity: function() {
		this.set("speedY", this.get("speedY")+physicsEngine.g, {silent:true});
	},
	
	applyFriction: function() {
		let speedX = this.get("speedX");
		let speedY = this.get("speedY");
		this.changeSpeedBy(this.get("friction")*modulus([speedX, speedY]), directionTo([speedX, speedY], [0,0])); 
	},
	
	applyRamp: function(ramp) {
		ballPos = this.getVectorPos();
		endPositions = ramp.getVectorPositions();
		vectorAlong = [endPositions[1][0] - endPositions[0][0], endPositions[1][1] - endPositions[0][1]]
		rampLength = modulus(vectorAlong); 
		unitVectorAlong = scale(vectorAlong, 1/rampLength);
		unitVectorPerp = [-1*unitVectorAlong[1], unitVectorAlong[0]];
		vectorTo = [ ballPos[0] - endPositions[0][0], ballPos[1] - endPositions[0][1] ];
		distanceAlong = dotProduct(vectorTo, unitVectorAlong);
		distancePerp = dotProduct(vectorTo, unitVectorPerp);
		velPerp = dotProduct(this.getVectorSpeed(), unitVectorPerp);
		if (distanceAlong > 0 && distanceAlong < rampLength) {
			if ( Math.abs(distancePerp) <= this.get("radius") ) {
				if ( velPerp !== 0 && distancePerp / velPerp < 0) {
					this.changeSpeedBy(-velPerp, unitVectorPerp);
					this.changeSpeedBy(-velPerp*this.get("bounciness"), unitVectorPerp);
				}
			}
		}
	},

	touchingRamp: function(ramp) {
		ballPos = this.getVectorPos();
		endPositions = ramp.getVectorPositions();
		vectorAlong = [endPositions[1][0] - endPositions[0][0], endPositions[1][1] - endPositions[0][1]]
		rampLength = modulus(vectorAlong); 
		unitVectorAlong = scale(vectorAlong, 1/rampLength);
		unitVectorPerp = [-1*unitVectorAlong[1], unitVectorAlong[0]];
		vectorTo = [ ballPos[0] - endPositions[0][0], ballPos[1] - endPositions[0][1] ];
		distanceAlong = dotProduct(vectorTo, unitVectorAlong);
		distancePerp = dotProduct(vectorTo, unitVectorPerp);
		velPerp = dotProduct(this.getVectorSpeed(), unitVectorPerp);
		if (distanceAlong > 0 && distanceAlong < rampLength) {
			if ( Math.abs(distancePerp) <= this.get("radius") ) {
				if ( velPerp !== 0 && distancePerp / velPerp < 0) {
					return true;
				}
			}
		}
		return false;
	},
	
	placeOnRamp: function(ramp) {
		ballPos = this.getVectorPos();
		endPositions = ramp.getVectorPositions();
		vectorAlong = [endPositions[1][0] - endPositions[0][0], endPositions[1][1] - endPositions[0][1]]
		rampLength = modulus(vectorAlong); 
		unitVectorAlong = scale(vectorAlong, 1/rampLength);
		unitVectorPerp = [-1*unitVectorAlong[1], unitVectorAlong[0]];
		vectorTo = [ ballPos[0] - endPositions[0][0], ballPos[1] - endPositions[0][1] ];
		distanceAlong = dotProduct(vectorTo, unitVectorAlong);
		distancePerp = dotProduct(vectorTo, unitVectorPerp);
		velPerp = dotProduct(this.getVectorSpeed(), unitVectorPerp);
		if (distanceAlong > 0 && distanceAlong < rampLength) { 
			pointAlong = scale(unitVectorAlong, distanceAlong); 
		}
		else{
			pointAlong = [0,0];
		}
		pointPerp = scale(unitVectorPerp, this.get("radius"));
		// Put it the "right way up"
		if (pointPerp[1] > 0) {
			pointPerp = scale(pointPerp, -1);
		}
		this.set("x", endPositions[0][0] + pointAlong[0] + pointPerp[0]);
		this.set("y", endPositions[0][1] + pointAlong[1] + pointPerp[1]);
	},
	
	move: function() {
		this.set("x", this.get("x") + this.get("speedX"), {silent:true});
		this.set("y", this.get("y") + this.get("speedY"), {silent:true});
	},
	
	changeSpeedBy: function(modulus, direction) {
		var dateO= new Date();
		var timeO = dateO.getTime();
		this.set("speedX", this.get("speedX") + dotProduct(direction, [1,0]) * modulus, {silent:true});
		this.set("speedY", this.get("speedY") + dotProduct(direction, [0,1]) * modulus, {silent:true});
		var dateF = new Date();
		var timeF = dateF.getTime();
		//~ console.log("Speed change Time");
		//~ console.log(timeF - timeO);
	},
	
	getVectorPos: function() {
		return [this.get("x"), this.get("y")];
	},
	
	getVectorSpeed: function() {
		return [this.get("speedX"), this.get("speedY")];
	},
	
	getAttr: function() {
		 return [
			{ "attr":"x",  			"value":this.get("x").toFixed(2), "type":"inputFloat", name: "X Position"},
			{ "attr":"y",  			"value":this.get("y").toFixed(2), "type":"inputFloat", name: "Y Position"},
			{ "attr":"speedX",  	"value":this.get("speedX").toFixed(2), "type":"inputFloat", name: "X Speed"},
			{ "attr":"speedY",  	"value":this.get("speedY").toFixed(2), "type":"inputFloat", name: "Y Speed"},
			{ "attr":"mass",  		"value":this.get("mass").toFixed(2), "type":"inputFloat"},
			{ "attr":"radius",  	"value":this.get("radius"), "type":"inputFloat"},
			{ "attr":"bounciness",  "value":this.get("bounciness").toFixed(3), "type":"inputFloat"},
			{ "attr":"friction", 	"value":this.get("friction").toFixed(3),"type":"inputFloat"},
			{ "attr":"trace", 		"value":this.get("trace"),"type":"bool"},
			{ "attr":"containerId", "value":this.get("containerId"),"type":"inputFloat"},
			{ "attr":"colour", 		"value":this.get("colour"), "type":"inputString"},
		];
	},
	
});


