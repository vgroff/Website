


policeGame.Tile = function(walkable) {
	this.walkable = walkable;
	this.contains = [];
	this.character = null;
	//this.futureCharacter = null;
};

policeGame.Grid = function(xSize, ySize, tileSize) {
	this.tiles = [];
	this.tileSize = tileSize;
	this.xSize = xSize;
	this.ySize = ySize;
}

policeGame.Grid.prototype.getTile = function(xTile, yTile) {
	try {	
		var tile = this.tiles[xTile][yTile];
	}
	catch (err) {
		var tile = null;
	}	
	finally {
		if (tile === undefined) {tile=null;}
		return tile
	}
};

policeGame.Grid.prototype.addToTile = function(xTile, yTile, obj) {
	this.tiles[xTile][yTile].contains.push(obj);
};

policeGame.Grid.prototype.removeFromTile = function(xTile, yTile, obj) {
	var index = this.tiles[xTile][yTile].indexOf(obj);
	this.tiles[xTile][yTile].contains.splice(index, 1);
};

policeGame.Grid.prototype.getTileAt = function(x, y) {
	return this.tiles[Math.floor(x/this.tileSize)][Math.floor(y/this.tileSize)] 
};

policeGame.Grid.prototype.pointToTile = function(x, y) {
	return [Math.floor(x/this.tileSize), Math.floor(y/this.tileSize)] 
};

policeGame.Grid.prototype.tileToCentre = function(tileX, tileY) {
	return [this.tileSize*(tileX+0.5), this.tileSize*(tileY+0.5)]
};

policeGame.Area = function(xSize, ySize, tileSize, gameTime) {
	
	this.player = policeGame.player;
	this.paused = false;
	
	this.gameTime = gameTime;	
	
	this.stage = policeGame.stage;
	this.canvas = this.stage.canvas;
	
	this.keysDown = [];
	this.keysUp = [];
	
	this.xSize = xSize;
	this.ySize = ySize;
	this.tileSize = tileSize;
	this.grid = new policeGame.Grid(xSize, ySize, tileSize);
	
	for (var i = 0; i < xSize; i++) {
		this.grid.tiles.push([])
		for (var j = 0; j < ySize; j++) {
			if (i==0 || j==0 || i==xSize-1 || j==ySize-1) {
				this.grid.tiles[i].push( new policeGame.Tile(false) );
			}
			else {
				this.grid.tiles[i].push( new policeGame.Tile(true) );
			}
		}	
	}	
	
	var unwalkables = [ [3,5], [3, 7], [6,8], [9, 2], [6, 12], [6, 13], [13, 4], [14, 4], [14, 5], [14, 6], [10, 6], [9, 6], [8, 6],
	[9, 9], [10, 10], [9, 10], [11, 11]];
	for (var i = 0; i < unwalkables.length; i++) {
		this.grid.tiles[unwalkables[i][0]][unwalkables[i][1]].walkable = false;
	}

	
	this.area = new createjs.Container();
	this.area.x = 0;
	this.area.y = 0;
	this.stage.addChild(this.area);
	
	this.drawGrid();
	
	this.characters = [];
	this.addCharacter( this.player,10, 9 );	
	this.HUD = new policeGame.HUD(this.stage);
	this.stage.addChild(this.HUD.container);
	this.player.HUD = this.HUD;
	
	//var colours = ["Black", "Yellow", "White", "Purple"];
	for (var i=0; i<1; i++) {
		var NPC = new policeGame.NPCharacter();
		//NPC.redraw(colours[i]);
		//NPC.colour = colours[i];
		this.addCharacter( NPC, 10, 11 );		
	}
	
	//Update stage will render next frame	
	this.playerLimits = [ Math.floor(this.canvas.width*3/10), Math.floor(this.canvas.width*7/10), Math.floor(this.canvas.height*3/10), Math.floor(this.canvas.height*7/10)]
	
	window.addEventListener("keydown", this.handleKeyDown.bind(this));
	window.addEventListener("keyup", this.handleKeyUp.bind(this));
	this.stage.update();
};

// USED BY HIGHER UP CLASSES
policeGame.Area.prototype.play = function() {
	this.listener = createjs.Ticker.on("tick", this.updateStage.bind(this));
	createjs.Ticker.setFPS(60)	
};
// USED BY HIGHER UP CLASSES
policeGame.Area.prototype.pause = function() {
	createjs.Ticker.off("tick", this.listener);
};

policeGame.Area.prototype.addCharacter = function(character, xTile, yTile) {
	if (this.grid.tiles[xTile][yTile].walkable == true) {
		this.characters.push(character);
		character.currentArea = this.area;
		character.image.rotation = 0;
		this.area.addChild(character.image);
		character.grid = this.grid;
		character.setPosTile(xTile, yTile);
		return true;
	}
	else{
		return false;
	}
};

policeGame.Area.prototype.updateStage = function() {
	// FOR AI CHARACTERS, UPDATE BEHAVIOUR BEFORE MOVING THEM
	if (this.paused === false) {
		this.gameTime += 1;
		this.updateWorld();
		this.player.behave(this.keysDown, this.keysUp, this.gameTime);
		this.onTiles(this.player);
		var toRemove = [];
		//console.log(this.characters.length);
		for (var i = 0; i < this.characters.length; i++) {
			let character = this.characters[i]; 
			character.updatePos(); 
			if (character !== this.player) {
				character.behave();
			}
			//console.log(character.isDead);
			if (character.isDead === true) {
				toRemove.push(character);
			}
		}
		for (var i = 0; i < toRemove.length; i++) {
			this.characters.splice(this.characters.indexOf(toRemove[i]), 1);
		}
		this.player.turnTo( this.stage.mouseX, this.stage.mouseY );
		this.stage.update();
	}
};

policeGame.Area.prototype.deathScreen = function() {
	this.paused = true;
}

policeGame.Area.prototype.onTiles = function(character) {
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
	character.currentTile = [centreTileXN, centreTileYN];
	var tiles = [];
	// Loop over possibilities (in a kinda ugly way)
	for (var i = 0; i <= 1; i++) {
		var mapI = 2*i - 1
		// If xlims broken, save the horizontal tile and stop player if unwalkable 
		if (xLimsBroken[i] === true) { 
			tiles.push([centreTileXN+mapI, centreTileYN]);
			if (this.grid.tiles[centreTileXN+mapI][centreTileYN].walkable === false && ( (character.speedx < 0 && i==0) || (character.speedx > 0 && i==1) ) ) {
				//character.setPos(character.image.x-2*character.speedx, character.image.y, [this.area.regX,this.area.regY]);
				character.setPos(character.image.x-2*character.speedx, character.image.y, [this.area.regX,this.area.regY]);
			}
		}
		if (yLimsBroken[i] === true) { 
			tiles.push([centreTileXN, centreTileYN+mapI]); 
			if (this.grid.tiles[centreTileXN][centreTileYN+mapI].walkable === false && ( (character.speedy < 0 && i==0) || (character.speedy > 0 && i==1) ) ){
				character.setPos(character.image.x, character.image.y-2*character.speedy, [this.area.regX,this.area.regY]);
			}
		}
		// This bit deals with diagonal tiles
		for (var j = 0; j <= 1; j++) {
			var mapJ = 2*j - 1
			if (xLimsBroken[i] === true && yLimsBroken[j] === true) {
				tiles.push([centreTileXN+mapI, centreTileYN+mapJ]);
				if (this.grid.tiles[centreTileXN+mapI][centreTileYN+mapJ].walkable === false && ( (character.speedx < 0 && (i==0 && j==0)) 
				|| (character.speedx > 0 && (i==1 && j==0)) || (character.speedx < 0 && (i==0 && j==1))
				|| (character.speedx > 0 && (i==1 && j==1))  ) ) {
					character.setPos(character.image.x-2*character.speedx, character.image.y, [this.area.regX,this.area.regY]);
				}
				if (this.grid.tiles[centreTileXN+mapI][centreTileYN+mapJ].walkable === false && ( (character.speedy < 0 && (i==0 && j==0)) 
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

policeGame.Area.prototype.updateWorld = function() {
	if ((this.player.x < this.playerLimits[0] && this.player.speedx < 0) || (this.player.x > this.playerLimits[1] && this.player.speedx > 0)) {
		this.area.regX += this.player.speedx;
	}
	if ((this.player.y < this.playerLimits[2] && this.player.speedy < 0) || (this.player.y > this.playerLimits[3] && this.player.speedy > 0)) {
		this.area.regY += this.player.speedy;
	}
};

policeGame.Area.prototype.drawGrid = function() {
	this.background = new createjs.Container();
	this.area.addChild(this.background);
	for (var i = 0; i < this.xSize; i++) {
		for (var j = 0; j < this.ySize; j++) {
			var image = new createjs.Shape();
			if (this.grid.tiles[i][j].walkable === true) {
				var col = "Green";
			}
			else{
				var col = "Brown";
			}
			image.graphics.beginFill(col).drawRect(this.tileSize*i, this.tileSize*j, this.tileSize, this.tileSize);
			this.background.addChild(image)
		}	
	} 
	//~ var line = new createjs.Shape();
	//~ line.graphics.setStrokeStyle(2);
	//~ line.graphics.beginStroke("#000000");
	//~ for (var i = 0; i < this.xSize+1; i++) {
		//~ line.graphics.moveTo(i*this.tileSize, 0);
		//~ line.graphics.lineTo(i*this.tileSize, this.ySize*this.tileSize);
	//~ }
	//~ for (var i = 0; i < this.ySize+1; i++) {
		//~ line.graphics.moveTo(0, i*this.tileSize);
		//~ line.graphics.lineTo(this.xSize*this.tileSize, i*this.tileSize);
	//~ }
	//~ line.graphics.endStroke();	
	//~ this.background.addChild(line);
	this.background.cache(0,0,(this.xSize+1)*this.tileSize, (this.ySize+1)*this.tileSize);
};

policeGame.Area.prototype.handleKeyDown = function(evt) {
	evt.preventDefault();
	var code = evt.keyCode;
	if (this.paused === false) {
		if (this.keysDown.indexOf(code) == -1) {
			this.keysDown.push(code);
		}
		var index = this.keysUp.indexOf(code);
		if (index !== -1) {this.keysUp.splice(index, 1);}
	}

};



policeGame.Area.prototype.handleKeyUp = function(evt) {
	evt.preventDefault();
	var code = evt.keyCode;
	if (this.paused === false) {
		if (this.keysUp.indexOf(code) == -1) {
			this.keysUp.push(code);
		}
	}
	var index = this.keysDown.indexOf(code);
	this.keysDown.splice(index, 1);
};

policeGame.Area.prototype.close = function() {
	this.pause();
	this.stage.removeChild(this.area);
	this.stage.removeChild(this.HUD.container);
};


policeGame.HUD = function() {
	this.container = new createjs.Container();
	
	this.healthBarTotal = new createjs.Shape();
	this.healthBarX = 200;
	this.healthBarTotal.graphics.beginFill("white").drawRect(policeGame.canvas.width - this.healthBarX - 30, 50, this.healthBarX, 30);
	this.container.addChild(this.healthBarTotal);
	this.healthBarCurrent = new createjs.Shape();
	this.healthBarCurrent.graphics.beginFill("red").drawRect(policeGame.canvas.width - this.healthBarX - 30, 50, this.healthBarX, 30);
	this.container.addChild(this.healthBarCurrent);
	this.healthBarBorder = new createjs.Shape();
	this.healthBarBorder.graphics.setStrokeStyle(4).beginStroke("#000000").drawRect(policeGame.canvas.width - this.healthBarX - 30, 50, this.healthBarX, 30);
	this.container.addChild(this.healthBarBorder);
	
	this.reloadText = null;

	
	this.currentClipShown = null;
	this.currentAmmoShown = null;
};

policeGame.HUD.prototype.updateHealth = function(fraction) {
	this.healthBarCurrent.graphics.clear().beginFill("red").drawRect(policeGame.canvas.width - this.healthBarX - 30, 50, this.healthBarX*fraction, 30);
};

policeGame.HUD.prototype.updateAmmo = function(clip, ammo) {
	if (clip !== this.currentClipShow || ammo !== this.currentAmmoShown) {
		this.currentClipShown = clip;
		this.currentAmmoShown = ammo;
		this.container.removeChild(this.reloadText);
		this.reloadText = new createjs.Text(clip+"/"+ammo, "30px Arial", "#DDDDDD");
		var bounds = this.reloadText.getBounds();
		this.reloadText.x = policeGame.canvas.width - bounds.width - 25;
		this.reloadText.y = 20;
		this.container.addChild(this.reloadText);
	}
};



// Next min requirements:
// Some game mechanics!:
// 1. A* change to follow "target" (rather than player) and re-calculate based on closeness to target and how much target has moved since original path - POSSIBLY USE DOT PRODUCT OF PATH - CHANGES WITH RELATIVE DIRECTION AND MAGNITUDE OF BOTH VECTORS
// 2. Infinite zombie spawn - randomly placed not too near player and counter for number of kills
// 3. Ammunition and perks new guns etc... could be mostly passive - getting "picked up" rather than needing any udpating - but they do need to dissapear at some point so needs to be considered.
// More of the above!!

// Next min requirements:
// Basic AI!
// 1. Enemies shooting back!
// 2. Commenting (Sorry may', but has to be done at this level if this is gonna be a long term project)

// Next min requirements:
// 1. A basic tactical screen/item select screen/map screen (TAB?) - will need to build a lot of building blocks here for sub-menus etc...
// 2. AI, different characters doing tasks independently, basically our first neighbourhood

// Serious improvements:
// 1. A* pathfinding will look more intelligent if re-calculated more frequently. It would be dumb to re-calculate the whole path, 
// so maybe check if user hasnt moved too much, and if so re-calculate the last X points as long as L>L_min L-length fo path array i.e. re-calculate the end of longer paths (thinking L_min > 10, re-do the last 6 points)
// 2. Should have a larger degree of freedom with A* to prevent people getting blocked. Best idea would be to have any decision possible, just scaled with probability such that the "best" ones are chosen far more often. 
// then we could have an option where once a certain choice is made, it's weighting drops by one half (say) to avoid it being chosen again as often. That way probability will allow us a way out of any situation!

// Then we start thinking about more serious mechanics
