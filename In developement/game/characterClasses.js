

policeGame.Character = function() {
	this.maxHealth = 100;
	this.health = this.maxHealth;
	this.x = 50;
	this.y = 50;
	this.speedx = 0;
	this.speedy = 0;
	this.walkingSpeed = 1.4;
	this.runningSpeed = 3.5;
	this.acceleration = 0.03;
	this.rotationSpeed = 0.1;
	this.image = new createjs.Shape();
	this.size = 25;
	this.redraw("Purple");
	this.image.regX = this.size/2;
	this.image.regY = this.size/2;
	this.running = false;
};

policeGame.Character.prototype.redraw = function(colour) {
	this.image.graphics.clear().beginFill(colour).drawRect(0, 0, this.size, this.size);
};

policeGame.Character.prototype.setPos = function(x,y) {
	var relativePos = [this.currentArea.regX, this.currentArea.regX];
	this.x = x - relativePos[0]; // The position of the player relative to the top right corner of the screen i.e. the appeared on-screen position
	this.y = y - relativePos[1];
	this.image.x = x; // The position of player inside the this.area container, i.e. the REAL in game position
	this.image.y = y;
};

policeGame.Character.prototype.setPosTile = function(tileX,tileY) {
	var relativePos = [this.currentArea.regX, this.currentArea.regX];
	var x = this.grid.tileSize*(tileX+0.5)
	var y = this.grid.tileSize*(tileY+0.5)
	this.currentTile = [tileX, tileY];
	this.x = x - relativePos[0]; // The position of the player relative to the top right corner of the screen i.e. the appeared on-screen position
	this.y = y - relativePos[1];
	this.image.x = x; // The position of player inside the this.area container, i.e. the REAL in game position
	this.image.y = y;
};

policeGame.Character.prototype.updatePos = function() {
	var relativePos = [this.currentArea.regX, this.currentArea.regY];
	this.image.x += this.speedx; // The position of player inside the this.area container, i.e. the REAL in game position
	this.image.y += this.speedy;
	this.x = this.image.x - relativePos[0]; // The position of the player relative to the top right corner of the screen i.e. the appeared on-screen position
	this.y = this.image.y - relativePos[1];
};


policeGame.Character.prototype.turnTo = function(x,y) {
	angle = Math.atan2( y - this.y, x - this.x);
	angle = angle * (180/Math.PI);
	if (angle < 0)
	{
		angle = 360 - (-angle);
	}
	if (this.image.rotation < 0) {this.image.rotation+=360;}
	if (this.image.rotation > 360) {this.image.rotation-=360;}
	if (Math.abs(angle - this.image.rotation) < 180) {
		this.image.rotation += (angle - this.image.rotation) * this.rotationSpeed;	
	}
	else {
		var dTheta = (angle - this.image.rotation)
		this.image.rotation -= (dTheta/Math.abs(dTheta))*( 360 - Math.abs(dTheta)) * this.rotationSpeed;	
	}
};

policeGame.Character.prototype.takeDamage = function(damage) {
	this.health -= damage;
};


policeGame.MainCharacter = function() {
	policeGame.Character.call(this);
	this.health = 200;
	this.maxHealth = 200;
	this.redraw("DeepSkyBlue");
	this.ammunition = {"handheld": 500};
	this.currentWeapon = new policeGame.NineMM();
	this.weapons = [this.currentWeapon];
	this.bulletsOut = [];
	this.deathCallback = null;
	this.isDead = false;
};

// inherit Character
policeGame.MainCharacter.prototype = Object.create(policeGame.Character.prototype);

// correct the constructor pointer because it points to Character
policeGame.MainCharacter.prototype.constructor = policeGame.MainCharacter;

policeGame.MainCharacter.prototype.behave = function(keysDown, keysUp, gameTime) {
	this.HUD.updateAmmo(this.currentWeapon.currentClip, this.ammunition[this.currentWeapon.ammunitionType]);
	var speedx = 0
	var speedy = 0
	this.running = false;
	for (i = 0; i < keysDown.length; i++) {
		let key = keysDown[i];
		if (key === 65) {
			speedx = -1;
		}
		else if (key === 87) { 
			speedy = -1;
		}
		else if (key === 68) { 
			speedx = 1;
		}
		else if (key === 83) { 
			speedy = 1;
		}
		else if (key === 16) {
			this.running = true;
		}
		else if (key === 70) {
			var bullet = this.currentWeapon.pullTrigger(gameTime);
			if (bullet !== null) { 
				this.currentArea.addChild(bullet.image); 
				bullet.image.x = this.image.x;
				bullet.image.y = this.image.y;
				bullet.speedx = Math.cos(this.image.rotation*2*Math.PI/360) * bullet.maxSpeed ;
				bullet.speedy = Math.sin(this.image.rotation*2*Math.PI/360) * bullet.maxSpeed ;
				this.bulletsOut.push(bullet);
			}
		}
		else if (key === 82) {
			this.reloadCurrentWeapon();
			//console.log(this.ammunition[this.currentWeapon.ammunitionType]);
		}
	}
	var toRemove = [];
	for (i = 0; i < keysUp.length; i++) {
		let key = keysUp[i];
		if (key == 70) {
			this.currentWeapon.releaseTrigger(gameTime);
			toRemove.push(key);
		}
	}
	for (i=0; i<toRemove.length; i++) { keysUp.splice((keysUp.indexOf(toRemove[i])), 1);}
	if (this.running === true) {
		var currentSpeed = Math.pow(Math.pow(this.speedx, 2) + Math.pow(this.speedy, 2), 0.5);
		var totalSpeed = currentSpeed + (this.runningSpeed - currentSpeed) * this.acceleration;
	}
	else {
		var totalSpeed = this.walkingSpeed;
	}
	var speedFactor = Math.pow(Math.abs(speedx) + Math.abs(speedy), 0.5);
	if (speedFactor > 0) {
		var speedDirectional = totalSpeed/speedFactor;
		this.speedy = speedDirectional*speedy;
		this.speedx = speedDirectional*speedx; 
	}
	else {
		this.speedy = 0;
		this.speedx = 0;		
	}
	var toRemove = []
	
	for (var i = 0; i < this.bulletsOut.length; i++) {
		var stillGoing = this.bulletsOut[i].update();
		if (stillGoing === false) {
			toRemove.push(this.bulletsOut[i]);
			this.currentArea.removeChild(this.bulletsOut[i].image);
		}
		else {
			var collide = this.bulletsOut[i].checkCollision(this.grid);
			if (collide) {
				toRemove.push(this.bulletsOut[i]);
				this.currentArea.removeChild(this.bulletsOut[i].image);				
			}
		}
	}
	for (var i=0; i<toRemove.length; i++) { this.bulletsOut.splice((this.bulletsOut.indexOf(toRemove[i])), 1);}
}

policeGame.MainCharacter.prototype.takeDamage = function(damage) {
	if (this.health - damage > 0) {
		this.health -= damage;
	} 
	else{
		this.health = 0;
		if (this.deathCallback !== null && this.isDead === false) {
			this.deathCallback();
			this.isDead = true;
		}
	}
	this.HUD.updateHealth(this.health/this.maxHealth);
};

policeGame.MainCharacter.prototype.resurect = function() {
	this.health = this.maxHealth;
	this.isDead = false;
	this.reloadCurrentWeapon();
	this.HUD.updateHealth(this.health/this.maxHealth);
};

policeGame.MainCharacter.prototype.reloadCurrentWeapon = function() {
	this.ammunition[this.currentWeapon.ammunitionType] = this.currentWeapon.reload(this.ammunition[this.currentWeapon.ammunitionType]);
};

///////////////////////////////////////////////////////////////
///////////////////   N  P  C   //////////////////////////////
//////////////////////////////////////////////////////////////



policeGame.NPCharacter = function() {
	policeGame.Character.call(this);
	this.walk = 0;
	this.path = null;
	this.once = true;
	this.isDead = false;
	this.maxSpeed = 2;
	//this.currentBehaviour = { "following": policeGame.player; }
	this.currentTasks = [ [this.continuedAttack, [policeGame.player]] ];
};

// inherit Character
policeGame.NPCharacter.prototype = Object.create(policeGame.Character.prototype);

// correct the constructor pointer because it points to Character
policeGame.NPCharacter.prototype.constructor = policeGame.NPCharacter;

policeGame.NPCharacter.prototype.aStar = function(xEndTile, yEndTile) {
	this.path = [];
	this.pathN = 0;
	var maxPathLength = 50;
	var maxLoop = 400;
	var loopN = 0;
	var futureTile = this.currentTile;
	var lastDir = [0,0];
	var failed = false;
	while (futureTile[0] != xEndTile || futureTile[1] != yEndTile) {
		loopN += 1;
		if (loopN > maxLoop || this.path.length > maxPathLength) {
			break;
		}
		var bestBet = null;
		var bestBetScore = null;
		var goingHome = false;
		for (var i=-1; i<=1; i++) {
			var xTile = futureTile[0]+i;
			if (xTile > 0 && xTile < this.grid.xSize) {
				for (var j=-1; j<=1; j++) {
					if ( j !== 0 || i !== 0) {
						var yTile = futureTile[1]+j;
						if (yTile > 0 && yTile < this.grid.ySize) {
							if (this.grid.tiles[xTile][yTile].walkable === true) {
								// If diagonal, need special case
								//~ var isHomeTile = false;
								//~ if (xTile === this.currentTile[0] && yTile === this.currentTile[1]) {
									//~ isHomeTile = true;
								//~ }
								var alreadyVisited = false;
								if (this.currentTile[0] === xTile && this.currentTile[1] === yTile) { alreadyVisited = true;}
								for (var k=0; k<this.path.length; k++) {
									if (this.path[k][0] === xTile && this.path[k][1] === yTile) {
										alreadyVisited = true;
									}
								}
								if (alreadyVisited === false) {
									if (Math.abs(i) + Math.abs(j) == 2) {
										if (this.grid.tiles[xTile][futureTile[1]].walkable === true && this.grid.tiles[futureTile[0]][yTile].walkable === true) {
											var bet = Math.abs(xEndTile - (xTile)) + Math.abs(yEndTile - (yTile) );
											if ((bestBet === null || bet < bestBetScore)){
												bestBetScore = bet;
												bestBet = [[xTile, yTile]];
											}
											else if ((bet === bestBetScore) )  {
												bestBet.push([xTile, yTile]);
											}
										}
									}
									else {
										var bet = Math.abs(xEndTile - (xTile)) + Math.abs(yEndTile - (yTile) );
										if ((bestBet === null || bet < bestBetScore) )	 {
											bestBetScore = bet;
											bestBet = [[xTile, yTile]];
										}
										else if ((bet === bestBetScore)) {
											bestBet.push([xTile, yTile]);
										}
									}
								}
							}
						}
					}
				}
			}			
		}
		if (bestBet !== null) {
			choice = bestBet[Math.floor(Math.random() * bestBet.length)];
			this.path.push(choice);
			futureTile = choice;
		}
		else{
			this.path = [];
			futureTile = this.currentTile;
		}
		//~ if (choice[0] === this.currentTile[0] && choice[1] === this.currentTile[1]) {
			//~ //console.log(this.path);
			//~ this.path = [];
		//~ }
	}
	//console.log(this.path, this.colour);
};

policeGame.NPCharacter.prototype.behave = function() {
	if (this.isDead === false) {
		var done = this.currentTasks[0][0].apply(this, this.currentTasks[0][1]);
		if (done === true) {this.currentTasks.shift();}
	}
	//~ var following = this.currentBehaviour["following"];
	//~ if (this.currentBehaviour["following"] !== null) {
		//~ this.aStar(following.currentTile[0], following.currentTile[1]);
	//~ }
	//~ if (this.path !== null && this.pathN < this.path.length) {
		//~ if (this.pathN < this.path.length-2) {
			//~ var hit = this.goTowardsTile(this.path[this.pathN], this.path[this.pathN+1]);
		//~ }
		//~ else{
			//~ var hit = this.goTowardsTile(this.path[this.pathN], null);
		//~ }
		//~ if (hit === true) {
			//~ this.pathN += 1;
			//~ if (this.once === true && Math.random() > 0.95){
				//~ this.once=false;
				//~ this.aStar(policeGame.player.currentTile[0], policeGame.player.currentTile[1]);
			//~ }
		//~ }
	//~ }
};

policeGame.NPCharacter.prototype.takeDamage = function(damage) {
	if (this.health - damage > 0) {
		this.health -= damage;
	} 
	else{
		this.health = 0;
		this.die();
	}
}

policeGame.NPCharacter.prototype.die = function() {
	//console.log("DEATH");
	this.isDead = true;
	this.speedx = 0;
	this.speedy = 0;
	this.currentArea.removeChild(this.image);
	if (this.goingTowards !== null) { 
		this.grid.getTile(this.goingTowards[0], this.goingTowards[1]).character = null;
	}
}

policeGame.NPCharacter.prototype.continuedFollow = function(character) {
	var endTile = character.currentTile;
	//console.log(this.pathN, this.path.length);
	//console.log(this.pathN === this.path.length, (this.currentTile[0] !== endTile[0] || this.currentTile[1] !== endTile[1]), endTile, this.currentTile);
	if (this.path === null || (this.pathN >= this.path.length && (this.currentTile[0] !== endTile[0] || this.currentTile[1] !== endTile[1])) ) {
		this.speedx = 0;
		this.speedy = 0;
		this.aStar(endTile[0], endTile[1]);
	}
	if (this.path !== null && this.pathN < this.path.length) {
		if (this.pathN < this.path.length-2) {
			var hit = this.goTowardsTile(this.path[this.pathN], this.path[this.pathN+1]);
		}
		else{
			var hit = this.goTowardsTile(this.path[this.pathN], null);
		}
		if (hit === true) {
			this.pathN += 1;
			//if (this.pathN === this.path.length - 1) { this.speedx=0;this.speedy=0;}
			if (this.once === true && ((this.path[this.path.length-1][0] !== endTile[0] || this.path[this.path.length-1][1] !== endTile[1]) && Math.random() > 0.6)){
				//console.log("recalc");
				//this.once=false;
				this.speedx = 0;
				this.speedy = 0;
				this.aStar(endTile[0], endTile[1]);
			}
		}
	}
	else {
		this.speedx = 0;
		this.speedy = 0;
	}
	return false;
};

policeGame.NPCharacter.prototype.continuedAttack = function(character) {
	this.continuedFollow(character);
	if (distanceTo([this.image.x, this.image.y], [character.image.x, character.image.y]) < (this.size/2 + character.size/2)) {character.takeDamage(1);}
	return false
};

policeGame.NPCharacter.prototype.goTowards = function(point1, point2) {
	var direction = [point1[0] - this.image.x, point1[1] - this.image.y];
	var directionMagnitude = modulus(direction);
	var hitPoint1 = false;
	if (directionMagnitude !== 0) {
		if (point2 === null || directionMagnitude > this.maxSpeed) {
			for (var i=0; i<2; i++) { direction[i] = this.maxSpeed*direction[i]/directionMagnitude;}
			this.speedx = direction[0];
			this.speedy = direction[1]; 
			if (directionMagnitude < this.maxSpeed) {
				this.speedx = this.speedx * directionMagnitude/this.maxSpeed;
				this.speedy = this.speedy * directionMagnitude/this.maxSpeed;
				hitPoint1 = true;
			}
		}
		else {
			var direction = [point2[0] - this.image.x, point2[1] - this.image.y];
			var directionMagnitude = modulus(direction);
			for (var i=0; i<2; i++) { direction[i] = this.maxSpeed*direction[i]/directionMagnitude;}
			this.speedx = direction[0];
			this.speedy = direction[1]; 
			hitPoint1 = true;		
		}
	}
	else {
		this.speedx = 0;
		this.speedy = 0;
		hitPoint1 = true;
	}
	return hitPoint1
};

policeGame.NPCharacter.prototype.goTowardsTile = function(tile1, tile2) {
	var character = this.grid.tiles[tile1[0]][tile1[1]].character;
	if (character === this || character === null) {
		if (character === null) { 
			this.grid.tiles[tile1[0]][tile1[1]].character = this; 
			this.goingTowards = tile1;
		}
		var point1 = this.grid.tileToCentre(tile1[0], tile1[1]);
		if (tile2 !== null) {
			var point2 = this.grid.tileToCentre(tile2[0], tile2[1]);
		}
		else {var point2 = null;}
		//var point2 = null; // point2 does not get used atm, doesn't work right
		var hit = this.goTowards(point1, point2);
		if (hit === true) {
			this.currentTile = tile1;	
			this.grid.tiles[tile1[0]][tile1[1]].character = null;
			if (tile2 !== null) {
				this.goingTowards = tile2;
			}
		}
		return hit;
	}
	else {
		this.speedx = 0;
		this.speedy = 0;
	}
	return false;
};
