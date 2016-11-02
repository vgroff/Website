var physicsEngine = physicsEngine || {};

physicsEngine.GraphView = Backbone.View.extend({

	events: {
	},
	
	template: _.template( $('#graphViewTemplate').html() ),
	
	initialize: function() {
		var self = this;
		this.editing = false;
		
		this.$el.html( this.template );
		
		this.listenTo( this.model, "tick", this.graphPoint);
		this.listenTo( this.model, "change", this.reset);
		
		
		this.canvas = this.$el.find(".graphCanvas")[0];
		this.ctx = this.canvas.getContext("2d");
		
		this.graphLims = [ [30,30], [680, 150] ];
		
		this.reset();
		this.render();
		
	},
	
	render: function() {
		let ctx = this.ctx;
		ctx.clearRect(0,0,this.canvas.width, this.canvas.height);
		
		ctx.strokeStyle = "#000000";
		ctx.beginPath();
		ctx.lineWidth = 2;
		ctx.moveTo( this.graphLims[0][0], this.graphLims[0][1])
		ctx.lineTo( this.graphLims[0][0], this.graphLims[1][1])
		ctx.lineTo( this.graphLims[1][0], this.graphLims[1][1])
		ctx.stroke();
		ctx.closePath();
	},
	
	reset: function() {
		this.xlim = 10;
		this.ylim = [0,0];
		
		this.time = -1;
		
		this.lines = [];
		this.balls = this.model.get("plottingBalls");
		for (var i=0; i < this.balls.length; i++) { 
			this.lines.push([]); 
		}		
	},
	
	
	graphPoint: function() {
		this.time += 1
		for (var i=0; i < this.balls.length; i++) {
			var ball = physicsEngine.balls.get(this.balls[i]);
			var y = this.model.getPoint(ball);
			var redraw = false;
			if (this.time > this.xlim) {
				this.xlim = this.xlim*2;
				redraw = true;
			}
			if (y < this.ylim[0]) {
				this.ylim[0] = y;
				this.recalibrate();
				redraw = true;
			}
			if (y > this.ylim[1]) {
				this.ylim[1] = y;
				this.recalibrate();
				redraw = true;
			}
			//DRAW
			if (redraw) {
				this.recalibrate();
				this.replot();
			}		
			var ctx = this.ctx;
			ctx.strokeStyle = "#000000";	
			ctx.lineWidth = 2;
			ctx.beginPath();
			var xPix = (this.time)*this.pixelPerX + this.graphLims[0][0];
			var yPix =  this.graphLims[1][1] - (y - this.ylim[0])*this.pixelPerY;
			if (this.lines[i].length > 0) {
				var lastPoint = this.lines[i][this.lines[i].length-1];
				ctx.moveTo( lastPoint[0]*this.pixelPerX + this.graphLims[0][0], this.graphLims[1][1] - (lastPoint[1] - this.ylim[0])*this.pixelPerY);
				ctx.lineTo( xPix, yPix );
			}
			ctx.stroke();
			ctx.closePath();
			this.lines[i].push([this.time, y]);
		}
	},

	recalibrate: function() {
		this.pixelPerX = (this.graphLims[1][0] - this.graphLims[0][0]) / this.xlim;
		this.pixelPerY = (this.graphLims[1][1] - this.graphLims[0][1]) / (this.ylim[1] - this.ylim[0]);
	},
	
	replot: function() {
		this.render();
		let ctx = this.ctx;
		ctx.strokeStyle = "#000000";	
		ctx.lineWidth = 2;
		for (var i=0; i < this.lines.length; i++) {
			if (this.lines[i].length > 0) {
				ctx.beginPath();
				for (var j=0; j<this.lines[i].length-1; j++) {
					
					ctx.moveTo( (this.lines[i][j][0])*this.pixelPerX + this.graphLims[0][0], this.graphLims[1][1] - (this.lines[i][j][1] - this.ylim[0])*this.pixelPerY );
					ctx.lineTo( (this.lines[i][j+1][0])*this.pixelPerX + this.graphLims[0][0], this.graphLims[1][1] - (this.lines[i][j+1][1] - this.ylim[0])*this.pixelPerY );
					
				}
				ctx.stroke();
				ctx.closePath();
			}
		}
	},
	
});
