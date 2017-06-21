var physicsEngine = physicsEngine || {};

physicsEngine.Balls = Backbone.Collection.extend({

	// Reference to this collection's model.
	model: physicsEngine.Ball,
	name: "Balls",
	nameModel: "Ball",

	nextId: function() {
	  if ( !this.length ) {
		return 1;
	  }
	  return this.last().get('id') + 1;
	},

	comparator: function( ball ) {
	  return ball.get('id');
	}
});

physicsEngine.balls = new physicsEngine.Balls();
