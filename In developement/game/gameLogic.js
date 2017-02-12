function PoliceGame() {
 
	this.currentArea = new Area(25,25,32);
	this.currentArea.play();

}



game = new PoliceGame();


// MINIMU REQUIREMENT:
// 1. Areas with no-go zones
// 2. Move screen

// Going to need to decide how to split this up.
// UI should clearly be listened for and then queued into updateStage
// Going to need classes for player and for NPCs
// Going to need classes for stages (here neighbourhood)
// Going to need classes for weapons
