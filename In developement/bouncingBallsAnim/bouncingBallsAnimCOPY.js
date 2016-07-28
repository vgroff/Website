// bounciness is highest of the two
//alert(distanceTo(1,1,2,3));
/////////////////////////////////////
// NEEEEEEEEEEEEEDS COOMMEEENTING !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
///////////////////////////////////////////////
////AND MAKE MORE CONSISTENT!!!!
//make fps more consistent (check time)
// MAKE MORE EFFICIENT (TREE?)// divide into quarters with overlapping bits. count primary and secondary(in overlap) balls inside to be checked for collisions 
// only do if too many balls
// have an add single ball function
// separate gravity and move function
// rethink order of gravity and movement bit

var gravity = true;
var g = 0.045;
var first = false;


//////////////////////////////////////////////////////////////
///////////////////	VECTOR FUNCTIONS /////////////////////////
//////////////////////////////////////////////////////////////

function distanceTo(vector, vector1) {
	return Math.pow( Math.pow(vector[0]-vector1[0], 2) + Math.pow(vector[1]-vector1[1], 2) , 0.5);
}

function directionTo(vector, vector1) {
	var modulus = distanceTo (vector, vector1);
	return [ (vector1[0] - vector[0]) / modulus, (vector1[1] - vector[1]) / modulus];
}
///
function modulus(vector) {
	return distanceTo([0,0], [vector[0], vector[1]])
}

function dotProduct(vector1, vector2) { 
	return vector1[0]*vector2[0] + vector1[1]*vector2[1];
}


//////////////////////////////////////////////////////////////
///////////////////// BALL FUNCTIONS /////////////////////////
//////////////////////////////////////////////////////////////

function Ball(x, y, speedx, speedy, radius, mass, bounciness, colour) {
	this.x = x;
	this.y = y;
	this.speedx = speedx;
	this.speedy = speedy;
	this.mass = mass;
    this.radius = radius;
    this.bounciness = bounciness;
    this.colour = colour;
    this.trace = false;
    this.traceArray = [];
    this.i = 0;
    this.period = 2;
}

Ball.prototype.move = function() {
	this.i += 1;	
	// Check for collision with sides
	var collision = false;
	if ( (this.y + this.radius >= canvas.height) && (this.speedy > 0) ) {
		var overlap = this.y + this.radius - canvas.height;
		this.speedy = this.speedy - g * overlap/this.speedy;
		this.speedy = -1 * this.bounciness * this.speedy;
		this.y = canvas.height - this.radius;
		collision = true;
	}
	else if ( (this.y - this.radius <= 0) && (this.speedy < 0) ) { 
		var overlap = this.y - this.radius;
		this.speedy = this.speedy - g * overlap/this.speedy;
		this.speedy = -1 * this.bounciness * this.speedy;
		this.y = this.radius;
		collision = true;
	}	
	if ( (this.x + this.radius >= canvas.width) && (this.speedx > 0) ){
		this.speedx = -1 * this.bounciness * this.speedx;
		this.x = canvas.width - this.radius;
	} 
	else if ( (this.x - this.radius <= 0) && (this.speedx < 0) ) {
		this.speedx = -1 * this.bounciness * this.speedx;
		this.x = this.radius;
	}	
	
	if ( (gravity) && (!collision) ) {
		this.speedy += g;
	}
	//~ else if ( (gravity) && (collision) ) {
		//~ this.speedy += g*0.5; // to average out collision inaccuracies
	//~ }
	
    this.x = this.x + this.speedx;
    this.y = this.y + this.speedy;
    if ( (this.trace) && ( (this.i % this.period == 0) || (collision) ) ) {
		this.traceArray.push([this.x, this.y]);
	} 
    
};

Ball.prototype.velocityChange = function(modulus, direction) {
	this.speedx = this.speedx + dotProduct(direction, [1,0]) * modulus;
	this.speedy = this.speedy + dotProduct(direction, [0,1]) * modulus;
};

function randomBalls(x1, y1, x2, y2, density, uniformMass, uniformRadius, colour, previousBalls) {
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
			x = Math.random() * (x2 - x1) + x1;
			y = Math.random() * (y2 - y1) + y1;
			for (var i=0; i<randomBalls.length; i++) {
				if ( distanceTo([x, y], [randomBalls[i].x, randomBalls[i].y]) <= (radius + randomBalls[i].radius) ) {
					succesful = false;
				}
			}
		}
		randomBalls.push(new Ball(x, y, 0, 0, radius, mass, 1, colour));
		numNewBalls += 1;
	}
	return randomBalls;
}

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
			//document.write(initE + ", " + finalE + "\n");
		}
	}
}

//////////////////////////////////////////////////////////////
/////////////////// SPRING FUNCTIONS /////////////////////////
//////////////////////////////////////////////////////////////

function Spring(ball1, ball2, k, length, dampening) {
	this.ball1 = ball1;
	this.ball2 = ball2;
	this.k = k/1000;
	this.length = length;
	this.extension = 0;
	this.dampening = dampening/200;
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


//////////////////////////////////////////////////////////////
///////////////////// DRAW FUNCTIONS /////////////////////////
//////////////////////////////////////////////////////////////

var canvas = document.getElementById("animCanvas");
var ctx = canvas.getContext("2d");

function drawBall(ball) {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2);
    ctx.fillStyle = ball.colour;
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
    var colours = ["#FFFFFF", "#FFBBBB", "#FF9999", "#FF7777", "#FF5555", "#FF3333", "#FF2222", "#FF1111"];
    var forces  = [0, 0.02, 0.04, 0.06, 0.08, 0.1, 0.12, 0.14];
    var max = 0;
    for (var i=0; i<forces.length; i++) {
		if ( Math.abs(spring.extension*spring.k) >= forces[i] ) {
			max = i;
		}
	}
    ctx.strokeStyle = colours[max];
    ctx.lineWidth = 5;
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

var balls =[];
var springs = [];
//var balls = [new Ball(200,120,-1.5,0.5,10,1,1,"#0095DD"), new Ball(300,120,1.5,0,10,1,1,"#0095DD"), new Ball(300,180,0,-1,20,4,1,"#0095DD")];//, new Ball(100,150,1,0.1,20,5,1,"#FF9599"), new Ball(300, 35, 1, 0.2, 5, 0.5, 1, "#3365F0"), new Ball(350, 100, 0.5, -0.2, 15, 2, 1, "#D065F0")];
//~ var springs = [new Spring(balls[0], balls[1], 1, 100), new Spring(balls[1], balls[2], 0.5, 60), new Spring(balls[2], balls[0], 1, 116)];

balls = randomBalls(0, 20, canvas.width, canvas.height-20, 15, false, 6, "#FF9599", []);
balls.concat( randomBalls(canvas.width/2,0, canvas.width, 20, 15, false, 6, "#00D099", balls) );
balls.concat( randomBalls(0,0, canvas.width/2, 20, 15, false, 6, "#FFD099", balls) );
//balls[balls.length-1].trace=true;
balls.concat( randomBalls(0,canvas.height-20, canvas.width, canvas.height, 15, false, 6, "#99B0DD", balls) );


//~ var balls = [new Ball(canvas.width/2, 120, 2.2, 1.4, 10, 1, 1,"#0095DD")];//, new Ball(200, 240, 1, -2, 10, 1, 1,"#0095DD") ];
//~ //balls[0].trace = true;
//~ var springs = [new Spring([canvas.width/2, 0], balls[0], 0.5, 120, 0), new Spring([canvas.width/2, canvas.height], balls[0], 0.5, canvas.height-120, 0)];//, new Spring(balls[0], balls[1], 1000, 120, 100)];

function draw() {
	// Get the date and time at beginning
	var date = new Date();
	var time = date.getTime();
	ctx.clearRect(0,0,canvas.width, canvas.height);
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
	document.getElementById("originalEnergy").innerHTML = first;
	document.getElementById("energy").innerHTML = energy;
	date = new Date();
	if ( date.getTime() - time < 6) {
		setTimeout(draw, 6 - date.getTime() + time);
	}
	else {
		setTimeout(draw, 1);
	}
}

draw();
