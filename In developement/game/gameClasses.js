var policeGame = {};

function Character() {
	this.health = 100;
	this.x = 50;
	this.y = 50;
	this.speedx = 0;
	this.speedy = 0;
	this.maxSpeed = 4;
	this.image = new createjs.Shape();
	this.size = 32;
	this.image.graphics.beginFill("DeepSkyBlue").drawRect(0, 0, this.size, this.size);
	this.image.regX = this.size/2;
	this.image.regY = this.size/2;
}

Character.prototype.setPos = function(x,y,relativePos) {
	this.x = x;
	this.y = y;
	this.image.x = x - relativePos[0];
	this.image.y = y - relativePos[1];
};

Character.prototype.turnTo = function(x,y) {
	angle = Math.atan2( y - this.y, x - this.x);
	angle = angle * (180/Math.PI);
	if (angle < 0)
	{
		angle = 360 - (-angle);
	}
	this.image.rotation = angle;	
	
};

policeGame.player = new Character();

function Tile(walkable) {
	this.walkable = walkable;
	this.contains = [];
}

function Area(xSize, ySize, tileSize) {
	this.player = policeGame.player;
	
	this.stage = new createjs.Stage("gameCanvas");
	this.canvas = this.stage.canvas;
	
	this.xSize = xSize;
	this.ySize = ySize;
	this.tileSize = tileSize;
	this.grid = [];
	for (var i = 0; i < xSize; i++) {
		for (var j = 0; j < ySize; j++) {
			this.grid.push( new Tile(true) );
		}	
	}
	this.characters = [];
	this.characters.push(this.player);
	this.stage.addChild(this.player.image);
	
	this.drawGrid();
	
	this.stage.update();
	
	//Update stage will render next frame	
	this.relativePosition = [0,0];
	this.limits = [xSize*tileSize, ySize*tileSize];
	
	this.player.setPos(this.canvas.width/2, this.canvas.height/2, this.relativePosition);
	
	window.addEventListener("keydown", this.handleKeyDown.bind(this));
	window.addEventListener("keyup", this.handleKeyUp.bind(this));
}

Area.prototype.play = function() {
	this.listener = createjs.Ticker.on("tick", this.updateStage.bind(this));
	createjs.Ticker.setFPS(60)	
};

Area.prototype.pause = function() {
	createjs.Ticker.off("tick", this.listener);
};

Area.prototype.updateStage = function() {
	for (char in this.characters) {
		let character = this.characters[char]; 
		character.setPos( character.x + character.speedx,character.y + character.speedy, this.relativePosition); 
	}
	this.player.turnTo( this.stage.mouseX, this.stage.mouseY );
	this.stage.update();
};

Area.prototype.drawGrid = function() {
	var line = new createjs.Shape();
	line.graphics.setStrokeStyle(3);
	line.graphics.beginStroke("#000000");
	for (var i = 0; i < this.xSize; i++) {
		if (i*this.tileSize > this.canvas.width){ break; }
		console.log("drawing");
		line.graphics.moveTo(i*this.tileSize, 0);
		line.graphics.lineTo(i*this.tileSize, this.canvas.height);
	}
	for (var i = 0; i < this.ySize; i++) {
		if (i*this.tileSize > this.canvas.height){ break; }
		line.graphics.moveTo(0, i*this.tileSize);
		line.graphics.lineTo(this.canvas.width, i*this.tileSize);
	}
	line.graphics.endStroke();	
	this.stage.addChild(line);
};

Area.prototype.handleKeyDown = function(evt) {
	evt.preventDefault();
	var code = evt.keyCode;
	switch (code) {
		case 65: 
			this.player.speedx = -this.player.maxSpeed;
			break
		case 87: 
			this.player.speedy = -this.player.maxSpeed;
			break
		case 68: 
			this.player.speedx = this.player.maxSpeed;
			break
		case 83: 
			this.player.speedy = this.player.maxSpeed;
			break
		default: break
	}
};

Area.prototype.handleKeyUp = function(evt) {
	evt.preventDefault();
	var code = evt.keyCode;
	switch (code) {
		case 65:
			this.player.speedx = 0;
			break
		case 87: 
			this.player.speedy = 0;
			break
		case 68: 
			this.player.speedx = 0;
			break
		case 83: 
			this.player.speedy = 0;
			break
		default: break
	}
};

//~ Area.prototype. = function() {
//~ };






