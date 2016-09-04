var physicsEngine = physicsEngine || {};

physicsEngine.Springs = Backbone.Collection.extend({

	// Reference to this collection's model.
	model: physicsEngine.Spring,

	nextOrder: function() {
	  if ( !this.length ) {
		return 1;
	  }
	  return this.last().get('order') + 1;
	},

	comparator: function( spring ) {
	  return spring.get('order');
	}
});

physicsEngine.springs = new physicsEngine.Springs();
