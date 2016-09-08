var physicsEngine = physicsEngine || {};


physicsEngine.AppView = Backbone.View.extend({

	el: '#physicsEngine',


	events: {
	  'click .physicsEditHeadings': 'toggleSelectedHeading',
	},


	initialize: function() {
	  
		this.canvas = physicsEngine.canvas;
		this.canvasView = physicsEngine.canvasView;
		// Collections for editView
		var collections = [
			physicsEngine.balls,
			physicsEngine.springs,
			physicsEngine.containers,
		];
		// Building the links to the various routes
		for (var i=0; i < collections.length; i++) {
 			var heading  = $(document.createElement('a'));
			if ( ( (!physicsEngine.editFilter) && (i==0) ) || ( (physicsEngine.editFilter) && ((physicsEngine.editFilter === collections[i].name)) ) ) {
				heading.addClass("physicsEditHeadingSelected");
				this.currentHeading = heading;
			}
 			heading.attr("href", "#".concat(collections[i].name));
			heading.addClass("physicsEditHeadings");
			heading.html(collections[i].name);
			$("#physicsEngine").append(heading);
			
		}
		// Building the editViews for each route
		var uiDiv = $(document.createElement('div'));
		uiDiv.attr("id", "physicsEngineUI")
		for (var i=0; i < collections.length; i++) {
			var editView = new physicsEngine.EditView(collections[i]);
			uiDiv.append(editView.$el);
			if (!( ( (!physicsEngine.editFilter) && (i==0) ) || ( (physicsEngine.editFilter) && ((physicsEngine.editFilter === collections[i].name)) ) )) {
				editView.$el.hide();
			}
		}
		$("#physicsEngine").append(uiDiv);
		
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


physicsEngine.balls.add(new physicsEngine.Ball({x:150, y:150, mass:1, speedX: 0, friction: 0, bounciness:0.5, id:physicsEngine.balls.nextId()}));
physicsEngine.balls.add(new physicsEngine.Ball({x:250, y:150, mass:1, speedX: 0, friction: 0, bounciness:1, id:physicsEngine.balls.nextId()}));
physicsEngine.balls.add(new physicsEngine.Ball({x:450, y:150, mass:1, speedX: 0, friction: 0, bounciness:1, id:physicsEngine.balls.nextId()}));
physicsEngine.springs.add({point1:1, point2:2, length:100, k:0.0005, id:1});
console.log(physicsEngine.balls.get(2));
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
// Consideer moving actionSpring() to canvasView in the interest of not having the spring alter another collection. This way we can also ignore
// springs that are improperly set easily.
// Have ability to choose update period (with caveat that it will make it slower)
// Have ability to drag and drop on cavas if paused
// Have a sideways dampening option too (friction at a pivot point for example)

// FUTURE:
// Making platforms: use series of small balls that have a friction of 1 and a very large mass
// NB: surely it's faster to do a sort on the balls by x then save that. Then for any given ball, find those other balls nearby in x,
// then do a sort on those in y and choose the nearby ones in y, then do the collision test with those. Maybe not faster, since the bins lookups are faster than binary search.
// Get a kick working, and diffrentiate it from a drag

