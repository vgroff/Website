policeGame.player = new policeGame.MainCharacter();



policeGame.PoliceGame = function() {
	this.stage = policeGame.stage;
	this.currentArea = null;
	this.gameTime = 0;
	this.resetGame();	
	window.addEventListener("keyup", this.handleKeyUp.bind(this));
	
	policeGame.player.deathCallback = this.deathScreen.bind(this);
}

policeGame.PoliceGame.prototype.resetGame = function() {
	if (this.currentArea !== null) {
		this.gameTime = this.currentArea.gameTime
		this.currentArea.close();
	}
	this.currentArea = new policeGame.Area(18,18,32, this.gameTime);
	this.currentArea.play();
	policeGame.player.resurect();
}

policeGame.PoliceGame.prototype.deathScreen = function() {
	new policeGame.DeathMenu(this.stage, this.resetGame.bind(this));
}

policeGame.PoliceGame.prototype.handleKeyUp = function(evt) {
	evt.preventDefault();
	var code = evt.keyCode;
	if (code === 27) {
		this.togglePauseGame();
	}
};

policeGame.PoliceGame.prototype.togglePauseGame = function(evt) {
	this.currentArea.paused = !this.currentArea.paused;
	if (this.currentArea.paused === true) {
		this.currentArea.pause();	
		new policeGame.PauseMenu(this.stage, this.unpauseGame.bind(this));
	}
	else {
		this.currentArea.play();
	}	
};

policeGame.PoliceGame.prototype.unpauseGame = function() {
	console.log("unpause");
	this.currentArea.paused = false;
	this.currentArea.play();
};





game = new policeGame.PoliceGame();

