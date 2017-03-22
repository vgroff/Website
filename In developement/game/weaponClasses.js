
// Base gun class
policeGame.Gun = function(automatic, baseFireRate, baseDamage, baseRange, baseClipSize, ammunitionType) {
	this.fireRate = baseFireRate;
	this.damage = baseDamage;
	this.lastShot = -this.fireRate;
	this.automatic = automatic;
	this.triggerReleased = true;
	this.clipSize = baseClipSize;
	this.currentClip = this.clipSize;
	this.ammunitionType = ammunitionType;
}

policeGame.Gun.prototype.pullTrigger = function(gameTime) {
	// Only release bullet if automatic or if trigger is released before being pulled and the fireRate is correct and enough ammo is left
	if ((this.automatic === true || this.triggerReleased === true) && (gameTime - this.lastShot >= this.fireRate) && this.currentClip > 0) {
		// Trigger now pulled
		this.triggerReleased = false;
		// Time of last shot (needed for fire rate)
		this.lastShot = gameTime;
		// Create and return bullet, decremenet clip
		this.currentClip -= 1;
		var bullet = new policeGame.Bullet(this.damage, this.range);
		return bullet
	}
	return null;
}

policeGame.Gun.prototype.releaseTrigger = function() {
	this.triggerReleased = true;
}

// Takes ammo, reloads clip, returns excess ammo
policeGame.Gun.prototype.reload = function(ammo) {
	var missingBullets = this.clipSize - this.currentClip;
	if ( missingBullets >= ammo) {
		this.currentClip = ammo
		return 0
	}
	else{
		this.currentClip = this.clipSize
		return ammo - missingBullets
	}
}

policeGame.Bullet = function(damage, range) {
	this.damage = damage;
	this.maxSpeed = 5;
	this.range = range;
	this.distance = 0;
	this.image = new createjs.Shape();
	this.image.graphics.beginFill("Black").drawRect(0, 0, 4, 4);
}

policeGame.Bullet.prototype.update = function() {
	this.image.x += this.speedx;
	this.image.y += this.speedy;
	this.distance += Math.pow(Math.pow(this.speedx, 2) + Math.pow(this.speedy, 2), 0.5)
	if (this.distance > this.range) {return false}
}

// Check for collisions with walls or players
policeGame.Bullet.prototype.checkCollision = function(grid) {
	var currentTile = grid.pointToTile(this.image.x, this.image.y);
	var tile = grid.getTile(currentTile[0], currentTile[1]);
	if (tile === null || tile.walkable === false) {
		return true;
	}
	// Check in the 8 tiles surrounding (defo enough with small object)
	for (var i = -1; i<=1; i++) {
		var xTile = currentTile[0]+i;
		for (var j = -1; j<=1; j++) {
			var yTile = currentTile[1]+j;
			var tile = grid.getTile(xTile, yTile);
			if (tile !== null) {
				if (tile.character !== null) {
					var character = tile.character;
					if (distanceTo([this.image.x, this.image.y], [character.image.x, character.image.y]) < character.size) {
						character.takeDamage(this.damage);
						return true;
					}
				}
			}
		}		
	}
	return false;
}



policeGame.NineMM = function() {
	this.baseFireRate = 15;
	this.baseDamage = 50;
	this.automatic = false;
	this.baseClipSize = 6;
	this.baseRange = 200;
	this.ammunitionType = "handheld";
	policeGame.Gun.apply(this, [this.automatic, this.baseFireRate, this.baseDamage, this.baseRange, this.baseClipSize, this.ammunitionType]);
};

// inherit Character
policeGame.NineMM.prototype = Object.create(policeGame.Gun.prototype);

// correct the constructor pointer because it points to Character
policeGame.NineMM.prototype.constructor = policeGame.NineMM;


policeGame.AssaultRifle = function() {
	this.baseFireRate = 7;
	this.baseDamage = 15;
	this.automatic = true;
	this.baseClipSize = 30;
	this.baseRange = 300;
	this.ammunitionType = "machineGun";
	policeGame.Gun.apply(this, [this.automatic, this.baseFireRate, this.baseDamage, this.baseRange, this.baseClipSize, this.ammunitionType]);
};

// inherit Character
policeGame.AssaultRifle.prototype = Object.create(policeGame.Gun.prototype);

// correct the constructor pointer because it points to Character
policeGame.AssaultRifle.prototype.constructor = policeGame.AssaultRifle;

policeGame.Minigun = function() {
	this.baseFireRate = 3;
	this.baseDamage = 100;
	this.automatic = true;
	this.baseClipSize = 1000;
	this.baseRange = 400;
	this.ammunitionType = "minigun";
	policeGame.Gun.apply(this, [this.automatic, this.baseFireRate, this.baseDamage, this.baseRange, this.baseClipSize, this.ammunitionType]);
};

// inherit Character
policeGame.Minigun.prototype = Object.create(policeGame.Gun.prototype);

// correct the constructor pointer because it points to Character
policeGame.Minigun.prototype.constructor = policeGame.Minigun;
