

policeGame.Gun = function(automatic, baseFireRate, baseDamage, baseRange, baseClipSize, ammunitionType) {
	this.fireRate = baseFireRate;
	this.damage = baseDamage;
	this.lastShot = -this.fireRate;
	this.automatic = automatic;
	this.shot = false;
	this.clipSize = baseClipSize;
	this.currentClip = this.clipSize;
	this.ammunitionType = ammunitionType;
}

policeGame.Gun.prototype.pullTrigger = function(gameTime) {
	if ((this.automatic === true || this.shot === false) && (gameTime - this.lastShot >= this.fireRate) && this.currentClip > 0) {
		this.shot = true;
		this.lastShot = gameTime;
		var bullet = new policeGame.Bullet(this.damage, this.range);
		this.currentClip -= 1;
		return bullet
	}
	return null;
}

policeGame.Gun.prototype.releaseTrigger = function() {
	this.shot = false;
}

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

policeGame.Bullet.prototype.checkCollision = function(grid) {
	var currentTile = grid.pointToTile(this.image.x, this.image.y);
	var tile = grid.getTile(currentTile[0], currentTile[1]);
	if (tile === null || tile.walkable === false) {
		return true;
	}
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
