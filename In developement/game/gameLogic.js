
// The "highest" function (i.e. the "main" function, that controls everything)
policeGame.PoliceGame = function() {
	// Set up stage
	this.stage = policeGame.stage;
	this.currentArea = null;
	// This function holds the game time, and it is updated by the area game times. Only reset to zero on init, since guns won't do fireRate properly otherwise (and cos times doesnt go back on itself)
	this.gameTime = 0;
	// Start the game, i.e. init the area
	this.resetGame();	
	window.addEventListener("keyup", this.handleKeyUp.bind(this));
	// Set the function for the player to call when dead
	policeGame.player.deathCallback = this.deathScreen.bind(this);
}

// Clears area, replaces with new one and resurrects player
policeGame.PoliceGame.prototype.resetGame = function() {
	// If there is already an area, update the game time and close it
	if (this.currentArea !== null) {
		this.gameTime = this.currentArea.gameTime
		this.currentArea.close();
	}
	// Create new area and play it, ressurect player
	this.currentArea = new policeGame.Area(18,18,32, this.gameTime);
	this.currentArea.play();
	policeGame.player.resurect();
}

// Function called by player upon death. Pause game, show death menu
policeGame.PoliceGame.prototype.deathScreen = function() {
	this.pauseGame();
	new policeGame.DeathMenu(policeGame.player.kills, this.stage, this.resetGame.bind(this));
}

policeGame.PoliceGame.prototype.handleKeyUp = function(evt) {
	evt.preventDefault();
	var code = evt.keyCode;
	// Pause game if escape
	if (code === 27) {
		this.togglePauseGame();
	}
};

// Pause/Unpause area, bring up pause menu
policeGame.PoliceGame.prototype.togglePauseGame = function(evt) {
	if (this.currentArea.paused === false) {
		this.currentArea.pause();	
		new policeGame.PauseMenu(this.stage, this.unpauseGame.bind(this));
	}
	else {
		this.currentArea.play();
	}	
};

// Pause area
policeGame.PoliceGame.prototype.pauseGame = function() {
	this.currentArea.pause();
}

// Unpause area;
policeGame.PoliceGame.prototype.unpauseGame = function() {
	this.currentArea.play();
};




// Create player, start Game
policeGame.player = new policeGame.MainCharacter();
game = new policeGame.PoliceGame();

