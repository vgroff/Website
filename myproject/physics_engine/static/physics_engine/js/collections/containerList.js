var physicsEngine = physicsEngine || {};

physicsEngine.Containers = Backbone.Collection.extend({

	// Reference to this collection's model.
	model: physicsEngine.Container,
	name: "Containers",
	nameModel: "Container",

	nextId: function() {
	  if ( !this.length ) {
		return 1;
	  }
	  return this.last().get('id') + 1;
	},

	comparator: function( container ) {
	  return container.get('order');
	}
});

physicsEngine.containers = new physicsEngine.Containers();
physicsEngine.containers.add([new physicsEngine.Container({"id":physicsEngine.containers.nextId()})]);
