






//
//

//
//
//
//
// THIS HAS BEEN SUPERSEEDED BY GAMECLASSES AND GAMELOGIC AND ISNT USED ANYMORE!!!
//
//
//

//
//
//
//
//
//
//
//THIS HAS BEEN SUPERSEEDED BY GAMECLASSES AND GAMELOGIC AND ISNT USED ANYMORE!!!
//
//
//
//
//
//
//
//
//
//











var policeGame = {};

function PoliceGame() {
	this.stage = new createjs.Stage("gameCanvas");
	this.canvas = this.stage.canvas;
	this.ctx = this.canvas.getContext("2d");
	this.characters = [];
	
	this.player = new Character();
	this.characters.push(this.player);
	this.stage.addChild(this.player.image);
	
	this.stage.update();
	
	this.currentArea = new Area();
	this.relativePosition = [0,0];
	
	window.addEventListener("keydown", this.handleKeyDown.bind(this));
	window.addEventListener("keyup", this.handleKeyUp.bind(this));
	
	//Update stage will render next frame
	createjs.Ticker.addEventListener("tick", this.updateStage.bind(this));
	createjs.Ticker.setFPS(60)
}

PoliceGame.prototype.updateStage = function() {
	for (char in this.characters) {
		let character = this.characters[char]; 
		character.setPos( character.x + character.speedx,character.y + character.speedy); 
	}
	this.player.turnTo( this.stage.mouseX, this.stage.mouseY );
	this.stage.update();
	var line = new createjs.Shape();
line.graphics.setStrokeStyle(3);
line.graphics.beginStroke(color);
line.graphics.moveTo(startX, startY);
startY++;
line.graphics.lineTo(startX, startY);
line.graphics.endStroke();
};

PoliceGame.prototype.handleKeyDown = function(evt) {
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

PoliceGame.prototype.handleKeyUp = function(evt) {
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

//~ function Area(xSize, ySize, tileSize) {
	//~ this.xSize = xSize;
	//~ this.ySize = ySize;
	//~ this.tileSize = tileSize;
	//~ this.grid = [];
	//~ for (var i = 0; i < xSize; i++) {
		//~ for (var j = 0; j < ySize; j++) {
			//~ this.grid.push( new Tile(true) );
		//~ }	
	//~ }
//~ }

//~ Area.prototype. = function() {
//~ };

//~ function Tile(walkable) {
	//~ this.walkable = walkable;
	//~ this.contains = [];
//~ }

//~ function Character() {
	//~ this.health = 100;
	//~ this.x = 0;
	//~ this.y = 0;
	//~ this.speedx = 0;
	//~ this.speedy = 0;
	//~ this.maxSpeed = 4;
	//~ this.image = new createjs.Shape();
	//~ this.size = 32;
	//~ this.image.graphics.beginFill("DeepSkyBlue").drawRect(0, 0, this.size, this.size);
	//~ this.image.regX = this.size/2;
	//~ this.image.regY = this.size/2;
//~ }

//~ Character.prototype.setPos = function(x,y) {
	//~ this.x = x;
	//~ this.y = y;
	//~ this.image.x = x;
	//~ this.image.y = y;
//~ };

//~ Character.prototype.turnTo = function(x,y) {
	//~ angle = Math.atan2( y - this.y, x - this.x);
	//~ angle = angle * (180/Math.PI);
	//~ if(angle < 0)
	//~ {
		//~ angle = 360 - (-angle);
	//~ }
	//~ this.image.rotation = angle;	
	
//~ };

game = new PoliceGame();

// MINIMU REQUIREMENT:
// 1. Moving square
// 2. Rotating square with mouse
// 3. Areas with no-go zones
// 4. Change to WASD keys

// Going to need to decide how to split this up.
// UI should clearly be listened for and then queued into updateStage
// Going to need classes for player and for NPCs
// Going to need classes for stages (here neighbourhood)
// Going to need classes for weapons
