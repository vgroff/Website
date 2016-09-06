var physicsEngine = physicsEngine || {};

physicsEngine.Balls = Backbone.Collection.extend({

	// Reference to this collection's model.
	model: physicsEngine.Ball,
	name: "balls",
	childView: physicsEngine.BallView,

	nextOrder: function() {
	  if ( !this.length ) {
		return 1;
	  }
	  return this.last().get('order') + 1;
	},

	comparator: function( ball ) {
	  return ball.get('order');
	}
});

physicsEngine.balls = new physicsEngine.Balls();
