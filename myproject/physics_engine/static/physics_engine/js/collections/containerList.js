var physicsEngine = physicsEngine || {};

physicsEngine.Containers = Backbone.Collection.extend({

	// Reference to this collection's model.
	model: physicsEngine.Container,

	nextOrder: function() {
	  if ( !this.length ) {
		return 1;
	  }
	  return this.last().get('order') + 1;
	},

	comparator: function( container ) {
	  return container.get('order');
	}
});

physicsEngine.containers = new physicsEngine.Containers();
physicsEngine.containers.add([new physicsEngine.Container({"id":physicsEngine.containers.nextOrder()})]);
