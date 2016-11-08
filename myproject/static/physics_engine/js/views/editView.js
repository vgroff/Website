var physicsEngine = physicsEngine || {};

// The view for a given collection
physicsEngine.EditView = Backbone.View.extend({

	// Instead of generating a new element, bind to the existing skeleton of
	// the App already present in the HTML.

	events: {
		"click .addNew": "addOne",
	},

	
	initialize: function(collection) {
		var self = this;
		this.editing = false;
		
		this.collection = collection;
		this.$el.addClass("physicsEditingSection");   
		
		this.render();
		
		this.listenTo(this.collection, "reset", this.removeChildViews);
		
		this.listenTo(physicsEngine.physicsRouter, "routed", this.toggleVisibility);
		
		this.listenTo(this.collection, "add", this.renderOne);
	},
	
	render: function() {
		var self = this;
		
		this.addNewButtonTop  = $(document.createElement('button'));
		this.addNewButtonTop.addClass("addNew");
		this.addNewButtonTop.html( "Add Another ".concat(this.collection.nameModel) );
		this.$el.append(this.addNewButtonTop);  
		
		this.collection.forEach( function(childModel) {
			childModel.set("name", self.collection.nameModel);
			let childView = new physicsEngine.editChildView({model:childModel});
			self.$el.append(childView.$el);
			self.listenTo(childModel, "removeModel", self.removeModel);
		});		
		
		this.addNewButtonBottom  = $(document.createElement('button'));
		this.addNewButtonBottom.addClass("addNew");
		this.addNewButtonBottom.html( "Add Another ".concat(this.collection.nameModel) );
		this.$el.append(this.addNewButtonBottom);
	},
	
	// Renders a new child model when added to collection
	renderOne: function(model) {
		this.addNewButtonBottom.remove();
		model.set("name", this.collection.nameModel);
		let childView = new physicsEngine.editChildView({model:model});
		this.$el.append(childView.$el);	
		childView.$el.get(0).scrollIntoView();
		this.$el.append(this.addNewButtonBottom);		
	},
	
	// Adds a model to the collection
	addOne: function() {
		let childModel = new this.collection.model({"id": this.collection.nextId()});
		childModel.set("name", this.collection.nameModel);
		this.listenTo(childModel, "removeModel", self.removeModel);
		this.collection.add( childModel );
	},
	
	// Hides itself if not on the right heading
	toggleVisibility: function() {
		if (physicsEngine.editFilter === this.collection.name) {
			this.$el.show();
		}
		else {
			this.$el.hide();
		}
	},
	
	// Deletes a child from the collection
	removeModel: function(childModel) {
		this.collection.remove(childModel);
	},
	
	removeChildViews: function() {
		this.$el.empty();
		this.render();
	},

});

// this should create different child views depending on which models it gets passed, the views can access all necessary models
