var policeGame = {};

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
		this.grid.push([])
		for (var j = 0; j < ySize; j++) {
			if ((i == 3 || i==5) && (j==5)) {
				this.grid[i].push( new Tile(false) );
			}
			else{
				this.grid[i].push( new Tile(true) );
			}
		}	
	}	
	this.area = new createjs.Container();
	this.area.x = 0;
	this.area.y = 0;
	this.stage.addChild(this.area);
	
	this.drawGrid();
	
	this.characters = [];
	this.characters.push(this.player);
	this.area.addChild(this.player.image);
	
	this.stage.update();
	
	//Update stage will render next frame	
	this.relativePosition = [0,0];
	this.limits = [xSize*tileSize, ySize*tileSize];
	this.playerLimits = [ Math.floor(this.canvas.width*3/10), Math.floor(this.canvas.width*7/10), Math.floor(this.canvas.height*3/10), Math.floor(this.canvas.height*7/10)]
	
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
	// FOR AI CHARACTERS, UPDATE BEHAVIOUR BEFORE MOVING THEM
	this.updateWorld();
	for (char in this.characters) {
		let character = this.characters[char]; 
		this.onTiles(character);
		character.updatePos( [this.area.regX,this.area.regY] ); 
	}
	this.player.turnTo( this.stage.mouseX, this.stage.mouseY );
	this.stage.update();
};

Area.prototype.onTiles = function(character) {
	// Tile collisions done with a circle approx, since rotation makes full treatement difficult and with sprites should be fine neway (humans look like circles, not squares from above)
	//~ for (tile in this.highlightedTiles) {console.log(tile);this.area.removeChild(this.highlightedTiles[tile]);}
	var centreTileXN = Math.floor(character.image.x / this.tileSize)
	var centreTileYN = Math.floor(character.image.y / this.tileSize)
	var centreTileX = centreTileXN * this.tileSize
	var centreTileY = centreTileYN * this.tileSize
	var leeway = 0.9;
	var playerXLims = [character.image.x - character.size*leeway/2, character.image.x + character.size*leeway/2] 
	var playerYLims = [character.image.y - character.size*leeway/2, character.image.y + character.size*leeway/2]
	var xLimsBroken = [false, false];
	var yLimsBroken = [false, false]; 
	if (centreTileX > playerXLims[0]) { xLimsBroken[0] = true; }
	if (centreTileX+this.tileSize < playerXLims[1]) { xLimsBroken[1] = true; }
	if (centreTileY > playerYLims[0]) { yLimsBroken[0] = true; }
	if (centreTileY+this.tileSize < playerYLims[1]) { yLimsBroken[1] = true; }
	character.mainTile = [centreTileXN, centreTileYN];
	var tiles = [];
	// Loop over possibilities (in a kinda ugly way)
	for (i = 0; i <= 1; i++) {
		var mapI = 2*i - 1
		// If xlims broken, save the horizontal tile and stop player if unwalkable 
		if (xLimsBroken[i] === true) { 
			tiles.push([centreTileXN+mapI, centreTileYN]);
			if (this.grid[centreTileXN+mapI][centreTileYN].walkable === false && ( (character.speedx < 0 && i==0) || (character.speedx > 0 && i==1) ) ) {
				character.setPos(character.image.x-2*character.speedx, character.image.y, [this.area.regX,this.area.regY]);
			}
		}
		if (yLimsBroken[i] === true) { 
			tiles.push([centreTileXN, centreTileYN+mapI]); 
			if (this.grid[centreTileXN][centreTileYN+mapI].walkable === false && ( (character.speedy < 0 && i==0) || (character.speedy > 0 && i==1) ) ){
				character.setPos(character.image.x, character.image.y-2*character.speedy, [this.area.regX,this.area.regY]);
			}
		}
		// This bit deals with diagonal tiles
		for (j = 0; j <= 1; j++) {
			var mapJ = 2*j - 1
			if (xLimsBroken[i] === true && yLimsBroken[j] === true) {
				tiles.push([centreTileXN+mapI, centreTileYN+mapJ]);
				if (this.grid[centreTileXN+mapI][centreTileYN+mapJ].walkable === false && ( (character.speedx < 0 && (i==0 && j==0)) 
				|| (character.speedx > 0 && (i==1 && j==0)) || (character.speedx < 0 && (i==0 && j==1))
				|| (character.speedx > 0 && (i==1 && j==1))  ) ) {
					character.setPos(character.image.x-2*character.speedx, character.image.y, [this.area.regX,this.area.regY]);
				}
				if (this.grid[centreTileXN+mapI][centreTileYN+mapJ].walkable === false && ( (character.speedy < 0 && (i==0 && j==0)) 
				|| (character.speedy < 0 && (i==1 && j==0)) || (character.speedy > 0 && (i==0 && j==1))
				|| (character.speedy > 0 && (i==1 && j==1))  ) ) {
					character.setPos(character.image.x, character.image.y-2*character.speedy, [this.area.regX,this.area.regY]);
				}
			}
		}		
	}
	//~ for (i=0; i<tiles.length;i++){
		//~ var image = new createjs.Shape();
		//~ image.graphics.beginFill("Red").drawRect(this.tileSize*tiles[i][0], this.tileSize*tiles[i][1], this.tileSize, this.tileSize);
		//~ this.area.addChild(image);
		//~ tiles[i] = image;
	//~ }
	//~ this.highlightedTiles = tiles;
	this.area.setChildIndex(this.player.image, this.area.getNumChildren()-1);
};

Area.prototype.updateWorld = function() {
	if ((this.player.x < this.playerLimits[0] && this.player.speedx < 0) || (this.player.x > this.playerLimits[1] && this.player.speedx > 0)) {
		this.area.regX += this.player.speedx;
	}
	if ((this.player.y < this.playerLimits[2] && this.player.speedy < 0) || (this.player.y > this.playerLimits[3] && this.player.speedy > 0)) {
		this.area.regY += this.player.speedy;
	}
};

Area.prototype.drawGrid = function() {
	for (var i = 0; i < this.xSize; i++) {
		for (var j = 0; j < this.ySize; j++) {
			var image = new createjs.Shape();
			if (this.grid[i][j].walkable === true) {
				var col = "Green";
			}
			else{
				var col = "Brown";
			}
			image.graphics.beginFill(col).drawRect(this.tileSize*i, this.tileSize*j, this.tileSize, this.tileSize);
			this.area.addChild(image)
		}	
	} 
	var line = new createjs.Shape();
	line.graphics.setStrokeStyle(2);
	line.graphics.beginStroke("#000000");
	for (var i = 0; i < this.xSize+1; i++) {
		line.graphics.moveTo(i*this.tileSize, 0);
		line.graphics.lineTo(i*this.tileSize, this.ySize*this.tileSize);
	}
	for (var i = 0; i < this.ySize+1; i++) {
		line.graphics.moveTo(0, i*this.tileSize);
		line.graphics.lineTo(this.xSize*this.tileSize, i*this.tileSize);
	}
	line.graphics.endStroke();	
	this.area.addChild(line);
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








/// Need to think about what it is that gets passed around. Maybe all characters should have 
/// the grid (and the grid should have all characters?(not sure even needed)), that way everyone can access everyone else
/// Although it makes sense to have the area do the unwalkable tiles since this only affects player anyway,
/// A* pathfinding and all other decision making should absolutely be made on character-level. Characters knowing other characters
/// and surroundings either hard-coded, calculated or (most likely) accessed via grid.

// TO-DO:
// 

// Minimum requirements:
//



// Who does the collisions? Maybe all AI in area bit, but makes more sense to delegate?

function Character() {
	this.health = 100;
	this.x = 50;
	this.y = 50;
	this.speedx = 0;
	this.speedy = 0;
	this.maxSpeed = 2;
	this.image = new createjs.Shape();
	this.size = 25;
	this.image.graphics.beginFill("DeepSkyBlue").drawRect(0, 0, this.size, this.size);
	this.image.regX = this.size/2;
	this.image.regY = this.size/2;
}

Character.prototype.setPos = function(x,y, relativePos) {
	this.x = x - relativePos[0]; // The position of the player relative to the top right corner of the screen i.e. the appeared on-screen position
	this.y = y - relativePos[1];
	this.image.x = x; // The position of player inside the this.area container, i.e. the REAL in game position
	this.image.y = y;
};

Character.prototype.updatePos = function(relativePos) {
	this.image.x += this.speedx; // The position of player inside the this.area container, i.e. the REAL in game position
	this.image.y += this.speedy;
	this.x = this.image.x - relativePos[0]; // The position of the player relative to the top right corner of the screen i.e. the appeared on-screen position
	this.y = this.image.y - relativePos[1];
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



