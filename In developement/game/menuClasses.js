
policeGame.PauseMenu = function(stage, callback) {
	this.container = new createjs.Container();
	this.container.x = 0;
	this.container.y = 0;
	this.background = new createjs.Shape();
	var backgroundLims = [policeGame.canvas.width/5, policeGame.canvas.height/8, policeGame.canvas.width*3/5, policeGame.canvas.height*6/8];
	this.background.graphics.beginFill("#664444").drawRect(backgroundLims[0], backgroundLims[1], backgroundLims[2], backgroundLims[3]);
	this.border = new createjs.Shape();
	this.border.graphics.setStrokeStyle(4).beginStroke("#000000").drawRect(backgroundLims[0], backgroundLims[1], backgroundLims[2], backgroundLims[3]);
	this.container.addChild(this.background);
	this.container.addChild(this.border);
	var text = new createjs.Text("Game Paused", "40px Arial", "#000000");
	var bounds = text.getBounds();
	text.x = policeGame.canvas.width/2 - bounds.width/2;
	text.y = 200;
	this.container.addChild(text);
	this.handleKeyUpFunc =  this.handleKeyUp.bind(this);
	window.addEventListener("keyup",this.handleKeyUpFunc);
	this.handleMouseUpFunc =  this.handleMouseUp.bind(this);
	window.addEventListener("mouseup",this.handleMouseUpFunc);
	buttons = [];
	var buttonSizeX = 250
	buttons.push( new policeGame.Button(policeGame.canvas.width/2 - buttonSizeX/2, 300, buttonSizeX, 40, "Purple", {"text": "Resume Game", "font": "20px Arial"}) );
	buttons[0].callback = this.returnToGameButton.bind(this);
	for (var i = 0; i < buttons.length; i++) {
		this.container.addChild(buttons[i].container);
		//console.log(buttons[i].image.x, buttons[i].image.y);
	}
	this.stage = stage;
	this.stage.addChild(this.container);
	stage.update();
	this.callback = callback;
};

policeGame.PauseMenu.prototype.handleKeyUp = function(evt) {
	evt.preventDefault();
	var code = evt.keyCode;
	if (code === 27) {
		this.returnToGameESC();
	}
};

policeGame.PauseMenu.prototype.handleMouseUp = function(evt) {
	for (var i = 0; i < buttons.length; i++) {
		if (buttons[i].wasClicked(evt, [this.container.x, this.container.y])) {
			buttons[i].callback();
		}
	}
};

policeGame.PauseMenu.prototype.returnToGameESC = function(evt) {
	this.stage.removeChild(this.container);
	window.removeEventListener("keyup", this.handleKeyUpFunc);
	window.removeEventListener("mouseup", this.handleMouseUpFunc);
	//this.callback();
};

policeGame.PauseMenu.prototype.returnToGameButton = function(evt) {
	this.stage.removeChild(this.container);
	window.removeEventListener("keyup", this.handleKeyUpFunc);
	window.removeEventListener("mouseup", this.handleMouseUpFunc);
	this.callback();
};





policeGame.DeathMenu = function(stage, callback) {
	this.container = new createjs.Container();
	this.container.x = 0;
	this.container.y = 0;
	this.background = new createjs.Shape();
	var backgroundLims = [policeGame.canvas.width/5, policeGame.canvas.height/6, policeGame.canvas.width*3/5, policeGame.canvas.height*4/6];
	this.background.graphics.beginFill("#664444").drawRect(backgroundLims[0], backgroundLims[1], backgroundLims[2], backgroundLims[3]);
	this.border = new createjs.Shape();
	this.border.graphics.setStrokeStyle(4).beginStroke("#000000").drawRect(backgroundLims[0], backgroundLims[1], backgroundLims[2], backgroundLims[3]);
	this.container.addChild(this.background);
	this.container.addChild(this.border);
	var text = new createjs.Text("You've Died", "40px Arial", "#000000");
	var bounds = text.getBounds();
	text.x = policeGame.canvas.width/2 - bounds.width/2;
	text.y = 200;
	this.container.addChild(text);
	this.handleMouseUpFunc =  this.handleMouseUp.bind(this);
	window.addEventListener("mouseup",this.handleMouseUpFunc);
	buttons = [];
	var buttonSizeX = 250
	buttons.push( new policeGame.Button(policeGame.canvas.width/2 - buttonSizeX/2, 300, buttonSizeX, 40, "Purple", {"text": "Restart Game", "font": "20px Arial"}) );
	buttons[0].callback = this.restartGame.bind(this);
	for (var i = 0; i < buttons.length; i++) {
		this.container.addChild(buttons[i].container);
		//console.log(buttons[i].image.x, buttons[i].image.y);
	}
	this.stage = stage;
	this.stage.addChild(this.container);
	stage.update();
	this.callback = callback;
};

policeGame.DeathMenu.prototype.handleMouseUp = function(evt) {
	for (var i = 0; i < buttons.length; i++) {
		if (buttons[i].wasClicked(evt, [this.container.x, this.container.y])) {
			buttons[i].callback();
		}
	}
};

policeGame.DeathMenu.prototype.restartGame = function() {
	this.stage.removeChild(this.container);
	window.removeEventListener("mouseup", this.handleMouseUpFunc);
	this.callback();
};







policeGame.Button = function(x,y, sizeX, sizeY, colour, props) {
	this.container = new createjs.Container();
	this.container.x = x;
	this.container.y = y;
	this.image = new createjs.Shape();
	this.image.graphics.beginFill(colour).drawRect(0, 0, sizeX, sizeY);
	this.border = new createjs.Shape();
	this.border.graphics.setStrokeStyle(4).beginStroke("#000000").drawRect(0, 0, sizeX, sizeY);
	this.container.addChild(this.image);
	this.container.addChild(this.border);
	this.sizeX = sizeX;
	this.sizeY = sizeY;
	if (props["text"]) {
		if (props["font"]) {
			var text = new createjs.Text(props["text"], props["font"], "#000000");
		}
		else {
			var text = new createjs.Text(props["text"], "20px Arial", "#000000");
		}
		var bounds = text.getBounds();
		text.x = sizeX/2 - bounds.width/2;
		text.y = sizeY/2 - bounds.height/2;
		this.container.addChild(text);
	}
};

policeGame.Button.prototype.wasClicked = function(evt, relativePos) {
	var x = this.container.x - relativePos[0] ;
	var y = this.container.y - relativePos[1] ;
	var mousex = evt.clientX - $(policeGame.canvas).offset().left;
	var mousey = evt.clientY - $(policeGame.canvas).offset().top;
	//console.log(mousex, mousey, x, y);
 	if ( mousex > x && mousex < x + this.sizeX && mousey > y && mousey < y + this.sizeY) {
		return true
	} 
	return false
};


