
/////////////////////////////////////
// NEEEEEEEEEEEEEDS COOMMEEENTING !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
///////////////////////////////////////////////
////AND MAKE MORE CONSISTENT!!!!

// MAKE MORE EFFICIENT (TREE?)// divide into quarters with overlapping bits. count primary and secondary(in overlap) balls inside to be checked for collisions 
// only do if too many balls
// custom sides	- link container and ball limits
// UI
// custom structs e.g. strings/pendulums ect...
// have a graphing thing
// look at fixing string via having a function that makes the natural lengths the equilibrium ones (i.e. call it after a bit as a setTimeout and just pass the right objects through) (DOES THIS EVEN HELP/WORK?)

// change ball1 ball2 in spring to point1 point 2
// have a restart animation butoon
// change mouse cursor
// better way of referencing springs for click and drag (save the index)
// random colours if none given
// improve click n drag
// overlap off the top if negative!!!

// altering springs when iterating over the list, bad idea. save a list to be popped instead
// reduce dampening on string to have it behave more like a string
// have textbox to change graph live
// have slow mo in the UI
// use newton's cradle springs to make rods + solids?
	
var gravity = true;
var g = 0.045;
var first = false;
var heatmap = false;
var offset = 40;
var fps = 10;

//////////////////////////////////////////////////////////////
///////////////////	VECTOR FUNCTIONS /////////////////////////
//////////////////////////////////////////////////////////////

// Returns the distance between two points
function distanceTo(vector, vector1) {
	return Math.pow( Math.pow(vector[0]-vector1[0], 2) + Math.pow(vector[1]-vector1[1], 2) , 0.5);
}

// Returns the unit vector direction between two points
function directionTo(vector, vector1) {
	var modulus = distanceTo (vector, vector1);
	return [ (vector1[0] - vector[0]) / modulus, (vector1[1] - vector[1]) / modulus];
}

// Returns the modulus of a vector
function modulus(vector) {
	return distanceTo([0,0], [vector[0], vector[1]])
}

// Returns the dot product of two vectors
function dotProduct(vector1, vector2) { 
	return vector1[0]*vector2[0] + vector1[1]*vector2[1];
}

// Returns the vector scaled 
function scale(vector, factor) {
	return [vector[0]*factor, vector[1] * factor];
}


//////////////////////////////////////////////////////////////
///////////////////// BALL FUNCTIONS /////////////////////////
//////////////////////////////////////////////////////////////

function Ball(x, y, mass, speedx, speedy, properties) {
	this.x = x;
	this.y = y;
	this.speedx = speedx;
	this.speedy = speedy;
	this.mass = mass;
    this.trace = false;
    this.traceArray = [];
    this.i = 0;
    this.period = 2;
    this.properties = {};
    this.setProperties(properties);
}

Ball.prototype.setProperties = function(properties) {
	if ("radius" in properties) {
		this.radius = properties["radius"];
		this.properties["radius"] = this.radius;
	}
	else if (!("radius" in this.properties)) {
		this.radius = 12;
		this.properties["radius"] = this.radius;
	}
	if ("bounciness" in properties) {
		this.bounciness = properties["bounciness"];
		this.properties["bounciness"] = this.bounciness;
	}
	else if (!("bounciness" in this.properties)){
		this.bounciness = 1;
		this.properties["bounciness"] = this.bounciness;
	}
	if ("colour" in properties) {
		this.colour = properties["colour"];
		this.properties["colour"] = this.colour;
	}
	else if (!("colour" in this.properties)){
		this.colour = "#0000FF";
		this.properties["colour"] = this.colour;
	}
	if ("limits" in properties) {
		this.xLimits = properties["limits"][0];
		this.yLimits = properties["limits"][0];
		this.properties["limits"] = [this.xLimit, this.yLimit];
	}
	else if (!("limits" in this.properties)){
		this.xLimits = [40, canvas.width-40];
		this.yLimits = [40, canvas.height-40];
		this.properties["limits"] = [this.xLimit, this.yLimit];
	}
	if ("friction" in properties) { 
		this.friction = properties["friction"];
		this.properties["friction"] = this.friction;
	}
	else if (!("friction" in this.properties)){
		this.friction = 0;
		this.properties["friction"] = this.friction;
	}
};

Ball.prototype.move = function() {
	this.i += 1;	

	this.x = this.x + this.speedx;
    this.y = this.y + this.speedy;
	
    if ( (Math.abs(this.speedx) > 0) || (Math.abs(this.speedy) > 0) ) {
		// Check for collision with sides
		var collision = false;
		if ( (this.y + this.radius >= this.yLimits[1]) && (this.speedy > 0) ) {
			var overlap = this.y + this.radius - this.yLimits[1];
			if (gravity) {
				this.speedy = this.speedy + g * (this.speedy - overlap)/this.speedy;
			}
			this.speedy = -1 * this.bounciness * this.speedy;
			this.y = this.yLimits[1] - this.radius;
			collision = true;
		}
		else if ( (this.y - this.radius <= this.yLimits[0]) && (this.speedy < 0) ) { 
			var overlap = this.y - this.radius - this.yLimits[0];
			if (gravity) {
				this.speedy = this.speedy + g * (this.speedy - overlap)/this.speedy;
			}
			this.speedy = -1 * this.bounciness * this.speedy;
			this.y = this.radius + this.yLimits[0];
			collision = true;
		}	
		if ( (this.x + this.radius >= this.xLimits[1]) && (this.speedx > 0) ){
			this.speedx = -1 * this.bounciness * this.speedx;
			this.x = this.xLimits[1] - this.radius;
		} 
		else if ( (this.x - this.radius <= this.xLimits[0]) && (this.speedx < 0) ) {
			this.speedx = -1 * this.bounciness * this.speedx;
			this.x = this.radius + this.xLimits[0];
		}	

		if ( (this.trace) && ( (this.i % this.period == 0) || (collision) ) ) {
			this.traceArray.push([this.x, this.y]);
		} 

		this.velocityChange(this.friction*modulus([this.speedx, this.speedy]), directionTo([this.speedx, this.speedy], [0,0])); 
    }
    if ( (gravity)) {
		this.speedy += g;
	}
};

Ball.prototype.velocityChange = function(modulus, direction) {
	this.speedx = this.speedx + dotProduct(direction, [1,0]) * modulus;
	this.speedy = this.speedy + dotProduct(direction, [0,1]) * modulus;
};

Ball.prototype.getPos = function() {
	return [this.x, this.y];
};

// Randomly generate balls in a certain rectangle of space
function randomBalls(x1, x2, y1, y2, speedx, speedy, density, uniformMass, uniformRadius, properties, previousBalls) {
	density = density / 10000;
	var randomBalls = previousBalls;
	var numNewBalls = 0
	var area = Math.abs( (x2-x1) * (y2-y1) );
	while (numNewBalls/area <= density) {
		var succesful = false;
		if (!uniformRadius) {
			radius = (Math.random() * 20 + 2 );
		}
		else {
			radius = uniformRadius;
		}
		if (uniformMass) {
			mass = 1;
		}
		else {
			mass = Math.pow(radius, 2);
		}
		while (!succesful) {
			succesful = true;
			x = Math.random() * (x2 - x1 - 2*radius) + x1 + radius;
			y = Math.random() * (y2 - y1 - 2*radius) + y1 + radius;
			for (var i=0; i<randomBalls.length; i++) {
				if ( distanceTo([x, y], [randomBalls[i].x, randomBalls[i].y]) <= (radius + randomBalls[i].radius) ) {
					succesful = false;
				}
			}
		}
		randomBalls.push(new Ball(x, y, mass, speedx, speedy, properties));
		randomBalls[randomBalls.length-1].setProperties({"radius":radius});
		numNewBalls += 1;
	}
	return randomBalls;
}

// Check for and resolve collision between two balls
function ballCollision(ball1, ball2) {
	if ( ( distanceTo([ball1.x, ball1.y], [ball2.x, ball2.y]) <= (ball1.radius + ball2.radius) ) ) {
		var vectorTo = directionTo([ball1.x, ball1.y], [ball2.x, ball2.y]);
		//var averageSpeed = [ (ball1.mass*ball1.speedx + ball2.mass*ball2.speedx) / (ball1.mass1+ball2.mass2), (ball1.mass*ball1.speedy + ball2.mass*ball2.speedy) / (ball1.mass1+ball2.mass2)];
		if ( (dotProduct(vectorTo, [ball1.speedx-ball2.speedx, ball1.speedy-ball2.speedy]) > 0)) { 
			//alert("Collision");
			
			if (ball1.bounciness > ball2.bounciness) {
				var bounciness = ball1.bounciness;
			}
			else {
				var bounciness = ball2.bounciness;
			}
			var initSpeed1 = dotProduct(vectorTo, [ball1.speedx, ball1.speedy] );
			var initSpeed2 = dotProduct(vectorTo, [ball2.speedx, ball2.speedy] );
			var finalSpeed1 = (initSpeed1 * ball1.mass / ball2.mass + initSpeed2 + bounciness*(initSpeed2 - initSpeed1)) / (1 + ball1.mass/ball2.mass);
			var finalSpeed2 = finalSpeed1 - bounciness * (initSpeed2 - initSpeed1);
			ball1.velocityChange(-initSpeed1, vectorTo);
			ball2.velocityChange(-initSpeed2, vectorTo);
			ball1.velocityChange(finalSpeed1, vectorTo);
			ball2.velocityChange(finalSpeed2, vectorTo);
			var initE = 0.5 * (ball1.mass * Math.pow(initSpeed1, 2) + ball2.mass * Math.pow(initSpeed2, 2))	;
			var finalE = 0.5 * (ball1.mass * Math.pow(finalSpeed1, 2) + ball2.mass * Math.pow(finalSpeed2, 2));
		}
	}
}

//////////////////////////////////////////////////////////////
/////////////////// SPRING FUNCTIONS /////////////////////////
//////////////////////////////////////////////////////////////

function Spring(ball1, ball2, k, length, properties) { //dampening, coloured, direction) {
	this.ball1 = ball1;
	this.ball2 = ball2;
	this.k = k/1000;
	this.length = length;
	this.extension = 0;
	this.properties = {};
	this.setProperties(properties);
}

Spring.prototype.action = function() {
	if ( this.ball1 instanceof Array ) {
		var vector = this.ball1;
	}
	else {
		var vector = [this.ball1.x, this.ball1.y];
	}	
	if (this.ball2 instanceof Array) {
		var vector1 = this.ball2;
	}
	else {
		var vector1 = [this.ball2.x, this.ball2.y];
	}
	this.extension = distanceTo(vector, vector1) - this.length;
	if ( (this.direction == "both") || (this.direction == "pull" && this.extension > 0) || (this.direction == "push" && this.extension < 0) ) {
		force = this.k * this.extension;
		if ( !( this.ball1 instanceof Array ) ) {
			this.ball1.velocityChange(force/this.ball1.mass, directionTo(vector, vector1));
			this.ball1.velocityChange(this.dampening*dotProduct([this.ball1.speedx, this.ball1.speedy], directionTo(vector, vector1)), directionTo(vector1, vector));
		}	
		if ( !( this.ball2 instanceof Array ) ) {
			this.ball2.velocityChange(force/this.ball2.mass, directionTo(vector1, vector));
			this.ball2.velocityChange(this.dampening*dotProduct([this.ball2.speedx, this.ball2.speedy], directionTo(vector1, vector)), directionTo(vector, vector1));
		}
	}
	//console.log(this.extension);
	if (this.failPoint) {
	    if (this.extension	>= this.failPoint) {
			let index = springs.indexOf(this);
			console.log(index);
			if (index !== -1) {
				springs.splice(index, 1);
			}
		}
	}
}

Spring.prototype.setProperties = function(properties) {
	if ("dampening" in properties) {
		this.dampening = properties["dampening"]/200;
		this.properties["dampening"] = this.dampening;
	}
	else if (!("dampening" in this.properties)) {
		this.dampening = 0;
		this.properties["dampening"] = this.dampening;
	}
	if ("colour" in properties) {
		this.coloured = properties["coloured"];
		this.properties["coloured"] = this.coloured;
	}
	else if (!("colour" in this.properties)){
		this.coloured = undefined;
		this.properties["coloured"] = this.coloured;
	}
	if ("direction" in properties) { 
		this.direction = properties["direction"];
		this.properties["direction"] = this.direction;
	}
	else if (!("direction" in this.properties)) {
		this.direction = "both";
		this.properties["direction"] = this.direction;
	}
	if ("fail point" in properties) { 
		this.failPoint = properties["fail point"];
		this.properties["fail point"] = this.failPoint;
	}
	else if (!("fail point" in this.properties)) {
		this.failPoint = undefined;
		this.properties["fail point"] = this.failPoint;
	}
};


//////////////////////////////////////////////////////////////
/////////////////// CUSTOM FUNCTIONS /////////////////////////
//////////////////////////////////////////////////////////////

function createPendulum(x, y, mass, velocity, balls, springs) {
	var ball = new Ball(x, y, mass, velocity, 0, {"bounciness":0.99, "radius":15});
	var spring = new Spring( ball, [x, offset], 500, y-2*g, {"dampening":80, "colour":"#000000"});
	balls.push(ball);
	springs.push(spring);
}

function createMassSpring(x, y, velocity, radius, mass, balls, springs) {
	var ball = new Ball(x, y, 1, 0, velocity, {});
	var spring = new Spring( ball, [x, offset], 1, y-1000*g, {"dampening":0.2, "fail point":125});
	balls.push(ball);
	springs.push(spring);	
}

function createString(joint1, ball2, balls, springs) {
	var regularity = 6;
	var numberOfJoints = Math.floor(( distanceTo(joint1, ball2.getPos()) - 2*ball2.radius)/regularity);
	var direction = directionTo(joint1, ball2.getPos());
	var jointNumber = 0;
	var xSpacing = dotProduct([1,0], scale(direction, regularity));
	var ySpacing = dotProduct([0,1], scale(direction, regularity));
	var x = joint1[0]+xSpacing;
	var y = joint1[1]+ySpacing;
	var ballMass = 0.1;
	var springConst = 100;
	var dampening = 5;
	var friction = 0.0000002;
	var radius = 2;
	var ball = new Ball(x, y, ballMass, 0, 0, {"radius":radius, "colour":"#000000", "friction":friction});
	var spring = new Spring( joint1, ball, springConst, distanceTo(joint1, ball.getPos()), 10, "#000000", "both");
	springs.push(spring);
	balls.push(ball);
	for (var i = 0; i < numberOfJoints; i++) {
		x = x+xSpacing;
		y = y+ySpacing;
		ball = new Ball(x, y, ballMass, 0, 0, {"radius":radius, "colour":"#000000", "friction":friction});
		spring = new Spring( balls[balls.length-1], ball, springConst, distanceTo(balls[balls.length-1].getPos(), ball.getPos()), dampening, "#000000", "both");
		springs.push(spring);
		balls.push(ball);		
	}	
	var spring = new Spring( balls[balls.length-1], ball2, springConst, distanceTo(balls[balls.length-1].getPos(), ball2.getPos()), dampening, "#000000", "both");
	springs.push(spring)
	setTimeout(function() {
		c
	}, 1);
}

function newtonsBalls() {
	createPendulum(210, 200, 1, 0, balls, springs);
	createPendulum(240.01, 200, 1, 0, balls, springs);
	createPendulum(270.02, 200,  1, 0, balls, springs);
	createPendulum(300.03, 200,  1, 0, balls, springs);
	createPendulum(330.04, 200, 1, 1.5, balls, springs);
}



//////////////////////////////////////////////////////////////
///////////////////// DRAW FUNCTIONS /////////////////////////
//////////////////////////////////////////////////////////////



function drawBall(ball) {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2);
    if (heatmap) {
		var colours = ["#000000", "#6666AA", "#3333BB", "#0000FF", "#BB3333", "#FF0000"];//3333BB
		var speeds = [0, 0.4, 0.8, 1.4, 1.8, 2.4];
		var index = 0;
		for (var i=0; i < speeds.length; i++) {
			var speed = modulus([ball.speedx, ball.speedy]);
			if ( speed >= speeds[i]) {
				index = i;
			}
		}
		ctx.fillStyle = colours[index];
	}
	else {
		ctx.fillStyle = ball.colour;
    }
    ctx.fill();
    ctx.closePath();
    ctx.beginPath();
	for (var i=0; i < ball.traceArray.length-1; i++) {
		ctx.strokeStyle = ball.colour;
		ctx.lineWidth = 2;
		ctx.moveTo(ball.traceArray[i][0], ball.traceArray[i][1]);
		ctx.lineTo(ball.traceArray[i+1][0], ball.traceArray[i+1][1]);
	}
	ctx.stroke();
	ctx.closePath();
}

function drawSpring(spring) {
    ctx.beginPath();
	if (spring.coloured == undefined) {
		var colours = ["#FFFFFF", "#FFBBBB", "#FF9999", "#FF7777", "#FF5555", "#FF3333", "#FF2222", "#FF1111"];
		var forces  = [0, 0.02, 0.04, 0.06, 0.08, 0.1, 0.12, 0.14];
		var max = 0;
		for (var i=0; i<forces.length; i++) {
			if ( Math.abs(spring.extension*spring.k) >= forces[i] ) {
				max = i;
			}
		}
		ctx.strokeStyle = colours[max];
	}
	else {
		ctx.strokeStyle = spring.coloured;
	}
    ctx.lineWidth = 2;
    if (spring.ball1 instanceof Array) {
		ctx.moveTo(spring.ball1[0], spring.ball1[1]);
	}
	else {
		ctx.moveTo(spring.ball1.x, spring.ball1.y);
	}
	if (spring.ball2 instanceof Array) {
		ctx.lineTo(spring.ball2[0], spring.ball2[1]);
	}
	else {
		ctx.lineTo(spring.ball2.x, spring.ball2.y);
	}
    ctx.moveTo(spring.ball1.x, spring.ball1.y);
    ctx.lineTo(spring.ball2.x, spring.ball2.y);
    ctx.stroke();
    ctx.closePath();	
}

function drawContainer(container) {
	ctx.beginPath();
	ctx.lineWidth = 2;
	ctx.strokeStyle = "#000000";
	ctx.moveTo(container["X"][0], container["Y"][0]);
	ctx.lineTo(container["X"][1], container["Y"][0]);
	ctx.lineTo(container["X"][1], container["Y"][1]);
	ctx.lineTo(container["X"][0], container["Y"][1]);
	ctx.lineTo(container["X"][0], container["Y"][0]);
	ctx.stroke();
	ctx.closePath();
}

function graphSpeed(regularity) {
	var graphCanvas = document.getElementById("graphCanvas");
	var graphCtx = graphCanvas.getContext("2d");
	graphCtx.clearRect(0,0,graphCanvas.width, graphCanvas.height);
	var regularity = 1000;
	var bins = []; //0.2 up to 3
	var leftOvers = 0;
	for (var i = 1; i <= 50; i++) {
		bins.push({"upperSpeed":i*3/50, "number": 0});
	}
	var maxNumber = 0;
	for (var i = 0; i < balls.length; i++) {
		binned = false;
		currentBall = balls[i];
		for (var j = 0; j < bins.length; j++) {
			if ( ( Math.pow(modulus([currentBall.speedx, currentBall.speedy]),1) < bins[j]["upperSpeed"] )  && (!binned) ) {
				binned = true;
				bins[j]["number"] += 1;
				if (maxNumber < bins[j]["number"]) {
					maxNumber = bins[j]["number"];
				}
			}
			if ( (j === bins.length - 1) && (!binned) ) {
				leftOvers += 1;
			}
		}
	}
	maxNumber = balls.length/15;
	var speedString = "";
	for (var i=0; i < bins.length; i++) {
		speedString += bins[i]["number"].toString();
		speedString += ", "
	}
	speedString += leftOvers.toString();
	$("#speeds").html(speedString);
	var graphMaxX = 660;
	var graphMaxY = 175;
	graphCtx.beginPath();
	graphCtx.lineWidth = 2;
	graphCtx.strokeStyle = "#000000";
	graphCtx.moveTo(offset, 25);
	graphCtx.lineTo(offset, graphMaxY);
	graphCtx.lineTo(offset+graphMaxX, graphMaxY);
	graphCtx.stroke();
	graphCtx.closePath();
	var xSize = graphMaxX/bins.length;
	var maxSize = 150;
	for (var i=0; i < bins.length; i++) {
		graphCtx.fillStyle="red";
		graphCtx.fillRect(offset+i*xSize, graphMaxY, xSize, -bins[i]["number"] * maxSize / maxNumber)
	}
	graphCtx.beginPath();
	graphCtx.lineWidth = 2;
	graphCtx.strokeStyle = "#000000";
	graphCtx.moveTo(offset,graphMaxY);
	var xPeakVal = 187;
	var a = 1/(2* Math.pow(xPeakVal, 2));
	var yPeakVal = 98;
	var b = yPeakVal * Math.exp(1/2) *  Math.pow(2*a, 0.5) / (2*a);
	//b=50000;
	for (var x=0; x<650; x+=10) {
		y = b*2*(a*Math.pow(x, 1)*Math.exp(-a*Math.pow(x, 2)));
	    graphCtx.lineTo(x+offset, graphMaxY - y);
	}
	graphCtx.stroke();
	graphCtx.closePath();
	setTimeout(graphSpeed, regularity);
}

// y=2ave^-av^2
// dy = e^(-av^2) - 2av^2 e^-av^2
// 2av^2 = 1
// v = 1/rt(2a)
// a = 1/ 2*v^2
// y = 2a*(1/rt(2a))*e(-a/2a) = b* 1/rt(2a) * e^(-1/2)



function exampleScenario() {
	newtonsBalls();
	createMassSpring(550, 180, 1.5, 20,1, balls, springs);
	randomBalls(offset, canvas.width-offset, canvas.height-offset-50, canvas.height-offset, 0, -0.7,5, 1,8, {"radius":8},balls);
	balls.push(new Ball(canvas.width/2, canvas.height-offset-50, 6, 0, -2.5, {"radius":24, "colour":"#AA00FF"}));
}

function scenario2() {
	balls.push(new Ball(offset+200, offset+200, 1, 0, 0, {friction:0.1}) );
	createString([offset+200, offset], balls[balls.length-1], balls, springs);
}

function testScenario() {
	balls.push(new Ball(canvas.width/2, offset+20, 1, 0.5, 0, {}));
}

function maxwellScenario() {
	//gravity = false;
	heatmap = true;
	randomBalls(offset, canvas.width-offset, offset, canvas.height-offset, 1.2, 0,40, 1,2, {},balls);
	graphSpeed();
}


//exampleScenario();
//scenario2();
//maxwellScenario();

//balls.push(new Ball(100, 100, 1, 0, 0, {}));
//~ springs.push(new Spring(balls[balls.length-1], balls[balls.length-2], 0.3, 250, 0, undefined));
//~ springs.push(new Spring(balls[balls.length-2], balls[balls.length-3], 0.3, 250, 0, undefined));

//var balls = [new Ball(200,120,[40, 210], [100, 550], 0,5,10,1,1,"#0095DD")];//, new Ball(300,120,1.5,0,10,1,1,"#0095DD"), new Ball(300,180,0,-1,20,4,1,"#0095DD")];//, new Ball(100,150,1,0.1,20,5,1,"#FF9599"), new Ball(300, 35, 1, 0.2, 5, 0.5, 1, "#3365F0"), new Ball(350, 100, 0.5, -0.2, 15, 2, 1, "#D065F0")];
//~ var springs = [new Spring(balls[0], balls[1], 1, 100), new Spring(balls[1], balls[2], 0.5, 60), new Spring(balls[2], balls[0], 1, 116)];

//~ balls = randomBalls(40, 50, canvas.width-40, canvas.height-40, [40, canvas.width-40], [40, canvas.height-40], 0,0,15, false, 6, "#FF9599", []);
//~ balls.concat( randomBalls(canvas.width/2,40, canvas.width-40, 50,[40, canvas.width-40], [40, canvas.height-40], 0,0,15, false, 6, "#00D099", balls) );
//~ balls.concat( randomBalls(0,0, canvas.width/2, 20, 0,0,15, false, 6, "#FFD099", balls) );
//~ //balls[balls.length-1].trace=true;
//~ balls.concat( randomBalls(0,canvas.height-20, canvas.width, canvas.height, 2, 1,10, false, 6, "#99B0DD", balls) );


//~ var balls = [new Ball(canvas.width/2, 120, 2.2, 1.4, 10, 1, 1,"#0095DD")];//, new Ball(200, 240, 1, -2, 10, 1, 1,"#0095DD") ];
//~ //balls[0].trace = true;
//~ var springs = [new Spring([canvas.width/2, 0], balls[0], 0.5, 120, 0), new Spring([canvas.width/2, canvas.height], balls[0], 0.5, canvas.height-120, 0)];//, new Spring(balls[0], balls[1], 1000, 120, 100)];



//balls.push(new Ball(30, 400, [0, canvas.width], [0, canvas.height], 2, 8, 10, 1, 1, "#000000"));


function draw() {
	// Get the date and time at beginning
	var date = new Date();
	var time = date.getTime();
	ctx.clearRect(0,0,canvas.width, canvas.height);
	for (var i =0; i < containers.length; i++) {
		drawContainer(containers[i]);
	}
    numBalls = balls.length;
    var energy = 0;
    // Check for ball collisions
    for (var i = 0; i < numBalls; i++) {
		for (var j = i+1; j < numBalls; j++) {
			if ( ballCollision(balls[i], balls[j]) ) {
				alert("Collision");	
			}
		}
	}
	// Move balls, including gravity
	for (var i = 0; i < numBalls; i++) {
		balls[i].move();
	}
	// Action springs
	for (var i = 0; i < springs.length; i++) {
		springs[i].action();
	}
	//springs[springs.length - 1].action();
	// Draw springs
	for (var i = 0; i < springs.length; i++) {
		drawSpring(springs[i]);
	}
	// Draw balls
    for (var i = 0; i < numBalls; i++) {
		drawBall(balls[i]);
		if (gravity){
			energy += balls[i].mass * ( g * (canvas.height - balls[i].y) + 0.5 * Math.pow(modulus([balls[i].speedx, balls[i].speedy]), 2) );
		}
		else {
			energy += balls[i].mass * 0.5 * Math.pow(modulus([balls[i].speedx, balls[i].speedy]), 2)	;
		}
	}
	if (!first) {
		first = energy;
	}
	//~ document.getElementById("originalEnergy").innerHTML = first;
	//~ document.getElementById("energy").innerHTML = energy;
	date = new Date();
	if ( date.getTime() - time < fps) {
		setTimeout(draw, fps - date.getTime() + time);
	}
	else {
		setTimeout(draw, 1);
	}
}



//////////////////////////////////////////////////////////////
/////////////////////// UI FUNCTIONS /////////////////////////
//////////////////////////////////////////////////////////////

var currentMousePos = [];

$("#animCanvas").on('mousedown', function (evt) {

	currentMousePos = [evt.pageX - $('#animCanvas').offset().left, evt.pageY - $('#animCanvas').offset().top];
	var first = true;
	var dragged = false;
	var ballClicked = undefined;
	for (var i =0; i < balls.length; i++) {
		if (distanceTo(currentMousePos, balls[i].getPos()) <= balls[i].radius) {
			ballClicked = balls[i];
		}
	}

	if (ballClicked) {
		$("#animCanvas").on('mousemove', function handler(evt) {

			currentMousePos=[evt.pageX- $('#animCanvas').offset().left, evt.pageY- $('#animCanvas').offset().top];
			//console.log(evt.pageX);
			if (first) {
				if (ballClicked != undefined) {
					var k = 4*ballClicked.mass;
					springs.push(new Spring(currentMousePos, ballClicked, k, 0, {}));
					ballClicked.setProperties({friction:0.1});
					first = false;
					dragged = true;
				}
			}
			else {
				springs[springs.length-1].ball1 = currentMousePos;
			}
		});

		$("#animCanvas").on('mouseup', function handler(evt) {
			var x = evt.pageX - $('#animCanvas').offset().left;
			var y = evt.pageY - $('#animCanvas').offset().top;
			if ( (!dragged) && (Math.abs(x-currentMousePos[0]) <=1 ) && (Math.abs(y - currentMousePos[1]) <= 1) ) {
				for (var i =0; i < balls.length; i++) {
					if (distanceTo(currentMousePos, balls[i].getPos()) <= balls[i].radius) {
						balls[i].velocityChange(3.5, directionTo(currentMousePos, balls[i].getPos()));
					}
				}
			}
			else {
				springs.pop(springs.length-1);
				ballClicked.setProperties({friction:0});
			}
			$("#animCanvas").off('mouseup', handler);
			$("#animCanvas").off('mousemove');
		});
	}
});

var canvas;
var ctx;
canvas = document.getElementById("animCanvas");
ctx = canvas.getContext("2d");
canvas.width = 650;
canvas.height = 550;
var balls =[];
var springs = [];
var containers = [ {"X":[offset, canvas.width-offset], "Y":[offset, canvas.height-offset]} ];
console.log(canvas.width);
console.log(canvas.height);
exampleScenario();
draw();
