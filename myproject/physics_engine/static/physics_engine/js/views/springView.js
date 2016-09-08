var physicsEngine = physicsEngine || {};

physicsEngine.SpringView = Backbone.View.extend({
	
	tagName: "ul",
	
	// Instead of generating a new element, bind to the existing skeleton of
	// the App already present in the HTML.

	events: {
		"keypress .editAttr": "editModelAttr",
		"click .toggleAttr": "toggleModelAttr",
		"click .toggleEdit": "toggleEditMode",
	},

	
	initialize: function() {
		this.period = 30;
		this.iteration = 0;
		this.editing = false;
		
		this.listenTo(this.model, "change", this.render);
		this.listenTo(this.model, "remove", this.remove);
		this.listenTo(physicsEngine.globalOptions, "change", this.closeEditMode);
		
		this.headingTemplate = _.template( $('#ballTemplate').html() );
		this.columnTemplate =  _.template( $('#columnTemplate').html() );
		this.statsTemplate =  _.template( $('#statsColumnTemplate').html() );
		this.editTemplate =  _.template( $('#editColumnTemplate').html() );

		this.$el.addClass("physicsEditViews");		
		this.$el.html( this.headingTemplate( {"id":this.model.get("id")}) );

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
		
		this.editModeButton  = $(document.createElement('button'));
		this.editModeButton.addClass("toggleEdit");
		this.editModeButton.html( "Toggle Editing Mode" );
		this.$el.append(this.editModeButton);   
	},
	
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
	
	forceRender: function() {
		this.iteration = this.period;
		this.render();
	},
	
	editModelAttr: function(evt) {
		if (evt.key === "Enter") {
			this.model.set($(evt.target).attr("data-attr"), parseFloat( $(evt.target).val().trim() ));
			this.forceRender();
		}
	},
	
	toggleModelAttr: function(evt) {
		var attr = $(evt.target).attr("data-attr");
		this.model.set(attr,  !this.model.get(attr));
		this.forceRender();
	},
	
	toggleEditMode: function(evt) {
		if (physicsEngine.globalOptions.get("play")) {
			physicsEngine.globalOptions.set("play", false);
		}
		this.editing = !this.editing;
		if (this.editing) {this.$el.find(".editAttr").show();}
		else {this.$el.find(".editAttr").hide();}
		
	},	
	
	closeEditMode: function() {
		this.editing = false;
		this.$el.find(".editAttr").hide();
	},

});

