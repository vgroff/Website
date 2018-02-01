// GUI Helpers

centralPlanningGame.addDomElement = function(elementType, width, height, id) {
	var html = document.createElement(elementType);
	if (id) {html.id = id;}
	//if (class !== null) {html.id = id;}
	//html.style.height = height+"px";
	html.style.width = width+"px";
	//html.style.backgroundColor = '#000000';
	var offset = $(centralPlanningGame.canvas).offset();
	html.style.position = "absolute";
	html.style.top = offset.top+"px";
	html.style.left = offset.left+"px";
	html.zIndex = 2;
	document.body.appendChild(html);
	var htmlEasel = new createjs.DOMElement(html);	
	return htmlEasel;
}

//~ centralPlanningGame.appendDomElement = function(parentElement, elementType, width, height, id) {
	//~ var html = document.createElement(elementType);
	//~ if (id !== null) {html.id = id;}
	//~ //if (class !== null) {html.id = id;}
	//~ html.style.height = height;
	//~ html.style.width = width;
	//~ //html.style.backgroundColor = '#000000';
	//~ var offset = $(centralPlanningGame.canvas).offset();
	//~ console.log(offset.top, offset.left);
	//~ html.style.position = "absolute";
	//~ html.style.top = offset.top+"px";
	//~ html.style.left = offset.left+"px";
	//~ html.zIndex = 2;
	//~ parentElement.appendChild(html);
	//~ var htmlEasel = new createjs.DOMElement(html);	
	//~ return htmlEasel;
//~ }

centralPlanningGame.buildAndAddContainer = function(container) {
	// Create the container for the area. x,y remain unchanged, we just change regX, regY to move it 
	var area = new createjs.Container();
	area.x = 0;
	area.y = 0;
	container.addChild(area);
	return area
};

// Callback for show/hide buttons
centralPlanningGame.buttonUnhide = function(div, button) { 
	if (div.hasClass("hidden")) {
		div.removeClass("hidden");
		button.html("Less Detail");
	}
	else {
		div.addClass("hidden");
		button.html("More Detail");
	}
}


// OBSELETE
centralPlanningGame.defaultProp = function(prop, props) {
	if (props[prop] === null) {
		return;
	}
	else {
		if (prop === "color") { props[prop] = "#664444"; return;}
		if (props["text"] !== null) {
			if (prop === "textColor") { props[prop] = "#000000"; return;}
			if (prop === "textFont") { props[prop] = "25px Arial"; return;}
		}
		if (props["title"] !== null) {
			if (prop === "titleColor") { props[prop] = "#000000"; return;}
			if (prop === "titleFont") { props[prop] = "35px Arial"; return;}			
		}
	}
};

// GUIS

centralPlanningGame.Gui = function(container, coord, size, draggable, props) {
	this.coord = coord;
	this.size  = size;
	this.parentContainer = container;
	//this.container = centralPlanningGame.buildAndAddContainer(container);
	this.div = centralPlanningGame.addDomElement("div", size[0], size[1]);
	this.divH = this.div.htmlElement;
	this.divJ = $(this.divH);
	this.div.x = coord[0];
	this.div.y = coord[1];
	//this.background = new createjs.Shape();	
	//~ var propsNeeded = ["color"];
	//~ for (var i=0; i<propsNeeded.length; i++) {
		//~ centralPlanningGame.defaultProp(propsNeeded[i], props);
	//~ }	
	this.props = props;
	let p = this.props;
	var standardCss = centralPlanningGame.settingsData.standardGuiCss;
	for (var prop in standardCss) {
		this.divJ.css(prop, standardCss[prop]);
	}
	this.parentContainer.addChild(this.div);
	//this.background.graphics.beginFill(p["color"]).drawRect(0,  0, size[0], size[1]);
	//this.container.addChild(this.background)
	//console.log(this);
	if (draggable) { this.divH.addEventListener("mousedown", this.startGuiDrag.bind(this, this.divH, this.div)); }
}

centralPlanningGame.Gui.prototype.startGuiDrag = function(el, domEl, e) {
	var offset = $(centralPlanningGame.canvas).offset();
	var mousePos = [e.clientX, e.clientY];
	var mouseOffset = [(mousePos[0] - offset.left) - domEl.x, (mousePos[1] - offset.top) - domEl.y];
	if (mouseOffset[0] < this.size[0]) { // -5 so that scrollbar can still be used if needed
		var guiDrag = function (e) {
			var mousePos = [e.clientX, e.clientY];
			domEl.y = (mousePos[1] - offset.top) - mouseOffset[1];
			domEl.x = (mousePos[0] - offset.left)  - mouseOffset[0];
		}
		window.addEventListener("mousemove", guiDrag);
		var endDrag = function(e) {
			window.removeEventListener("mousemove", guiDrag)
			window.removeEventListener("mouseup", endDrag);		
		}
		window.addEventListener("mouseup", endDrag);
	}
}


centralPlanningGame.ButtonGui = function(container, coord, size, callback, draggable, props) {
	centralPlanningGame.Gui.call(this, container, coord, size, draggable, props);
	let p = this.props;	
	this.button = document.createElement("button");
	this.button.innerHTML = props["text"];
	$(this.button).css({"margin":"auto", "display":"block"});
	this.divH.appendChild(this.button);
	this.button.addEventListener("click", callback);
}

centralPlanningGame.ButtonGui.prototype = Object.create(centralPlanningGame.Gui.prototype);
// correct the constructor pointer
centralPlanningGame.ButtonGui.prototype.constructor = centralPlanningGame.ButtonGui;


centralPlanningGame.DisplayGui = function(container, coord, size, callback, callbackRate, draggable, props) {
	centralPlanningGame.Gui.call(this, container, coord, size, draggable, props);
	//~ var propsNeeded = ["textColor", "textFont"];
	//~ for (var i=0; i<propsNeeded.length; i++) {
		//~ centralPlanningGame.defaultProp(propsNeeded[i], this.props);
	//~ }	
	let p = this.props;	
	if (p["text"] !== null) {
		this.text = document.createElement("p");
		this.text.innerHTML = p["text"];
		var textCss = p["textCss"];
		var standardCss = centralPlanningGame.settingsData.standardTextCss;
		for (var prop in standardCss) {
			$(this.text).css(prop, standardCss[prop]);
		}
		if (textCss) {
			for (var prop in textCss) {
				$(this.text).css(prop, textCss[prop]);
			}
		}
		this.divH.appendChild(this.text);
	}
	//this.background.addEventListener("click", function() {console.log("clicked container");});
};

// inherit 
centralPlanningGame.DisplayGui.prototype = Object.create(centralPlanningGame.Gui.prototype);
// correct the constructor pointer
centralPlanningGame.DisplayGui.prototype.constructor = centralPlanningGame.DisplayGui;

centralPlanningGame.DisplayGui.prototype.updateText = function(text) {
	this.text.innerHTML = text;
}

//~ centralPlanningGame.displayGui.prototype.updateProp = function(prop, value) {
	//~ this.props[prop] = value;
	//~ this.container.removeAllChildren();
	
	//~ let p = this.props;

//~ }

centralPlanningGame.TitleTextGui = function(container, coord, size, callback, callbackRate, draggable, props) {
	centralPlanningGame.Gui.call(this, container, coord, size, draggable, props);
	this.divJ.css(centralPlanningGame.settingsData.standardGuiCss);
	var propsNeeded = ["textColor", "textFont", "titleFont", "titleColor"];
	for (var i=0; i<propsNeeded.length; i++) {
		centralPlanningGame.defaultProp(propsNeeded[i], this.props);
	}	
	let p = this.props;	
	if (p["title"] !== null) {
		this.title = document.createElement("p");
		this.title.innerHTML = p["title"];
		var textCss = p["titleCss"];
		var standardCss = centralPlanningGame.settingsData.standardTitleCss;
		for (var prop in standardCss) {
			$(this.title).css(prop, standardCss[prop]);
		}
		if (textCss) {
			for (var prop in textCss) {
				$(this.title).css(prop, textCss[prop]);
			}
		}
		this.divH.appendChild(this.title);
	}
	if (p["text"] !== null) {
		this.text = document.createElement("p");
		this.text.innerHTML = p["text"];
		var textCss = p["textCss"];
		var standardCss = centralPlanningGame.settingsData.standardTextCss;
		for (var prop in standardCss) {
			$(this.text).css(prop, standardCss[prop]);
		}
		$(this.text).css("text-align", "left");
		if (textCss) {
			for (var prop in textCss) {
				$(this.text).css(prop, textCss[prop]);
			}
		}
		this.divH.appendChild(this.text);
	}
	if (!p["button"]) {
		this.closeButton = document.createElement("button");
		this.closeButton.innerHTML = "Close"
		$(this.closeButton).css({"margin":"auto", "display":"block"});
		this.divH.appendChild(this.closeButton);
		this.closeButton.addEventListener("click", function() {this.parentContainer.removeChild(this.container);this.divH.parentNode.removeChild(this.divH);}.bind(this));
	}
}

//~ centralPlanningGame.titleTextGui.prototype.updateProp = function(prop, value) {
//~ }


// inherit 
centralPlanningGame.TitleTextGui.prototype = Object.create(centralPlanningGame.Gui.prototype);
// correct the constructor pointer
centralPlanningGame.TitleTextGui.prototype.constructor = centralPlanningGame.TitleTextGui;

centralPlanningGame.TitleTextGui.prototype.updateText = function(text) {
	this.text.innerHTML = text;
}
