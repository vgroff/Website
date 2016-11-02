var physicsEngine = physicsEngine || {};

// The view used to display the canvas and do the physics
physicsEngine.CanvasView = Backbone.View.extend({

	// Instead of generating a new element, bind to the existing skeleton of
	// the App already present in the HTML.
	el: '#physicsCanvas',
	rendering: false,
	playing: false,
	selectedBall: null,
	speedToPixel: 10,
	averageFPS: 0,
	i: 0,
	
	events: {
		'mousedown': 'userInteract',
	},

	// Setting up listeners
	initialize: function() {
		this.self = this;
		this.listenTo(physicsEngine.optionsView, 'togglePlay', this.togglePlay);
		this.listenTo(physicsEngine.optionsView, 'stepAnimation', this.step);
		this.listenTo(physicsEngine.balls, 'change', this.render);
		this.listenTo(physicsEngine.balls, 'add', this.render);
		this.listenTo(physicsEngine.balls, 'remove', this.render);
		this.listenTo(physicsEngine.springs, 'change', this.render);
		this.listenTo(physicsEngine.springs, 'add', this.render);
		this.listenTo(physicsEngine.springs, 'remove', this.render);
		this.listenTo(physicsEngine.containers, 'change', this.render);
		this.listenTo(physicsEngine.containers, 'add', this.render);
		this.listenTo(physicsEngine.containers, 'remove', this.render);
		this.listenTo(physicsEngine.graphs, 'change', this.render);
		this.listenTo(physicsEngine.graphs, 'add', this.render);
		this.listenTo(physicsEngine.graphs, 'remove', this.render);
		this.listenTo(this, "render", this.render);
	},
	
	// Draws to canvas
	render: function(applyPhysics) {
		if (physicsEngine.log) { console.log("redrawing canvas"); }
		this.drawAll();
	},
	
	// Recursive function that runs the engine, doing the physics then drawing. It then calls itself depending on the this.playing variable.
	animate: function() {
		if (this.rendering === false) {
			this.i += 1;
			var date = new Date();
			var time = date.getTime();
			this.rendering = true;
			// Do the physics
			this.applyPhysics();
			if (physicsEngine.log) {
				var date1 = new Date();
				console.log("Physics Time:");
				console.log(date1.getTime()-time);
			}
			// Draw to canvas
			this.render();
			if (physicsEngine.log) {
				var date2 = new Date();
				console.log("Draw Time:");
				console.log(date2.getTime() - date1.getTime());
			}
			
			// Plot graph points
			physicsEngine.graphs.forEach( function(graph) {
				graph.trigger("tick");
			});

			// Calibrate to correct FPS
			date = new Date();
			var instaFPS = date.getTime() - time;
			var halfLife = 0.7;
			this.averageFPS = halfLife * instaFPS + this.averageFPS * (1-halfLife)
			if (physicsEngine.log) { if (this.i % 20 == 0) {console.log("AverageFPS");console.log(this.averageFPS);} }
			if (this.playing === true) {
				if ( instaFPS < physicsEngine.fps) {
					setTimeout(this.animate.bind(this), physicsEngine.fps - instaFPS);
				}
				else {
					setTimeout(this.animate.bind(this), 1);
				} 
			}
			this.rendering = false;
		}	
	},
	
	// Toggle the playing variable and start the animate function if necessary
	togglePlay: function() {
		this.playing = !this.playing;
		if (this.playing) { 
			this.animate();
			this.selectedBall = null;
		}
	},
	
	// If paused, runs the animate function (which will only run once due to the fact it is paused)
	step: function() {
		if (!this.playing) {
			this.animate();
		}
	},
	
	// Does the physics calculations at time t
	applyPhysics: function() {
		// Do all velocity calcs first, then move, then do collisions
		var self = this;
		if (self.userSpring) {
			self.actionSpring(self.userSpring);
		}
		physicsEngine.springs.forEach( function(spring) {
			self.actionSpring(spring);
		});
		physicsEngine.balls.forEach( function(ball) {
			ball.applyGravity();
			ball.applyFriction();
			ball.move();
		});	
		this.applyCollisions();
		physicsEngine.balls.forEach( function(ball) {
			//~ var ball = ball;
			//~ var self = self;
			physicsEngine.ramps.forEach( function(ramp) {
				ball.applyRamp(ramp);
			});
			ball.applyContainer();
			ball.trigger("updated");
		});	
		
	},
	
	// Does the spring physics
	actionSpring: function(spring) {
		
		let point1 = spring.get("point1");
		let point2 = spring.get("point2");
		var points = 0;
		// Setting up depending on if there are 1 or 2 balls
		if ( point1 instanceof Array ) {
			var vector = point1;
			var speed = [0,0];
		}
		else {
			point1 = physicsEngine.balls.get(point1);
			if (!point1) { return; }
			var vector = physicsEngine.balls.get(point1).getVectorPos();
			var speed  = physicsEngine.balls.get(point1).getVectorSpeed();
			points += 1;
		}	
		if (point2 instanceof Array) {
			var vector1 = point2;
			var speed1 = [0,0];
		}
		else {
			point2 = physicsEngine.balls.get(point2);
			if (!point2) { return; }
			var vector1 = physicsEngine.balls.get(point2).getVectorPos();
			var speed1  = physicsEngine.balls.get(point2).getVectorSpeed();
			points += 1;
		}

		var extension = distanceTo(vector, vector1) - spring.get("length");
		spring.set("extension", extension, {silent:true});
		let direction = spring.get("direction");	
				
		if ( (direction == "both") || (direction == "pull" && extension > 0) || (direction == "push" && extension < 0) ) {
			// Changing the speeds due to extension
			force = spring.get("k") * extension;
			if ( !( point1 instanceof Array ) ) {
				point1.changeSpeedBy(force/point1.get("mass"), directionTo(vector, vector1));
				speed  = physicsEngine.balls.get(point1).getVectorSpeed();
			}	
			
			if ( !( point2 instanceof Array ) ) {
				point2.changeSpeedBy(force/point2.get("mass"), directionTo(vector1, vector));
				speed1  = physicsEngine.balls.get(point2).getVectorSpeed();
			}
			// Changing the speeds due to dampening
			var relativeSpeed = dotProduct([speed1[0]-speed[0], speed1[1]-speed[1]], directionTo(vector1, vector));
			if ( !( point1 instanceof Array ) ) {
				point1.changeSpeedBy(spring.get("dampening")*relativeSpeed/points, directionTo(vector1, vector));
				speed  = physicsEngine.balls.get(point1).getVectorSpeed();
			}	
			
			if ( !( point2 instanceof Array ) ) {
				point2.changeSpeedBy(spring.get("dampening")*relativeSpeed/points, directionTo(vector, vector1));
				speed1  = physicsEngine.balls.get(point2).getVectorSpeed();
			}
		}
		
		// Checks if fail point had passed
		if (spring.get("failPoint")) {
			if (extension	>= spring.get("failPoint")) {
				spring.destroy();
			}
		}

	},
	
	// Does the collision physicsby splitting the area into a grid as this is more efficient
	applyCollisions: function() {
		var numberOfRows = Math.floor(physicsEngine.balls.length / 100) + 1;
		var numberOfRows = 13;
		var rowSeparation = physicsEngine.canvas.height / numberOfRows;
		var colSeparation = physicsEngine.canvas.width  / numberOfRows;
		var grid = [];
		var extras = [];
		var self = this;
		// Building a grid
		for (var i=0; i<numberOfRows; i++) {
			grid.push([]);
			for (var j=0; j<numberOfRows; j++) {
				grid[i].push([[],[]]);
			}
		}
		// Adding balls to the grid and secondary grid
		if (this.i % 2 == 0) {
			var start = 0;
			var end = physicsEngine.balls.last().get("id");
		}
		else {
			var start = physicsEngine.balls.last().get("id");
			var end = 0;			
		}
		var k = start; 
		while (true){
			var ball = physicsEngine.balls.get(k);
			if (start > end) { 
				k--;
				if (k < end - 1) {break;}
			}
			if (end > start) {
				 k++;
				if (k > end + 1) {break;}
			}
			if (ball) {
				// If the ball is too large to work in the grid, it goes in the extras pile
				if ( (ball.get("radius") >= rowSeparation/2) || (ball.get("radius") >= colSeparation/2) ) {
					extras.push(ball);
				}
				else {
					let col = Math.floor(ball.get("x") / colSeparation);
					let row = Math.floor(ball.get("y") / rowSeparation);
					// Find where it is in the grid
					if ((row>=0) && (row<numberOfRows) && (col<numberOfRows) && (col>=0)){
						grid[row][col][0].push(ball);
						// Cycle over nearby grids to see if there is any overlap, if so add it to the secondary grid
						for (var i=-1; i<=1; i++) {
							for (var j=-1; j<=1; j++) {
								if (((i!==0) || (j!==0)) && (row+i>=0) && (row+i<numberOfRows) && (col+j<numberOfRows) && (col+j>=0)) {
									let x = (col+0.5+0.5*j)*colSeparation;
									let y = (row+0.5+0.5*i)*rowSeparation;
									if (i===0) { y =ball.get("y");}
									if (j===0) { x = ball.get("x");}
									var pos = ball.getVectorPos();
									if ( ball.get("radius") >= distanceTo(ball.getVectorPos(), [x,y]) ) {
										grid[row+i][col+j][1].push(ball);
									}
								}
							}
						}
					}
					else { extras.push(ball); }
				}
			}
		}
		// Iterating over the primary grid, calculating collisions with all primary and secondary balls
		// (In certain unlikley conditions, this may be calculating some bounces twice, but this doesn't introduce extra energy and is not physically incorrect so it doesn't matter physics-wise.)
		for (var i=0; i<numberOfRows; i++) {
			for (var j=0; j<numberOfRows; j++) {
				for (var k=0; k<grid[i][j][0].length; k++) {
					for (var l=k+1; l<grid[i][j][0].length; l++) {
						let ball1 = grid[i][j][0][k];
						let ball2 = grid[i][j][0][l];
						if ( ( distanceTo(ball1.getVectorPos(), ball2.getVectorPos()) <= (ball1.get("radius") + ball2.get("radius") ) ) ) {
							self.collide(ball1, ball2);
						}
					}
					for (var l=0; l<grid[i][j][1].length; l++) {
						let ball1 = grid[i][j][0][k];
						let ball2 = grid[i][j][1][l];
						if ( ( distanceTo(ball1.getVectorPos(), ball2.getVectorPos()) <= (ball1.get("radius") + ball2.get("radius") ) ) ) {
							self.collide(ball1, ball2);
						}						
					}
					for (var l=0; l<extras.length; l++) {
						let ball1 = grid[i][j][0][k];
						let ball2 = extras[l];
						if ( ( distanceTo(ball1.getVectorPos(), ball2.getVectorPos()) <= (ball1.get("radius") + ball2.get("radius") ) ) ) {
							self.collide(ball1, ball2);
						}						
					}
				}
			}
		}
		// Iterating extras with each other
		for (var i=0; i<extras.length; i++) {
			for (var l=0; l<extras.length; l++) {
				let ball1 = extras[i];
				let ball2 = extras[l];
				if ( ( distanceTo(ball1.getVectorPos(), ball2.getVectorPos()) <= (ball1.get("radius") + ball2.get("radius")) ) ) {
					self.collide(ball1, ball2);
				}						
			}
		}
	},
	
	// Check whether two balls are (physically) colliding or not (relative speed is in the collide function)
	ballsColliding: function(ball1, ball2) {
		if ( distanceTo(ball1.getVectorPos(), ball2.getVectorPos()) <= (ball1.get("radius") + ball2.get("radius")) ) {
			return true;
		}
		return false
	},
	
	// Carry out the collision if necessary
	collide: function(ball1, ball2) {
		var vectorTo = directionTo(ball1.getVectorPos(), ball2.getVectorPos());
		if ( (dotProduct(vectorTo, [ball1.get("speedX")-ball2.get("speedX"), ball1.get("speedY")-ball2.get("speedY")]) > 0) ) { 	
			// Pick the higher bounciness (arbitrary)
			if (ball1.get("bounciness") > ball2.get("bounciness")) {
				var bounciness = ball1.get("bounciness");
			}
			else {
				var bounciness = ball2.get("bounciness");
			}
			// Momentum conservation along direction of collision
			var initSpeed1 = dotProduct(vectorTo, ball1.getVectorSpeed() );
			var initSpeed2 = dotProduct(vectorTo, ball2.getVectorSpeed() );
			let m1 = ball1.get("mass");
			let m2 = ball2.get("mass");
			var finalSpeed1 = (initSpeed1 * m1 / m2 + initSpeed2 + bounciness*(initSpeed2 - initSpeed1)) / (1 + m1/m2);
			var finalSpeed2 = finalSpeed1 - bounciness * (initSpeed2 - initSpeed1);
			ball1.changeSpeedBy(-initSpeed1, vectorTo);
			ball2.changeSpeedBy(-initSpeed2, vectorTo);
			ball1.changeSpeedBy(finalSpeed1, vectorTo);
			ball2.changeSpeedBy(finalSpeed2, vectorTo);			
		}
	},
	
	// Randomly fill an area with a certain number of balls
	fillRandomly: function(x1, y1, x2, y2, number, ballProps) {
		var successes= 0;
		var successiveFailures = 0;
		var balls = [];
		let ball = new physicsEngine.Ball();
		var radius = ballProps["radius"] || ball.get("radius");
		// Stop if it seems impossible (2000 successive failures) otherwise continue until filled up
		while ((successes < number) && (successiveFailures < 2000)){
			var x = Math.random() * (x2 - x1) + x1;
			var y = Math.random() * (y2 - y1) + y1;
			var failed = false;
			physicsEngine.balls.forEach( function(ball) {
				if (distanceTo([x,y], ball.getVectorPos()) <= ball.get("radius") + radius){
					successiveFailures++;
					failed = true;
				}
			});
			if (!failed) {
				successiveFailures = 0;
				successes++;
				physicsEngine.balls.add(new physicsEngine.Ball($.extend({}, ballProps, {x:x, y:y, id:physicsEngine.balls.nextId()})));
			}
		}
	},
	
	// Deals with the various possibilities involved in user interaction with the canvas
	userInteract: function(evt) {
		var self = this.self;
		var currentMousePos = [evt.pageX - this.$el.offset().left, evt.pageY- this.$el.offset().top];
		var currentId = null;
		var spring
		// If playing, create a spring to the clicked ball
		if (this.playing) {
			physicsEngine.balls.forEach( function(ball) {	
				// if this is the clicked ball, create the spring
				if (distanceTo(currentMousePos, ball.getVectorPos()) <= ball.get("radius")  ){
					var clickedBall = ball;
					spring = new physicsEngine.Spring({point1:ball.get("id"), point2: currentMousePos, length:0, k:0.005*ball.get("mass"), dampening:0, id: physicsEngine.springs.nextId()});
					self.userSpring = spring;
					var oldFriction = ball.get("friction");
					ball.set("friction", 0.08, {silent:true});
					// Get rid of the spring on releasing the mouse
					self.$el.on("mouseup", function(evt) {
						self.userSpring = null;
						ball.set("friction", oldFriction, {silent:true});
						self.$el.off("mouseup");
						self.$el.off("mousemove");
					});
					// Move the spring on moving the mouse
					self.$el.on("mousemove", function(evt) {
						currentMousePos = [evt.pageX - self.$el.offset().left, evt.pageY- self.$el.offset().top];
						self.userSpring.set("point2", currentMousePos, {silent:true});
					});
				} 
			});
		}
		// Otherwise, move the balls around or change their speed
		else {
			var ballClicked = false;
			var currentMousePos = [evt.pageX - self.$el.offset().left, evt.pageY- self.$el.offset().top];
			physicsEngine.balls.forEach( function(ball) {
				// If you've clicked a ball, it moves with your mouse
				if (distanceTo(currentMousePos, ball.getVectorPos()) <= ball.get("radius")  ){
					ballClicked = true;
					self.selectedBall = ball;
					self.trigger("render");
					// Moving with the mouse
					self.$el.on("mousemove", function(evt) {
						currentMousePos = [evt.pageX - self.$el.offset().left, evt.pageY- self.$el.offset().top];
						self.selectedBall.set("x", currentMousePos[0], {silent:true});
						self.selectedBall.set("y", currentMousePos[1]);
					});
					self.$el.on("mouseup", function(evt) {
						// Check if placed colliding with ramp, if so place on ramp
						physicsEngine.ramps.forEach( function(ramp) {
							if (self.selectedBall.touchingRamp(ramp)) { self.selectedBall.placeOnRamp(ramp); }
						});
						self.$el.off("mouseup");
						self.$el.off("mousemove");
					});
				} 	
			});
			// If you haven't clicked a ball, but previously had one selected, change the speed of that ball
			if ( (!ballClicked) && (self.selectedBall) )  {
				self.selectedBall.set("speedX", (currentMousePos[0] - self.selectedBall.get("x"))/this.speedToPixel, {silent:true});
				self.selectedBall.set("speedY", (currentMousePos[1] - self.selectedBall.get("y"))/this.speedToPixel);
			}
		}
	},
	
	// Call the various drawing functions in the desired order
	drawAll: function() {
		let self = this;
		physicsEngine.ctx.clearRect(0,0,physicsEngine.canvas.width, physicsEngine.canvas.height);
		physicsEngine.ramps.forEach( 		function(ramp) { self.drawRamp(ramp);} );
		physicsEngine.springs.forEach( 		function(spring) {self.drawSpring(spring);} );
		physicsEngine.balls.forEach( 		function(ball) {self.drawBall(ball);} );
		physicsEngine.containers.forEach( 	function(cont) {self.drawContainer(cont);} );
		if (this.userSpring) { this.drawSpring(this.userSpring); }
		if (this.selectedBall) { this.highlightBall(this.selectedBall);}
	},
	
	// Draw a ramp
	drawRamp: function(ramp) {
		let positions = ramp.getVectorPositions();
		let ctx = physicsEngine.ctx;
		ctx.strokeStyle = "#000000";
		ctx.beginPath();
		ctx.lineWidth = 2;
		ctx.moveTo( positions[0][0], positions[0][1])
		ctx.lineTo( positions[1][0], positions[1][1])
		ctx.stroke();
		ctx.closePath();	
	},
	
	// Draw a ball
	drawBall: function(ball) {
		let ctx = physicsEngine.ctx;
		// Draw circle
		ctx.beginPath();
		ctx.arc(ball.get("x"), ball.get("y"), ball.get("radius"), 0, Math.PI*2);
		// Choose the colour and fill in the circile
		if (physicsEngine.heatmap) {
			var colours = ["#000000", "#6666AA", "#3333BB", "#0000FF", "#BB3333", "#FF0000"];//3333BB
			var speeds = [0, 0.4, 0.8, 1.4, 1.8, 2.4];
			var index = 0;
			for (var i=0; i < speeds.length; i++) {
				var speed = modulus([ball.get("speedX"), ball.get("speedY")]);
				if ( speed >= speeds[i]) {
					index = i;
				}
			}
			ctx.fillStyle = colours[index];
		}
		else {
			ctx.fillStyle = ball.get("colour");
		}
		ctx.fill();
		ctx.closePath();
		
		// Draw the trace of the movement if it exists
		let traceArray = ball.get("traceArray");
		
		if (traceArray.length !== 0) {
			ctx.beginPath();
			for (var i=0; i < traceArray.length-1; i++) {
				ctx.strokeStyle = ball.get("colour");
				ctx.lineWidth = 2;
				ctx.moveTo(traceArray[i][0], traceArray[i][1]);
				ctx.lineTo(traceArray[i+1][0], traceArray[i+1][1]);
			}
			ctx.stroke();
			ctx.closePath();
		}
		// If paused, draw the balls velocity
		if (!this.playing) {
			ctx.beginPath();
			ctx.strokeStyle = "#000000";
			ctx.moveTo(ball.get("x"), ball.get("y"));
			ctx.lineTo(ball.get("x") + ball.get("speedX")*this.speedToPixel, ball.get("y")+ball.get("speedY")*this.speedToPixel);	
			ctx.stroke();
			ctx.closePath();		
		}
	},
	
	// Used to highlight the ball clicked by the user if paused
	highlightBall: function(ball) {
		let ctx = physicsEngine.ctx;
		ctx.beginPath();
		ctx.strokeStyle = "#000000";
		ctx.arc(ball.get("x"), ball.get("y"), ball.get("radius"), 0, Math.PI*2);
		ctx.stroke();
		ctx.closePath();
	},
	
	// Draw a container
	drawContainer: function(container) {
		let ctx = physicsEngine.ctx;
		ctx.beginPath();
		ctx.lineWidth = 2;
		ctx.strokeStyle = "#000000";
		ctx.moveTo(container.get("xMin"), container.get("yMin"));
		ctx.lineTo(container.get("xMax"), container.get("yMin"));
		ctx.lineTo(container.get("xMax"), container.get("yMax"));
		ctx.lineTo(container.get("xMin"), container.get("yMax"));
		ctx.lineTo(container.get("xMin"), container.get("yMin"));
		ctx.stroke();
		ctx.closePath();
	},

	// Draw a spring
	drawSpring: function(spring) {
		try {
			let point1 = spring.get("point1");
			let point2 = spring.get("point2");
			
			if ( point1 instanceof Array ) {
				var vector = point1;
			}
			else {
				point1 = physicsEngine.balls.get(point1);
				if (!point1) { return; }
				var vector = physicsEngine.balls.get(point1).getVectorPos();
			}	
			if (point2 instanceof Array) {
				var vector1 = point2;
			}
			else {
				point2 = physicsEngine.balls.get(point2);
				if (!point2) { return; }
				var vector1 = physicsEngine.balls.get(point2).getVectorPos();
			}
			var extension = distanceTo(vector, vector1) - spring.get("length");
			let ctx = physicsEngine.ctx;
			ctx.beginPath();
			if (spring.get("colour") == "strengthMap") {
				var colours = ["#FFFFFF", "#FFBBBB", "#FF9999", "#FF7777", "#FF5555", "#FF3333", "#FF2222", "#FF1111"];
				var forces  = [0, 0.02, 0.04, 0.06, 0.08, 0.1, 0.12, 0.14];
				var max = 0;
				for (var i=0; i<forces.length; i++) {
					if ( Math.abs(extension*spring.get("k")) >= forces[i] ) {
						max = i;
					}
				}
				ctx.strokeStyle = colours[max];
			}
			else {
				ctx.strokeStyle = spring.get("colour");
			}
			ctx.lineWidth = 2;
			if (spring.get("point1") instanceof Array) {
				ctx.moveTo(spring.get("point1")[0], spring.get("point1")[1]);
			}
			else {
				let ball = physicsEngine.balls.get(spring.get("point1"));
				ctx.moveTo(ball.get("x"), ball.get("y"));
			}
			if (spring.get("point2") instanceof Array) {
				ctx.lineTo(spring.get("point2")[0], spring.get("point2")[1]);
			}
			else {
				let ball = physicsEngine.balls.get(spring.get("point2"));
				ctx.lineTo(ball.get("x"), ball.get("y"));
			}
			ctx.stroke();
			ctx.closePath();	
		}
		catch (TypeError) {}
	},
});

physicsEngine.canvasView = new physicsEngine.CanvasView();
