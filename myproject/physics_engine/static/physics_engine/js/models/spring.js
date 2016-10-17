var physicsEngine = physicsEngine || {};

physicsEngine.Spring = Backbone.Model.extend({

	defaults: {
		point1: "None",
		point2: "None",
		k: 0.001,
		length: 100,
		dampening: 0,
		colour: "strengthMap",
		direction: "both",
		failPoint: null,
		extension: 0
	},
	
	getAttr: function() {
		 return [
			{ "attr":"point1", "value":this.get("point1"), "type":"inputFloat/Array"},
			{ "attr":"point2", "value":this.get("point2"), "type":"inputFloat/Array"},
			{ "attr":"k", "value":this.get("k"), "type":"inputFloat"},
			{ "attr":"length", "value":this.get("length"), "type":"inputFloat"},
			{ "attr":"dampening", "value":this.get("dampening"), "type":"inputFloat"},
			{ "attr":"direction", "value":this.get("direction"), "type":"inputFloat"},
			{ "attr":"failPoint", "value":this.get("failPoint"), "type":"inputFloat"},
		];
	},
});
