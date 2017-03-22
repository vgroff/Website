

// Tile class, represents a square on the grid which can be walked on or not
policeGame.Tile = function(walkable) {
	this.walkable = walkable;
	this.contains = [];
	this.character = null;
};

// Grid class, containers the tiles and information about the overall grid
policeGame.Grid = function(xSize, ySize, tileSize) {
	this.tiles = [];
	this.tileSize = tileSize;
	this.xSize = xSize;
	this.ySize = ySize;
}

// Return the tile object at indices xTile, yTile in the grid 2-d array, null if none
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

// Return random tile indices
policeGame.Grid.prototype.getRandomTile = function() {
	return [Math.floor(Math.random() * this.xSize),  Math.floor(Math.random() * this.ySize)];
};

// Add obj to the tile with indices xTile, yTil
policeGame.Grid.prototype.addToTile = function(xTile, yTile, obj) {
	this.tiles[xTile][yTile].contains.push(obj);
};

// Remove obj from the tile with indices xTile, yTile
policeGame.Grid.prototype.removeFromTile = function(xTile, yTile, obj) {
	var index = this.tiles[xTile][yTile].indexOf(obj);
	this.tiles[xTile][yTile].contains.splice(index, 1);
};

// Get the tile at the point x,y
policeGame.Grid.prototype.getTileAt = function(x, y) {
	return this.tiles[Math.floor(x/this.tileSize)][Math.floor(y/this.tileSize)] 
};

// Get the tile indices at the point x,y
policeGame.Grid.prototype.pointToTile = function(x, y) {
	return [Math.floor(x/this.tileSize), Math.floor(y/this.tileSize)] 
};

// Get the centre of the tile with indices tileX, tileY
policeGame.Grid.prototype.tileToCentre = function(tileX, tileY) {
	return [this.tileSize*(tileX+0.5), this.tileSize*(tileY+0.5)]
};


// An Area, that is a space built of tiles representing one neighbourhood/region etc...
policeGame.Area = function(xSize, ySize, tileSize, gameTime) {
	
	this.paused = false;
	
	this.gameTime = gameTime;	
	
	this.stage = policeGame.stage;
	this.canvas = this.stage.canvas;
	
	this.keysDown = [];
	this.keysUp = [];
	
	// Build the grid
	this.xSize = xSize;
	this.ySize = ySize;
	this.tileSize = tileSize;
	this.grid = new policeGame.Grid(xSize, ySize, tileSize);
	for (var i = 0; i < xSize; i++) {
		this.grid.tiles.push([])
		for (var j = 0; j < ySize; j++) {
			// Make the tiles on the end unwalkable to avoid problems
			if (i==0 || j==0 || i==xSize-1 || j==ySize-1) {
				this.grid.tiles[i].push( new policeGame.Tile(false) );
			}
			else {
				this.grid.tiles[i].push( new policeGame.Tile(true) );
			}
		}	
	}	
	// Make some tiles unwalkable
	var unwalkables = [ [3,5], [3, 7], [6,8], [9, 2], [6, 12], [6, 13], [13, 4], [14, 4], [14, 5], [14, 6], [10, 6], [9, 6], [8, 6],
	[9, 9], [10, 10], [9, 10], [11, 11]];
	for (var i = 0; i < unwalkables.length; i++) {
		this.grid.tiles[unwalkables[i][0]][unwalkables[i][1]].walkable = false;
	}
	// Create the container for the area. x,y remain unchanged, we just change regX, regY to move it 
	this.area = new createjs.Container();
	this.area.x = 0;
	this.area.y = 0;
	this.stage.addChild(this.area);
	// Draw the background
	this.drawGrid();
	// Add main character and HUD
	this.player = policeGame.player;
	this.addCharacter( this.player, 3, 3 );	
	this.HUD = new policeGame.HUD(this.stage);
	this.stage.addChild(this.HUD.container);
	this.player.HUD = this.HUD;	
	this.playerLimits = [ Math.floor(this.canvas.width*3/10), Math.floor(this.canvas.width*7/10), Math.floor(this.canvas.height*3/10), Math.floor(this.canvas.height*7/10)];  // max on-screen points for player
	// Add non-playable characters
	this.NPcharacters = [];
	this.maxZombies = 5;
	this.startingZombies = 0;
	this.avZombies = this.startingZombies;
	this.zombieAvRate = 1/30;
	for (var i=0; i<this.startingZombies; i++) {
		var NPC = new policeGame.NPCharacter();s
		this.addCharacter( NPC, 10, 11 );		
	}
	// Add event listeners
	window.addEventListener("keydown", this.handleKeyDown.bind(this));
	window.addEventListener("keyup", this.handleKeyUp.bind(this));
	// Draw to screen
	this.stage.update();
};

// USED BY HIGHER UP CLASSES, creates ticker and plays
policeGame.Area.prototype.play = function() {
	this.listener = createjs.Ticker.on("tick", this.updateStage.bind(this));
	createjs.Ticker.setFPS(60);
	this.paused = false;
};

// USED BY HIGHER UP CLASSES, removes ticker and pauses
policeGame.Area.prototype.pause = function() {
	createjs.Ticker.off("tick", this.listener);
	this.paused = true;
};

// Add a character to the area
policeGame.Area.prototype.addCharacter = function(character, xTile, yTile) {
	if (this.grid.tiles[xTile][yTile].walkable == true) {
		if (character !== this.player) {this.NPcharacters.push(character);}
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

// Radomly spawn a zombie
policeGame.Area.prototype.spawnZombie = function() {
	// Find average number of zombies
	this.avZombies = this.avZombies*(1-this.zombieAvRate) + this.NPcharacters.length * this.zombieAvRate;
	var maxDistance = 250; // Maximum distance from player zombie can spawn
	var maxLoops = 10;	   // Maximum attempts to spawn before giving up
	// If zombie rate low and not too many zombies
	if (this.avZombies < this.maxZombies && this.NPcharacters.length < this.maxZombies) {
		// Spawn zombie depending on how many there have been as of recently
		if (Math.random() < (1/25)*((this.maxZombies - this.avZombies) / this.maxZombies)) {
			var placed = false;
			var loop = 0;
			while (placed === false && loop <= maxLoops) {
				loop += 1;
				var tile = this.grid.getRandomTile();
				var point = this.grid.tileToCentre(tile[0], tile[1]);
				// If far enough away, then place it
				if (distanceTo(point, [this.player.image.x, this.player.image.y]) >= maxDistance) {
					placed = true;
					this.addCharacter(new policeGame.NPCharacter(), tile[0], tile[1]);
				}
			}
		}
	}
};

// Run every 1/60 of a second if ticker is on
policeGame.Area.prototype.updateStage = function() {
	// If game is being played
	if (this.paused === false) {
		// Update the time (used by guns and behaviour)
		this.gameTime += 1;													
		// Update the regX, regY of the area if player has moved too far up/down/left/right
		this.updateWorld();				
		// Player responds to whatever keys have been pressed									
		this.player.behave(this.keysDown, this.keysUp, this.gameTime);
		// Update player position depending on speedx, speedy				
		this.player.updatePos();						
		// Turn player to face mouse					
		this.player.turnTo( this.stage.mouseX, this.stage.mouseY );	
		// Make player collide with walls		
		this.onTiles(this.player);											
		var toRemove = [];
		// Spawn Zombie if needed
		this.spawnZombie();			
		// NB: Player is not in NPcharacters										
		for (var i = 0; i < this.NPcharacters.length; i++) {				
			let character = this.NPcharacters[i]; 
			// Update NPC behaviour
			character.behave();	
			// Update NPC position											
			character.updatePos(); 	
			// If NPC dead, update count and HUD																						
			if (character.isDead === true) {								
				toRemove.push(character);
				this.player.kills += 1;
				this.player.HUD.updateScore(this.player.kills);
			}
		}
		// Remove dead character(s)
		for (var i = 0; i < toRemove.length; i++) {							
			this.NPcharacters.splice(this.NPcharacters.indexOf(toRemove[i]), 1);
		}
		this.stage.update();
	}
};


policeGame.Area.prototype.onTiles = function(character) {
	// Tile collisions done with a circle approx, since rotation makes full treatement difficult and with sprites should be fine neway (humans look like circles, not squares from above)
	// Get the central tile (tile cetnre point over)
	var centreTileXN = Math.floor(character.image.x / this.tileSize)
	var centreTileYN = Math.floor(character.image.y / this.tileSize)
	var centreTileX = centreTileXN * this.tileSize
	var centreTileY = centreTileYN * this.tileSize
	var leeway = 0.9;
	// Max limits of player in x and y
	var playerXLims = [character.image.x - character.size*leeway/2, character.image.x + character.size*leeway/2] 
	var playerYLims = [character.image.y - character.size*leeway/2, character.image.y + character.size*leeway/2]
	var xLimsBroken = [false, false];
	var yLimsBroken = [false, false]; 
	// Check which limits broken
	if (centreTileX > playerXLims[0]) { xLimsBroken[0] = true; }
	if (centreTileX+this.tileSize < playerXLims[1]) { xLimsBroken[1] = true; }
	if (centreTileY > playerYLims[0]) { yLimsBroken[0] = true; }
	if (centreTileY+this.tileSize < playerYLims[1]) { yLimsBroken[1] = true; }
	character.currentTile = [centreTileXN, centreTileYN];
	// Tile holds whatever tiles we are on
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
		// If ylims broken, save the horizontal tile and stop player if unwalkable 
		if (yLimsBroken[i] === true) { 
			tiles.push([centreTileXN, centreTileYN+mapI]); 
			if (this.grid.tiles[centreTileXN][centreTileYN+mapI].walkable === false && ( (character.speedy < 0 && i==0) || (character.speedy > 0 && i==1) ) ){
				character.setPos(character.image.x, character.image.y-2*character.speedy, [this.area.regX,this.area.regY]);
			}
		}
		// This bit deals with diagonal tiles
		for (var j = 0; j <= 1; j++) {
			var mapJ = 2*j - 1
			// If we are over both boundaries in said direction, we are on the diagonal tile 
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

// Move the whole world with the plater (at player speed) if he is too near any of the player limits, gives the impression of that the screen is moving
policeGame.Area.prototype.updateWorld = function() {
	if ((this.player.x < this.playerLimits[0] && this.player.speedx < 0) || (this.player.x > this.playerLimits[1] && this.player.speedx > 0)) {
		this.area.regX += this.player.speedx;
	}
	if ((this.player.y < this.playerLimits[2] && this.player.speedy < 0) || (this.player.y > this.playerLimits[3] && this.player.speedy > 0)) {
		this.area.regY += this.player.speedy;
	}
};

// Draw the background using this.grid
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
				var col = "#664422";
			}
			image.graphics.beginFill(col).drawRect(this.tileSize*i, this.tileSize*j, this.tileSize, this.tileSize);
			this.background.addChild(image)
		}	
	} 
	var drawGridLines = false;
	if (drawGridLines === true) {
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
		this.background.addChild(line);
	}
	this.background.cache(0,0,(this.xSize+1)*this.tileSize, (this.ySize+1)*this.tileSize);
};

policeGame.Area.prototype.handleKeyDown = function(evt) {
	evt.preventDefault();
	var code = evt.keyCode;
	// If not paused, add to the list of pressed keys to be passed to the character on next update
	if (this.paused === false) {
		if (this.keysDown.indexOf(code) == -1) {
			this.keysDown.push(code);
		}
		// If key down, not key up, so remove
		var index = this.keysUp.indexOf(code);
		if (index !== -1) {this.keysUp.splice(index, 1);}
	}

};



policeGame.Area.prototype.handleKeyUp = function(evt) {
	evt.preventDefault();
	var code = evt.keyCode;
	// If not paused, add to the list of released keys to be passed to the character on next update
	if (this.paused === false) {
		if (this.keysUp.indexOf(code) == -1) {
			this.keysUp.push(code);
		}
	}
	// If key up, not key down, so remove
	var index = this.keysDown.indexOf(code);
	this.keysDown.splice(index, 1);
};

// Close the area, called by higher functions when area is left.
policeGame.Area.prototype.close = function() {
	this.pause();
	this.stage.removeChild(this.area);
	this.stage.removeChild(this.HUD.container);
};

// Heads up display function
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
	this.scoreText = null;

	
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

policeGame.HUD.prototype.updateScore = function(kills) {
	this.container.removeChild(this.scoreText);
	this.scoreText = new createjs.Text("Score: "+kills, "30px Arial", "#DDDDDD");
	var bounds = this.scoreText.getBounds();
	this.scoreText.x = policeGame.canvas.width/2 - bounds.width/2;
	this.scoreText.y = 40;
	this.container.addChild(this.scoreText);
};

// TODO:
// GAME NOT PAUSING!!!!!!!!!!!

// Next min requirements:
// GAME NOT PAUSING!!!!!!!!!!!
// 1. A* change to follow "target" (rather than player) and re-calculate based on closeness to target and how much target has moved since original path - POSSIBLY USE DOT PRODUCT OF PATH - CHANGES WITH RELATIVE DIRECTION AND MAGNITUDE OF BOTH VECTORS
// 2. Ammunition and perks new guns etc... could be mostly passive - getting "picked up" rather than needing any updating - but they do need to dissapear at some point so needs to be considered.
// 3. Remove area event listeners when area.close()

// Next min requirements:
// 1. Commenting (Sorry may', but has to be done at this level if this is gonna be a long term project) !!!!/
// !!!!!!


// Next min requirements:
// 1. A basic tactical screen/item select screen/map screen (TAB?) - will need to build a lot of building blocks here for sub-menus etc...
// 2. AI, different characters doing tasks independently, basically our first neighbourhood - use behaviour trees and behaviour3js http://behavior3js.guineashots.com/ just read the code, docs dont seem great - or even better, write your own (but it SHOULD still be a tree for max memory usage, using a blackboard (so single tree for multiple cases))

// Serious improvements:
// 1. A* pathfinding will look more intelligent if re-calculated more frequently. It would be dumb to re-calculate the whole path, 
// so maybe check if user hasnt moved too much, and if so re-calculate the last X points as long as L>L_min L-length fo path array i.e. re-calculate the end of longer paths (thinking L_min > 10, re-do the last 6 points)
// 2. Should have a larger degree of freedom with A* to prevent people getting blocked. Best idea would be to have any decision possible, just scaled with probability such that the "best" ones are chosen far more often. 
// then we could have an option where once a certain choice is made, it's weighting drops by one half (say) to avoid it being chosen again as often. That way probability will allow us a way out of any situation!

// Then we start thinking about more serious mechanics
