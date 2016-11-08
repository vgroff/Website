var physicsEngine = physicsEngine || {};


physicsEngine.AppView = Backbone.View.extend({

	el: '#physicsEngine',


	events: {
	  'click #physicsResetButton': 'resetCollections',
	  'click .physicsEditHeadings': 'toggleSelectedHeading',
	  'click #moveToEngine': 'scrollToCanvas',
	},


	initialize: function() {
	  
		this.canvas = physicsEngine.canvas;
		this.canvasView = physicsEngine.canvasView;
		// Collections for editView
		var collections = [
			physicsEngine.balls,
			physicsEngine.springs,
			physicsEngine.ramps,
			physicsEngine.containers,
		];
		this.collections = collections;
		// Building the headings that link to the various routes
		for (var i=0; i < collections.length; i++) {
 			var heading  = $(document.createElement('a'));
 			// Pick the current heading depending on the current filter
			if ( ( (!physicsEngine.editFilter) && (i==0) ) || ( (physicsEngine.editFilter) && ((physicsEngine.editFilter === collections[i].name)) ) ) {
				heading.addClass("physicsEditHeadingSelected");
				this.currentHeading = heading;
			}
			// Fill up and add the headings
 			heading.attr("href", "#".concat(collections[i].name));
			heading.addClass("physicsEditHeadings");
			heading.html(collections[i].name);
			$("#physicsEngine").append(heading);
			
		}
		// Fill up and add the headings
		var heading  = $(document.createElement('a'));	
		heading.attr("href", "#Special");
		heading.addClass("physicsEditHeadings");
		heading.html("Special");
		if (physicsEngine.editFilter === "Special") {
			this.currentHeading = heading;
			heading.addClass("physicsEditHeadingSelected");
		}
		$("#physicsEngine").append(heading);
		// Building the editViews for each route
		var uiDiv = $(document.createElement('div'));
		uiDiv.attr("id", "physicsEngineUI")
		for (var i=0; i < collections.length; i++) {
			var editView = new physicsEngine.EditView(collections[i]);
			uiDiv.append(editView.$el);
			// Hiding it if not equal to the current filter
			if (!( ( (!physicsEngine.editFilter) && (i==0) ) || ( (physicsEngine.editFilter) && ((physicsEngine.editFilter === collections[i].name)) ) )) {
				editView.$el.hide();
			}
		}
		var specialView = new physicsEngine.SpecialView();
		uiDiv.append(specialView.$el);
		if ( !(physicsEngine.editFilter) || ((physicsEngine.editFilter !== "Special")) ) {specialView.$el.hide();}
		this.moveToTopButton  = $(document.createElement('button'));
		this.moveToTopButton.attr("id", "moveToEngine");
		this.moveToTopButton.html( "Return To Simulation" );
		uiDiv.append(this.moveToTopButton); 
		
		$("#physicsEngine").append(uiDiv);
		
		$(".physicsEditHeadings").css('cursor', 'pointer');
		
		this.listenTo(physicsEngine.graphs, "add", this.renderGraph);

		this.render();
	},

	// Render the canvas for the first time
	render: function() {
		this.canvasView.render();
	},
	
	// Toggles class change when a different heading is selected
	toggleSelectedHeading: function(evt) {
		this.currentHeading.removeClass("physicsEditHeadingSelected");
		this.currentHeading = $(evt.target);
		this.currentHeading.addClass("physicsEditHeadingSelected");
	},
	
	scrollToCanvas: function() {
		this.canvasView.$el.get(0).scrollIntoView();
	},
	
	renderGraph: function(model) {
		var graph = new physicsEngine.GraphView({model:model});
		$("#physicsEngineGraphingArea").append(graph.$el);
	},
	
	resetCollections: function() {
		for (var i=0; i<this.collections.length; i++) {this.collections[i].reset();}
		physicsEngine.graphs.reset();
		physicsEngine.containers.add([new physicsEngine.Container({"id":physicsEngine.containers.nextId()})]);
	},
});


// EXAMPLE/TEST CASES
// CUBE

//~ physicsEngine.balls.add(new physicsEngine.Ball({x:250, y:150, mass:1, speedX: 3, speedY:-2, friction: 0, bounciness:0.1, id:physicsEngine.balls.nextId()}));
//~ physicsEngine.balls.add(new physicsEngine.Ball({x:350, y:150, mass:1, speedX: 3, speedY:2, friction: 0, bounciness:0.1, id:physicsEngine.balls.nextId()}));
//~ physicsEngine.balls.add(new physicsEngine.Ball({x:350, y:250, mass:1, speedX: -1, speedY:2, friction: 0, bounciness:0.1, id:physicsEngine.balls.nextId()}));
//~ physicsEngine.balls.add(new physicsEngine.Ball({x:250, y:250, mass:1, speedX: -1, speedY:-2, friction: 0, bounciness:0.1, id:physicsEngine.balls.nextId()}));
//~ physicsEngine.balls.add(new physicsEngine.Ball({x:300, y:200, mass:1, speedX: 1, friction: 0, bounciness:1, id:physicsEngine.balls.nextId()}));

//~ physicsEngine.balls.add(new physicsEngine.Ball({x:250, y:150, mass:1, speedX: 2, speedY:0, friction: 0, bounciness:0.1, id:physicsEngine.balls.nextId()}));
//~ physicsEngine.balls.add(new physicsEngine.Ball({x:350, y:150, mass:1, speedX: 2, speedY:0, friction: 0, bounciness:0.1, id:physicsEngine.balls.nextId()}));
//~ physicsEngine.balls.add(new physicsEngine.Ball({x:350, y:250, mass:1, speedX: 2, speedY:0, friction: 0, bounciness:0.1, id:physicsEngine.balls.nextId()}));
//~ physicsEngine.balls.add(new physicsEngine.Ball({x:250, y:250, mass:1, speedX: 2, speedY:0, friction: 0, bounciness:0.1, id:physicsEngine.balls.nextId()}));
//~ physicsEngine.balls.add(new physicsEngine.Ball({x:300, y:200, mass:1, speedX: 2, friction: 0, bounciness:1, id:physicsEngine.balls.nextId()}));
//~ physicsEngine.springs.add({point1:1, point2:2, length:100, dampening: 1, k:0.8, id:1, colour:"#0000FF"});
//~ physicsEngine.springs.add({point1:2, point2:3, length:100, dampening: 1, k:0.8, id:2, colour:"#0000FF"});
//~ physicsEngine.springs.add({point1:3, point2:4, length:100, dampening: 1, k:0.8, id:3, colour:"#0000FF"});
//~ physicsEngine.springs.add({point1:4, point2:1, length:100, dampening: 1, k:0.8, id:4, colour:"#0000FF"});
//~ physicsEngine.springs.add({point1:1, point2:5, length:50*Math.pow(2, 0.5), k:0.1*Math.pow(2, 0.8), dampening: 1, id:5, colour:"#0000FF"});
//~ physicsEngine.springs.add({point1:2, point2:5, length:50*Math.pow(2, 0.5), k:0.1*Math.pow(2, 0.8), dampening: 1, id:6, colour:"#0000FF"});
//~ physicsEngine.springs.add({point1:3, point2:5, length:50*Math.pow(2, 0.5), k:0.1*Math.pow(2, 0.8), dampening: 1, id:7, colour:"#0000FF"});
//~ physicsEngine.springs.add({point1:4, point2:5, length:50*Math.pow(2, 0.5), k:0.1*Math.pow(2, 0.8), dampening: 1, id:8, colour:"#0000FF"});
//~ physicsEngine.balls.add(new physicsEngine.Ball({x:500, y:200, mass:1, speedX: 0, friction: 0, bounciness:0.1, id:physicsEngine.balls.nextId()}));

// RIGID ROTATOR

function Scenario1() {
	physicsEngine.balls.add(new physicsEngine.Ball({x:350, y:150, mass:1, speedX: -1, speedY:0, friction: 0, bounciness:1, id:physicsEngine.balls.nextId()}));
	physicsEngine.balls.add(new physicsEngine.Ball({x:450, y:150, mass:1, speedX: 0, speedY:0, friction: 0, bounciness:1, id:physicsEngine.balls.nextId()}));
	physicsEngine.springs.add({point1:1, point2:2, length:100, dampening: 0.999, k:950, id:1, colour:"#0000FF"});

	physicsEngine.balls.add(new physicsEngine.Ball({x:150, y:150, mass:1, speedX: 0, speedY:0, friction: 0, trace: true, bounciness:1, id:physicsEngine.balls.nextId()}));
	physicsEngine.balls.add(new physicsEngine.Ball({x:250, y:150, mass:1, speedX: 0, speedY:0, friction: 0, bounciness:1, id:physicsEngine.balls.nextId()}));
	physicsEngine.springs.add({point1:3, point2:4, length:100, dampening: 0.999, k:950, id:2, colour:"#0000FF"});

	physicsEngine.balls.add(new physicsEngine.Ball({x:150, y:350, mass:1, speedX: 1, speedY:1, friction: 0, trace: true, bounciness:1, id:physicsEngine.balls.nextId()}));
	physicsEngine.balls.add(new physicsEngine.Ball({x:250, y:350, mass:1, speedX: 1, speedY:-1, friction: 0, trace: true, bounciness:1, id:physicsEngine.balls.nextId()}));
	physicsEngine.springs.add({point1:5, point2:6, length:100, dampening: 0.999, k:950, id:3, colour:"#0000FF"});
}

function Scenario2() {
	physicsEngine.g = 0.045;
	var pendulumX = 550;
	var pendulumLength = 130;
	var pendulumK = 0.0007;
	physicsEngine.balls.add(new physicsEngine.Ball({x:pendulumX, y:40+pendulumLength, mass:1, speedX: 0, speedY:1, friction: 0, bounciness:1, id:physicsEngine.balls.nextId()}));
	physicsEngine.springs.add({point1:1, point2:[pendulumX, 40], length:pendulumLength, dampening: 0, k:pendulumK, id:physicsEngine.springs.nextId(), });
	var cradleX = 250;
	var cradleLength = 150;
	var cradleRadius = 10;
	var cradleN = 5;
	for (var i =0; i < cradleN; i++) {
		var ballId = physicsEngine.balls.nextId();
		let speed = 0;
		if (i===0) {speed=-1;}
		physicsEngine.balls.add(new physicsEngine.Ball({x:cradleX+i*2*cradleRadius, y:40+cradleLength, mass:1, radius: cradleRadius, speedX: speed, speedY:0, friction: 0, bounciness:1, id:ballId}));
		physicsEngine.springs.add({point1:ballId, point2:[cradleX+i*2*cradleRadius, 40], length:cradleLength, dampening: 0.999, k:950, id:physicsEngine.springs.nextId(), });		
	}
	physicsEngine.canvasView.fillRandomly(60, 450, 620, 495, 25, {speedY:-1.5});
}

function Scenario3() {
	var pendulumX = 580;
	var pendulumLength = 130;
	var pendulumK = 0.0007;
	physicsEngine.balls.add(new physicsEngine.Ball({x:pendulumX, y:40+pendulumLength, mass:1, speedX: 0, speedY:1, friction: 0, bounciness:1, id:physicsEngine.balls.nextId()}));
	physicsEngine.springs.add({point1:physicsEngine.balls.nextId()-1, point2:[pendulumX, 40], length:pendulumLength, dampening: 0, k:pendulumK, id:physicsEngine.springs.nextId(), });
	physicsEngine.graphs.add( new physicsEngine.Graph({plottingBalls:[1], plottingDirection:[0,1], id: physicsEngine.graphs.nextId()}) );
	physicsEngine.g = 0.045;
	var doublePendulum = 395;
	var doublePendulumL = 100;
	physicsEngine.balls.add(new physicsEngine.Ball({x:doublePendulum, y:40+doublePendulumL, mass:1, speedX: 3 , speedY:0, friction: 0, bounciness:1, id:physicsEngine.balls.nextId()}));
	physicsEngine.balls.add(new physicsEngine.Ball({x:doublePendulum, y:40+doublePendulumL*2, mass:1, speedX: 1, speedY:0, friction: 0, bounciness:1, id:physicsEngine.balls.nextId()}));
	physicsEngine.springs.add({point1:physicsEngine.balls.nextId()-2, point2:[doublePendulum, 40], length:doublePendulumL, dampening: 0.999, k:950, colour:"#000000",id:physicsEngine.springs.nextId(), });
	physicsEngine.springs.add({point1:physicsEngine.balls.nextId()-2, point2:physicsEngine.balls.nextId()-1, length:doublePendulumL, dampening: 0.999, k:950, colour:"#000000", id:physicsEngine.springs.nextId(), });
	var cradleX = 110;
	var cradleLength = 150;
	var cradleRadius = 10;
	var cradleN = 5;
	for (var i =0; i < cradleN; i++) {
		var ballId = physicsEngine.balls.nextId();
		let speed = 0;
		if (i===0) {speed=-1;}
		physicsEngine.balls.add(new physicsEngine.Ball({x:cradleX+i*2*cradleRadius, y:40+cradleLength, mass:1, radius: cradleRadius, speedX: speed, speedY:0, friction: 0, bounciness:1, id:ballId}));
		physicsEngine.springs.add({point1:ballId, point2:[cradleX+i*2*cradleRadius, 40], length:cradleLength, dampening: 0.999, k:950, colour:"#000000", id:physicsEngine.springs.nextId(), });		
	}
	physicsEngine.canvasView.fillRandomly(60, 450, 620, 495, 25, {speedY:-1.5});
	var ramp = new physicsEngine.Ramp({x1:95, y1:350, x2: 300, y2:420, id:physicsEngine.ramps.nextId()});
	physicsEngine.ramps.add( ramp );
	$("#content").get(0).scrollIntoView();
}

function ScenarioTest() {
	var ball = new physicsEngine.Ball({x:300, y:40, mass:1, speedX: 0, speedY:1, friction: 0, bounciness:1, id:physicsEngine.balls.nextId()});
	physicsEngine.balls.add(ball);
	var ball2 = new physicsEngine.Ball({x:300, y:40, mass:1, speedX: 0, speedY:1, friction: 0, bounciness:1, id:physicsEngine.balls.nextId()});
	physicsEngine.balls.add(ball2);
	var ball3 = new physicsEngine.Ball({x:300, y:40, mass:1, speedX: 0, speedY:1, friction: 0, bounciness:1, id:physicsEngine.balls.nextId()});
	physicsEngine.balls.add(ball3);
	var ball4 = new physicsEngine.Ball({x:300, y:40, mass:1, speedX: 0, speedY:1, friction: 0, bounciness:1, id:physicsEngine.balls.nextId()});
	physicsEngine.balls.add(ball4);
	var ramp = new physicsEngine.Ramp({x1:350, y1:300, x2: 400, y2:400, id:physicsEngine.ramps.nextId()});
	physicsEngine.ramps.add( ramp );
	ball.placeOnRamp(ramp);
	var ramp2 = new physicsEngine.Ramp({x1:250, y1:300, x2: 200, y2:200, id:physicsEngine.ramps.nextId()});
	physicsEngine.ramps.add( ramp2 );
	ball2.placeOnRamp(ramp2);
	var ramp3 = new physicsEngine.Ramp({x1:70, y1:300, x2: 150, y2:200, id:physicsEngine.ramps.nextId()});
	physicsEngine.ramps.add( ramp3 );
	ball3.placeOnRamp(ramp3);
	var ramp4 = new physicsEngine.Ramp({x1:500, y1:200, x2: 430, y2:300, id:physicsEngine.ramps.nextId()});
	physicsEngine.ramps.add( ramp4 );
	ball4.placeOnRamp(ramp4);
}

new physicsEngine.AppView();
Scenario3();

//Scenario3();

//


//~ for (var i =0; i<80; i++) {
	//~ var radius = 2;
	//~ var ball = new physicsEngine.Ball( {x:120 + i*(1.44*radius), y:200+i*1.44*radius, mass:10000, radius: radius, friction:1} );
	//~ physicsEngine.balls.add(ball);
//~ }

//~ var numberOfRows = 13;
//~ var rowSeparation = physicsEngine.canvas.height / numberOfRows;
//~ var colSeparation = physicsEngine.canvas.width  / numberOfRows;
//~ for (var i=0; i<numberOfRows; i++) {
	//~ for (var j=0; j<numberOfRows; j++) {
		//~ physicsEngine.containers.add( new physicsEngine.Container({xMin:colSeparation*i, xMax:colSeparation*(i+1), yMin:rowSeparation*j, yMax:rowSeparation*(j+1)}));
	//~ }
//~ }

 // kick things off

// TODO:

// Tastypie, serve examples by serving the ball/spring/container collections and some text that has been saved into it. That way can set up the example and save it to the server (and add text later)
// Question would be how to allow only me to do this. Could just do it on local server and take it out of the final version?? Would presumably need to change allowed_methods or something on the Django side
// Other option is to set up users?	

// Make it more colourful
// Energy being lost over time?
// Have "Special" tab with just the ability to load the example scenario for now?
// give ramps friction - for learning but also helpful so that we can make balls stick to them to measure distances
// should dampening also be mass dependent i.e. should you do it with momentum rather than speed? would make sense since F=ma?! basics arent we doing it from centre of mass frame rather than mid point!
// Ability to have "invisible" balls that don't collide with other balls for teaching purpose?
// Fix newtons cradle by switching the direction in which balls are iterated over every other time (i.e. every other time, go backwards over the original list!)
// BUG: New ball doesn't edit properly!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// 
// Move physicsEngine.g into physicsEngine.globalOptions so that it can be checked for change more easily
// Have ability to collapse the stats on an editChildView, such that it runs faster
// Have ability to choose update period (with caveat that it will make it slower)
// Have ability to drag and drop ends of springs to other balls or to the background
// Have extension showing for springs as it may be helpful as a stat? Would need to update it more often than actionSpring does
//
// Idea to save platform possibility: draw platforms as lines. If ball overlaps with line, reverse ball speed in direction along perpendicular to the line.
// Platform could have friction too. Would need to make it so that balls that are dropped near platforms just stick straight onto them.
// Look at solving y=mx+c with x^2+y^2=r^2 equations, some translations and checking of platform boundaries might be needed. Might be worth working in a grid in the future,
// for now doing it normally is fine (platform number will be low).
// Once we have platforms, do we still  need containers?
//
// Have ability to graph things, would be quite easy. Either an individual thing over time or many things binned (e.g. for M-B dist).
// Can choose an update period for the graph, but could do a simple thing where individual lines are drawn in at each update, until
// one of them goes over the 
// Graphs are models+views+collections, and the render() function is called by the canvsView object at each "tick" that way, it is correct in time too.	

// FUTURE:
// - Special objects could include:
// cannons, bombs, hooks (on the end of springs, with their own fail points?), pulleys (rods with a speed and acceleration depending on that of the points
// - Could use grid to simulate water movement via an 1/r^2 force? Could use Barnes-Hut type thing with a softening. 
// Could simulate things like water tension on a cup, water going down a slope to fill a container, ect...

// WEBSITE TODO:
// Add physics project from last year to website in other projects, and add option of adding videos/images to other projects !!!!
// Create users !!CANT DO THIS WHILE STUFF IS STILL ON PUBLIC GITHUB REPO
// Posts/Comments page (+later ability to edit posts)
// Then ability to save physics engine using tastypie
