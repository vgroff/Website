var physicsEngine = physicsEngine || {};

physicsEngine.CanvasView = Backbone.View.extend({

	// Instead of generating a new element, bind to the existing skeleton of
	// the App already present in the HTML.
	el: '#physicsCanvas',
	rendering: false,
	playing: false,
	
	events: {
		'mousedown': 'userInteract',
	},

	
	initialize: function() {
		this.self = this;
		this.listenTo(physicsEngine.optionsView, 'togglePlay', this.togglePlay);
		this.listenTo(physicsEngine.optionsView, 'stepAnimation', this.step);
	},
	
	render: function(applyPhysics) {
		this.drawAll();
	},
	
	animate: function() {
		if (this.rendering === false) {
			var date = new Date();
			var time = date.getTime();
			this.rendering = true;
			
			this.applyPhysics();
			this.render();
			
			date = new Date();
			if (this.playing === true) {
				if ( date.getTime() - time < physicsEngine.fps) {
					setTimeout(this.animate.bind(this), physicsEngine.fps - date.getTime() + time);
				}
				else {
					setTimeout(this.animate.bind(this), 1);
				} 
			}
			this.rendering = false;
		}	
	},
	
	togglePlay: function() {
		this.playing = !this.playing;
		if (this.playing) { this.animate();}
	},
	
	step: function() {
		if (!this.playing) {
			this.animate();
		}
	},
	
	applyPhysics: function() {
		// Do all velocity calcs first, then move, then do collisions
		physicsEngine.springs.forEach( function(spring) {
			spring.actionSpring();
		});
		physicsEngine.balls.forEach( function(ball) {
			ball.applyGravity();
			ball.applyFriction();
			ball.move();
		});	
		this.applyCollisions();
		physicsEngine.balls.forEach( function(ball) {
			ball.applyContainer();
		});	
		
	},
	
	applyCollisions: function() {
		var numberOfRows = Math.floor(physicsEngine.balls.length / 100) + 1;
		var numberOfRows = 13;
		var rowSeparation = physicsEngine.canvas.height / numberOfRows;
		var colSeparation = physicsEngine.canvas.width  / numberOfRows;
		var grid = [];
		var extras = [];
		var self = this;
		for (var i=0; i<numberOfRows; i++) {
			grid.push([]);
			for (var j=0; j<numberOfRows; j++) {
				grid[i].push([[],[]]);
			}
		}
		// Adding to the grid and secondary grid 
		physicsEngine.balls.forEach( function(ball) {
			ball.set("collided",[]);
			if ( (ball.get("radius") >= rowSeparation/2) || (ball.get("radius") >= colSeparation/2) ) {
				extras.push(ball);
			}
			else {
				let col = Math.floor(ball.get("x") / colSeparation);
				let row = Math.floor(ball.get("y") / rowSeparation);
				grid[row][col][0].push(ball);
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
		});
		// Possibly calculating some bounces twice, but this doesn't introduce extra energy so it doesn't really matter.
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
	
	ballsColliding: function(ball1, ball2) {
		if ( distanceTo(ball1.getVectorPos(), ball2.getVectorPos()) <= (ball1.get("radius") + ball2.get("radius")) ) {
			return true;
		}
		return false
	},
	
	collide: function(ball1, ball2) {
		var vectorTo = directionTo(ball1.getVectorPos(), ball2.getVectorPos());
		if ( (dotProduct(vectorTo, [ball1.get("speedX")-ball2.get("speedX"), ball1.get("speedY")-ball2.get("speedY")]) > 0) ) { 	
			if (ball1.get("bounciness") > ball2.get("bounciness")) {
				var bounciness = ball1.get("bounciness");
			}
			else {
				var bounciness = ball2.get("bounciness");
			}
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
			//~ var initE = 0.5 * (ball1.mass * Math.pow(initSpeed1, 2) + ball2.mass * Math.pow(initSpeed2, 2))	;
			//~ var finalE = 0.5 * (ball1.mass * Math.pow(finalSpeed1, 2) + ball2.mass * Math.pow(finalSpeed2, 2));
			
		}
	},
	
	fillRandomly: function(x1, y1, x2, y2, number, ballProps) {
		var successes= 0;
		var successiveFailures = 0;
		var balls = [];
		var radius = ballProps["radius"] || physicsEngine.Balls.defaults["radius"];
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
				physicsEngine.balls.add(new physicsEngine.Ball($.extend({}, ballProps, {x:x, y:y})));
			}
		}
	},
	
	userInteract: function(evt) {
		var self = this.self;
		var currentMousePos = [evt.pageX - this.$el.offset().left, evt.pageY- this.$el.offset().top];
		var currentId = null;
		var spring
		physicsEngine.balls.forEach( function(ball) {	
			if (distanceTo(currentMousePos, ball.getVectorPos()) <= ball.get("radius")  ){
				var clickedBall = ball;
				spring = new physicsEngine.Spring({point1:ball, point2: currentMousePos, length:0, k:0.005*ball.get("mass"), dampening:0});
				physicsEngine.springs.add(spring);
				var oldFriction = ball.get("friction");
				ball.set("friction", 0.08);
				self.$el.on("mouseup", function(evt) {
					spring.destroy();
					ball.set("friction", oldFriction);
					self.$el.off("mouseup");
					self.$el.off("mousemouve");
				});
				self.$el.on("mousemove", function(evt) {
					currentMousePos = [evt.pageX - self.$el.offset().left, evt.pageY- self.$el.offset().top];
					spring.set("point2", currentMousePos);
				});
			} 
		});
	},
	
	drawAll: function() {
		let self = this;
		physicsEngine.ctx.clearRect(0,0,physicsEngine.canvas.width, physicsEngine.canvas.height);
		physicsEngine.balls.forEach( 		function(ball) {self.drawBall(ball);} );
		physicsEngine.springs.forEach( 		function(spring) {self.drawSpring(spring);} );
		physicsEngine.containers.forEach( 	function(cont) {self.drawContainer(cont);} );
	},
	
	drawBall: function(ball) {
		let ctx = physicsEngine.ctx;
		ctx.beginPath();
		ctx.arc(ball.get("x"), ball.get("y"), ball.get("radius"), 0, Math.PI*2);
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
		
		let traceArray = ball.get("traceArray");
		
		if (traceArray.length !== 0) {
			ctx.beginPath();
			for (var i=0; i < traceArray.length-1; i++) {
				ctx.strokeStyle = ball.colour;
				ctx.lineWidth = 2;
				ctx.moveTo(traceArray[i][0], traceArray[i][1]);
				ctx.lineTo(traceArray[i+1][0], traceArray[i+1][1]);
			}
			ctx.stroke();
			ctx.closePath();
		}
	},
	
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

	drawSpring: function(spring) {
		let ctx = physicsEngine.ctx;
		ctx.beginPath();
		if (spring.get("colour") == "strengthMap") {
			var colours = ["#FFFFFF", "#FFBBBB", "#FF9999", "#FF7777", "#FF5555", "#FF3333", "#FF2222", "#FF1111"];
			var forces  = [0, 0.02, 0.04, 0.06, 0.08, 0.1, 0.12, 0.14];
			var max = 0;
			for (var i=0; i<forces.length; i++) {
				if ( Math.abs(spring.get("extension")*spring.get("k")) >= forces[i] ) {
					max = i;
				}
			}
			ctx.strokeStyle = colours[max];
		}
		else {
			ctx.strokeStyle = spring.coloured;
		}
		ctx.lineWidth = 2;
		if (spring.get("point1") instanceof Array) {
			ctx.moveTo(spring.get("point1")[0], spring.get("point1")[1]);
		}
		else {
			ctx.moveTo(spring.get("point1").get("x"), spring.get("point1").get("y"));
		}
		if (spring.get("point2") instanceof Array) {
			ctx.lineTo(spring.get("point2")[0], spring.get("point2")[1]);
		}
		else {
			ctx.lineTo(spring.get("point2").get("x"), spring.get("point2").get("y"));
		}
		ctx.stroke();
		ctx.closePath();	
	},
});

physicsEngine.canvasView = new physicsEngine.CanvasView();
