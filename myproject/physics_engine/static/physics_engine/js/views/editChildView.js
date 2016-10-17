var physicsEngine = physicsEngine || {};

// The view for a given model
physicsEngine.editChildView = Backbone.View.extend({
	
	tagName: "ul",
	
	// Instead of generating a new element, bind to the existing skeleton of
	// the App already present in the HTML.

	events: {
		"keypress .inputAttr": "editModelAttr",
		"click .toggleAttr": "toggleModelAttr",
		"click .toggleEdit": "toggleEditMode",
		"click .deleteChild": "close"
	},

	
	initialize: function() {
		this.period = 30;
		this.iteration = 0;
		this.editing = false;
		
		this.listenTo(this.model, "updated", this.render);
		this.listenTo(this.model, "change", this.forceRender);
		this.listenTo(this.model, "remove", this.remove);
		this.listenTo(physicsEngine.optionsView, 'togglePlay', this.closeEditMode);
		this.listenTo(physicsEngine.optionsView, 'stepAnimation', this.closeEditMode);
		
		this.headingTemplate = _.template( $('#ballTemplate').html() );
		this.columnTemplate =  _.template( $('#columnTemplate').html() );
		this.statsTemplate =  _.template( $('#statsColumnTemplate').html() );
		this.editTemplate =  _.template( $('#editColumnTemplate').html() );

		this.$el.addClass("physicsEditViews");		
		this.$el.html( this.headingTemplate( {"name": this.model.get("name"), "id":this.model.get("id")}) );

		this.attributeArray = this.model.getAttr();
		var j=0;
		var attrArray = [];
		var statsArray = [];
		var fullArray = [];
		this.columnLength = 4;
		for (var i=0; i < this.attributeArray.length; i++) {
			let attribute = this.attributeArray[i];
			if (j <= this.columnLength) {
				fullArray.push(attribute);
				if (attribute.name) { attrArray.push(attribute.name.concat(":"));}
				else { attrArray.push(attribute.attr.charAt(0).toUpperCase() + attribute.attr.slice(1) + ":"); }
				statsArray.push(attribute.value);
				j++;
			}
			if ( (j == this.columnLength) || i === this.attributeArray.length - 1) {
				this.$el.append( this.columnTemplate({text:attrArray}) );
				this.$el.append( this.statsTemplate({stats:statsArray}) );
				this.$el.append( this.editTemplate({attrs:fullArray}) );
				j = 0;
				attrArray = [];
				statsArray = [];
				fullArray = [];
			}
		}
		this.$el.find(".editAttr").hide();
		
		this.viewButtons  = $(document.createElement('div'));
		
		this.editModeButton  = $(document.createElement('button'));
		this.editModeButton.addClass("toggleEdit");
		this.editModeButton.html( "Toggle Editing Mode" );
		this.viewButtons.append(this.editModeButton);   
		
		this.deleteButton  = $(document.createElement('button'));
		this.deleteButton.addClass("deleteChild");
		this.deleteButton.html( "Delete ".concat(this.model.get("name")) );
		this.viewButtons.append(this.deleteButton);
		
		this.$el.append(this.viewButtons); 
	},
	
	// Re-render all columns displaying stats (.statsColumn class) according to the update rate
	render: function() {
		if (this.iteration === this.period) {
			this.iteration=0;
			this.attributeArray = this.model.getAttr();
			var j=0;
			var k=0;
			var statsArray = [];
			this.$el.find(".statsColumn").empty();
			var statsColumns = this.$el.find(".statsColumn");
			for (var i=0; i < this.attributeArray.length; i++) {
				let attribute = this.attributeArray[i];
				if (j <= this.columnLength) {
					statsArray.push(attribute.value);
					j++;
				}
				if  ( (j == this.columnLength) || i === this.attributeArray.length - 1) {
					$(statsColumns[k]).empty();
					var statsTemplate = this.statsTemplate({stats:statsArray});
					$(statsColumns[k]).append( $(statsTemplate).children() );
					j = 0;
					k++;
					statsArray = [];
				}
			}	
		}	
		this.iteration++;
	},	
	
	// Force rendering regardless of update rate
	forceRender: function() {
		this.iteration = this.period;
		this.render();
	},
	
	// Chaneg an attribute of the model
	editModelAttr: function(evt) {
		if (evt.key === "Enter") {
			if ($(evt.target).hasClass("stringAttr")) {
				if ($(evt.target).val().trim()) {
					this.model.set($(evt.target).attr("data-attr"), $(evt.target).val().trim());
					this.forceRender();
				}
			}
			if ($(evt.target).hasClass("floatAttr")) {
				if (parseFloat( $(evt.target).val().trim())) {
					this.model.set($(evt.target).attr("data-attr"), parseFloat( $(evt.target).val().trim() ));
					this.forceRender();
				}
			}
			if ($(evt.target).hasClass("arrayAttr")) {
				if ( $(evt.target).val().trim().indexOf(',') > -1 ) { 
					var array = $(evt.target).val().trim().split(',');
					if (array.length === 2) {
						var attrArray = [parseFloat(array[0]),parseFloat(array[1])];
						this.model.set($(evt.target).attr("data-attr"), attrArray);
						this.forceRender();
					}
				}
			}
		}
	},
	
	// Toggle an attribute of the model
	toggleModelAttr: function(evt) {
		var attr = $(evt.target).attr("data-attr");
		this.model.set(attr,  !this.model.get(attr));
		this.forceRender();
	},
	
	// Toggle editing mode, hides the inputs
	toggleEditMode: function(evt) {
		if (physicsEngine.globalOptions.get("play")) {
			physicsEngine.globalOptions.set("play", false);
		}
		this.editing = !this.editing;
		if (this.editing) {this.$el.find(".editAttr").show();}
		else {this.$el.find(".editAttr").hide();}
		
	},	
	
	// Close editing mode when playing
	closeEditMode: function() {
		this.forceRender();
		if (this.editing) {
			this.editing = false;
			this.$el.find(".editAttr").hide();
		}
	},
	
	// Delete the view and model
	close: function() {
		this.remove();
		this.model.trigger("removeModel", this.model);
	},

});

