var physicsEngine = physicsEngine || {};

physicsEngine.Springs = Backbone.Collection.extend({

	// Reference to this collection's model.
	model: physicsEngine.Spring,
	name: "Springs",
	nameModel: "Spring",

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

physicsEngine.springs = new physicsEngine.Springs();
