var physicsEngine = physicsEngine || {};


physicsEngine.AppView = Backbone.View.extend({

	el: '#physicsEngine',


	events: {
	  'click .physicsEditHeadings': 'toggleSelectedHeading',
	},


	initialize: function() {
	  
		this.canvas = physicsEngine.canvas;
		this.canvasView = physicsEngine.canvasView;
		
		var collections = [
			physicsEngine.balls,
			//~ physicsEngine.springs,
			//~ physicsEngine.containers,
		];
		
		for (var i=0; i < collections.length; i++) {
			var editView = new physicsEngine.EditView(collections[i]);
 			var heading  = $(document.createElement('a'));
			if (i==0) {
				heading.addClass("physicsEditHeadingSelected");
				this.currentHeading = $(".physicsEditHeadingSelected");
			}
 			heading.attr("href", "#".concat(collections[i].name));
			heading.addClass("physicsEditHeadings");
			heading.html(collections[i].name);
			$("#physicsEngine").append(heading);
			$("#physicsEngineUI").append(editView.$el);
		}
		
		$(".physicsEditHeadings").css('cursor', 'pointer');

		this.render();
	},

	render: function() {
		this.canvasView.render();
	},
	
	toggleSelectedHeading: function(evt) {
		this.currentHeading.removeClass("physicsEditHeadingSelected");
		this.currentHeading = $(evt.target);
		this.currentHeading.addClass("physicsEditHeadingSelected");
	},

});



var ball1 = new physicsEngine.Ball({x:150, y:150, mass:4, speedX: 0, friction: 0, bounciness:0.001});
physicsEngine.balls.add(ball1);
var ball2 = new physicsEngine.Ball({x:250, y:150, mass:1.01});
physicsEngine.balls.add(ball2);
physicsEngine.balls.add(new physicsEngine.Ball({x:450, y:150}));
//~ physicsEngine.springs.add({point1:ball1, point2:ball2, length:100, k:0.0005});
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

new physicsEngine.AppView(); // kick things off

// TODO:
// Now each heading knows its position in the editViews list. The editViews lsit contains a list of editView pbject instances, each which is hidden or unhidden depending on which is 
// selected in the tabs. The editViews get passed which the collection to work with. They then create child views for each model in the collection, and append it to themselves.
// They'll also have the ability to add an extra one somehow...
// Canvas view should also listen directly to optionsView, which should be global, rather than going through appView
// 
// TABS: Balls, springs, containers, SPECIAL (these 4 in one colours) (special is platforms, strings, potholes, cannons, hooks for springs ect...),SCENARIOS (in a different colour),
// which is my physics examples and user created examples (availble globally and fetched from server) and GRAPHING (in a different colour), either all balls or an individual balls, position, 
// distances, velocities or speeds.

// Use a router: append the headings as <a>'s instead, linking to #heading. Then the router picks this up and triggers an event that all editViews listen to.
// They then check if they should be unhidden or not and unhide/hide themselves if necessary.This way we don't need data attached to html elements, and the appView and editViews are somewhat
// decoupled. Then there should be no need for the editView list, the click event handler in appView, or even really to do this stuff at the AppView level, the editViews could  simply
// build themselves, heading included, from what the AppView gives them (e.g. collection and physicsEngineUI element)
// change heading to name, makes more sense.


// Do we want the canvas to be the model for our canvasView, so that all functions stay in said model and we have better model/view separation? i.e. the view does all
// the UI-ey stuff and triggering/listening to event in other views ect... E.g. that way we can have the editing view triggering
// Have a sideways dampening option too (friction at a pivot point for example)

// FUTURE:
// Making platforms: use series of small balls that have a friction of 1 and a very large mass
// NB: surely it's faster to do a sort on the balls by x then save that. Then for any given ball, find those other balls nearby in x,
// then do a sort on those in y and choose the nearby ones in y, then do the collision test with those. Maybe not faster, since the bins lookups are faster than binary search.
// Get a kick working, and diffrentiate it from a drag

