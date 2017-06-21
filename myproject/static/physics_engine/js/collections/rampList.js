var physicsEngine = physicsEngine || {};

physicsEngine.Ramps = Backbone.Collection.extend({

	// Reference to this collection's model.
	model: physicsEngine.Ramp,
	name: "Ramps",
	nameModel: "Ramp",

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

physicsEngine.ramps = new physicsEngine.Ramps();
