var physicsEngine = physicsEngine || {};

physicsEngine.AppView = Backbone.View.extend({

	// Instead of generating a new element, bind to the existing skeleton of
	// the App already present in the HTML.
	el: '#physicsEngine',
	rendering: false,

	// Our template for the line of statistics at the bottom of the app.
	// statsTemplate: _.template( $('#stats-template').html() ),

	// New
	// Delegated events for creating new items, and clearing completed ones.
	//~ events: {
	  //~ 'keypress #new-todo': 'createOnEnter',
	  //~ 'click #clear-completed': 'clearCompleted',
	  //~ 'click #toggle-all': 'toggleAllComplete'
	//~ },

	// At initialization we bind to the relevant events on the `Todos`
	// collection, when items are added or changed. Kick things off by
	// loading any preexisting todos that might be saved in *localStorage*.
	initialize: function() {
	  
		this.canvas = physicsEngine.canvas;
		this.canvasView = new physicsEngine.CanvasView();
		
		this.optionsModel = new physicsEngine.Options()
		this.optionsView = new physicsEngine.OptionsView({model: this.optionsModel});
		
		this.listenTo(this.optionsModel, 'change:play', this.playAnimation);
		this.listenTo(this.optionsView, 'stepEngine', this.stepAnimation);

		//~ this.listenTo(app.Todos, 'reset', this.addAll);

		//~ // New
		//~ this.listenTo(app.Todos, 'change:completed', this.filterOne);
		//~ this.listenTo(app.Todos,'filter', this.filterAll);
		//~ this.listenTo(app.Todos, 'all', this.render);
		this.render(false);
	},

	render: function(applyPhysics) {
		this.canvasView.render(applyPhysics);
	},
	
	animate: function() {
		if (this.rendering === false) {
			var date = new Date();
			var time = date.getTime();
			this.rendering = true;
			
			this.render(true);
			
			date = new Date();
			if (this.optionsView.model.get("play") === true) {
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
	
	playAnimation: function() {
		if (this.optionsModel.get("play") === true) {
			this.animate();
		}
	},
	
	stepAnimation: function() {
		if (this.optionsModel.get("play") === false) {
			this.animate();
		}
	}

});

var ball1 = new physicsEngine.Ball({x:150, y:150, mass:4, speedX: 2, friction: 0});
physicsEngine.balls.add(ball1);
var ball2 = new physicsEngine.Ball({x:250, y:150});
physicsEngine.balls.add(ball2);
physicsEngine.balls.add(new physicsEngine.Ball({x:450, y:150}));
physicsEngine.springs.add({point1:ball1, point2:ball2, length:100, k:0.0005});
new physicsEngine.AppView(); // kick things off

// TODO:
// Have a sideways dampening option too (friction at a pivot point for example)

// FUTURE:
// Making platforms: use series of small balls that have a friction of 1 and a very large mass
// NB: surely it's faster to do a sort on the balls by x then save that. Then for any given ball, find those other balls nearby in x,
// then do a sort on those in y and choose the nearby ones in y, then do the collision test with those. Maybe not faster, since the bins lookups are faster than binary search.
// Get a kick working, and diffrentiate it from a drag

