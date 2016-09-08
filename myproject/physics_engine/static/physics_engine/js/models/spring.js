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
			{ "attr":"point1", "value":this.get("point1"), "type":"input"},
			{ "attr":"point2", "value":this.get("point2"), "type":"input"},
			{ "attr":"k", "value":this.get("k"), "type":"input"},
			{ "attr":"length", "value":this.get("length"), "type":"input"},
			{ "attr":"dampening", "value":this.get("dampening"), "type":"input"},
			{ "attr":"direction", "value":this.get("direction"), "type":"input"},
			{ "attr":"failPoint", "value":this.get("failPoint"), "type":"input"},
		];
	},
});
