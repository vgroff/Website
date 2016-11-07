function PoliceGame() {
 
	this.currentArea = new Area(50,50,32);
	this.currentArea.play();

}



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
