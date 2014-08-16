var

appVersion = 1.2,

// Game vars //

canvas,
ctx,
width,
height,

scrollTextPos = 0,
fgpos = 0,
frames = 0,
score = 0,
pipeGapMin = 90,
pipeGapMax = 150,
pipeGap = pipeGapMax,
//pipeGap = pipeGapMax,
best = localStorage.getItem("best") || 0,

// State vars //

currentstate,
states = {
	Splash: 0, Game: 1, Score: 2
},

// Game objects //

/**
 * Ok button initiated in main()
 */
okbtn,

/**
 * The bird
 */
bird = {

	x: 60,
	y: 0,

	frame: 0,
	velocity: 0,
	animation: [0, 1, 2, 1], // animation sequence

	rotation: 0,
	radius: 12,

	gravity: 0.25,
	_jump: 4.6,

	/**
	 * Makes the bird "flap" and jump
	 */
	jump: function() {
		this.velocity = -this._jump;
	},

	/**
	 * Update sprite animation and position of bird
	 */
	update: function() {
		// make sure animation updates and plays faster in gamestate
		var n = currentstate === states.Splash ? 10 : 5;
		this.frame += frames % n === 0 ? 1 : 0;
		this.frame %= this.animation.length;

		// in splash state make bird hover up and down and set
		// rotation to zero
		if (currentstate === states.Splash) {

			this.y = height - 280 + 5*Math.cos(frames/10);
			this.rotation = 0;

		} else { // game and score state //

			this.velocity += this.gravity;
			this.y += this.velocity;

			// change to the score state when bird touches the ground
			if (this.y >= height - s_fg.height-10) {
				this.y = height - s_fg.height-10;
				if (currentstate === states.Game) {
					currentstate = states.Score;
				}
				// sets velocity to jump speed for correct rotation
				this.velocity = this._jump;
			}

			// when bird lack upward momentum increment the rotation
			// angle
			if (this.velocity >= this._jump) {

				this.frame = 1;
				this.rotation = Math.min(Math.PI/2, this.rotation + 0.3);

			} else {

				this.rotation = -0.3;

			}
		}
	},

	/**
	 * Draws bird with rotation to canvas ctx
	 *
	 * @param  {CanvasRenderingContext2D} ctx the context used for
	 *                                        drawing
	 */
	draw: function(ctx) {
		ctx.save();
		// translate and rotate ctx coordinatesystem
		ctx.translate(this.x, this.y);
		ctx.rotate(this.rotation);

		var n = this.animation[this.frame];
		// draws the bird with center in origo
		s_bird[n].draw(ctx, -s_bird[n].width/2, -s_bird[n].height/2);

		ctx.restore();
	}
},

/**
 * The pipes
 */
pipes = {

	_pipes: [],
	// padding: 80, // TODO: Implement paddle variable

	/**
	 * Empty pipes array
	 */
	reset: function() {
		this._pipes = [];
		pipeGap = pipeGapMax;
	},

	/**
	 * Create, push and update all pipes in pipe array
	 */
	update: function() {
		// add new pipe each 100 frames
		if (frames % 100 === 0) {

			// calculate y position
			var _y = height - (s_pipeSouth.height+s_fg.height+120+200*Math.random());
			// create and push pipe to array



			if (pipeGap > pipeGapMin) {
				pipeGap = pipeGap -5;
			}

			//console.log('creating pipe at frame: ' + frames + ' and pipgap: ' + pipeGap);
			//pipeGap = pipeGap - (frames/100);

			this._pipes.push({
				gap: pipeGap,
				x: 500,
				y: _y,
				width: s_pipeSouth.width,
				height: s_pipeSouth.height
			});
		}
		for (var i = 0, len = this._pipes.length; i < len; i++) {
			var p = this._pipes[i];

			if (i === 0) {
				//detect if bird is off screen and hits pipe
				if ((p.x == bird.x) && (bird.y < 30) ){
					currentstate = states.Score;
					score--;
				}

				score += p.x === bird.x ? 1 : 0;

				// collision check, calculates x/y difference and
				// use normal vector length calculation to determine
				// intersection
				if (frames % 100 === 0) {
					//pipeGap = pipeGap - 5;
					debugLog(pipeGap);
				}

				var cx  = Math.min(Math.max(bird.x, p.x), p.x+p.width);
				var cy1 = Math.min(Math.max(bird.y, p.y), p.y+p.height);
				var cy2 = Math.min(Math.max(bird.y, p.y+p.height+p.gap), p.y+2*p.height+p.gap);
				// closest difference
				var dx  = bird.x - cx;
				var dy1 = bird.y - cy1;
				var dy2 = bird.y - cy2;
				// vector length
				var d1 = dx*dx + dy1*dy1;
				var d2 = dx*dx + dy2*dy2;
				var r = bird.radius*bird.radius;
				// determine intersection
				if (r > d1 || r > d2) {
					currentstate = states.Score;
				}
			}
			// move pipe and remove if outside of canvas
			p.x -= 2;
			if (p.x < -p.width) {
				this._pipes.splice(i, 1);
				i--;
				len--;
			}
		}
	},

	/**
	 * Draw all pipes to canvas context.
	 *
	 * @param  {CanvasRenderingContext2D} ctx the context used for
	 *                                        drawing
	 */
	draw: function(ctx) {
		for (var i = 0, len = this._pipes.length; i < len; i++) {
			var p = this._pipes[i];
			s_pipeSouth.draw(ctx, p.x, p.y);
			s_pipeNorth.draw(ctx, p.x, p.y+p.gap+p.height);
			//console.log(p)
		}
	}
},

backgroundFx = {
	setBGColour: function(hour) {
			switch (hour) {
				case 22:
				case 23:
				case 0:
				case 1:
				case 2:
				case 3:
					ctx.fillStyle = "#000";
					break;
				case 4:
				case 5:
				case 6:
				case 19:
				case 20:
				case 21:
					ctx.fillStyle = "#990099";
					break;
				default:
					ctx.fillStyle = "#70C5CF";
					break;
			}
	},
	setBGGradient: function(hour) {
		  //ctx.rect(0, 0, canvas.width, canvas.height);
      // add linear gradient
      var grd = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);

			switch (hour) {
				case 0:
grd.addColorStop(0, '#000000');
grd.addColorStop(1, '#303030');
					break;
				case 1:
grd.addColorStop(0, '#303030');// light blue
grd.addColorStop(1, '#003366');  // purple
					break;
				case 2:
grd.addColorStop(0, '#003366');// light blue
grd.addColorStop(1, '#006699');  // purple
					break;
				case 3:
					grd.addColorStop(0, '#006699');// light blue
					grd.addColorStop(1, '#663300');  // purple
					break;
				case 4:
grd.addColorStop(0, '#663300');// light blue
grd.addColorStop(1, '#FF9900');  // purple
					break;
				case 5:
grd.addColorStop(0, '#FF9900');// light blue
grd.addColorStop(1, '#FF9933');  // purple
					break;
				case 6:
grd.addColorStop(0, '#FF9933');// light blue
grd.addColorStop(1, '#FFFF99');  // purple
break;
case 7:
grd.addColorStop(0, '#FFFF99');// light blue
grd.addColorStop(1, '#70C5CF');  // purple
	break;
case 8:
case 9:
case 10:
case 11:
case 12:
case 13:
case 14:
case 15:
case 16:
grd.addColorStop(0, '#70C5CF');
grd.addColorStop(1, '#8ED6FF');
	break;
case 17:
grd.addColorStop(0, '#8ED6FF');// light blue
grd.addColorStop(1, '#99CCFF');  // purple
	break;
case 18:
					grd.addColorStop(0, '#99CCFF');
					grd.addColorStop(1, '#9999FF');
					break;
				case 19:
					grd.addColorStop(0, '#9999FF');
					grd.addColorStop(1, '#9966FF');
					break;
				case 20:
					grd.addColorStop(0, '#9966FF');
					grd.addColorStop(1, '#9933FF');
					break;
				case 21:
					grd.addColorStop(0, '#9933FF');
					grd.addColorStop(1, '#3333CC');
					break;

				case 22:
					grd.addColorStop(0, '#3333CC');
					grd.addColorStop(1, '#000066');
					break;
				case 23:
					grd.addColorStop(0, '#000066');
					grd.addColorStop(1, '#000000');
					break;
				default:
					grd.addColorStop(0, '#8ED6FF');  // light blue
					grd.addColorStop(1, '#004CB3'); // dark blue
					break;
			}

      ctx.fillStyle = grd;
      ctx.fill();
	},
	update: function() {
		if (frames % 100 === 0) {
			var date = new Date;
			//var seconds = date.getSeconds();
			//var minutes = date.getMinutes();
			//var hour = Math.ceil(date.getSeconds()/2.5);  //for debug
			var hour = date.getHours();
			//console.log(hour)
			//this.setBGColour(hour);
			this.setBGGradient(hour);
		}
	}
};

/**
 * Called on mouse or touch press. Update and change state
 * depending on current game state.
 *
 * @param  {MouseEvent/TouchEvent} evt tho on press event
 */
function onpress(evt) {
//console.log(evt)
//document.getElementById("consoleMe").innerHTML = evt.type;
	switch (currentstate) {

		// change state and update bird velocity
		case states.Splash:
			currentstate = states.Game;
			bird.jump();
			break;

		// update bird velocity
		case states.Game:
			bird.jump();
			break;

		// change state if event within okbtn bounding box
		case states.Score:

			// get event position
// 			var mx = evt.offsetX, my = evt.offsetY;

// 			if (mx == null || my == null) {
// 				mx = evt.touches[0].clientX;
// 				my = evt.touches[0].clientY;
// 			}
// 			// check if within
// 			if (okbtn.x < mx && mx < okbtn.x + okbtn.width &&
// 				okbtn.y < my && my < okbtn.y + okbtn.height
// 			) {

				pipes.reset();
				currentstate = states.Splash;
				score = 0;
			//}

			break;

	}
	evt.preventDefault();
}

/**
 * Starts and initiate the game
 */
function main() {
	// create canvas and set width/height
	canvas = document.createElement("canvas");

	width = window.innerWidth;
	height = window.innerHeight;

	var evt = "touchStart";
	if (width >= 500) {
		width  = 320;
		height = 480;
		canvas.style.border = "1px solid #000";
		evt = "mousedown";
	}

	// listen for input event
	document.addEventListener(evt, onpress);
	document.addEventListener("touchstart", onpress)

	canvas.width = width;
	canvas.height = height;
	scrollTextPos = width*1.5;
	if (!(!!canvas.getContext && canvas.getContext("2d"))) {
		alert("Your browser doesn't support HTML5, please update to latest version");
	}
	ctx = canvas.getContext("2d");

	currentstate = states.Splash;
	// append canvas to document
	document.body.appendChild(canvas);

	// initate graphics and okbtn
	var img = new Image();
	img.onload = function() {
		initSprites(this);

		backgroundFx.update();

		okbtn = {
			x: (width - s_buttons.Ok.width)/2,
			y: height - 200,
			width: s_buttons.Ok.width,
			height: s_buttons.Ok.height
		}

		run();
	}
	img.src = "./res/sheet.png";
}

function debugLog(txt) {
	if(window.location.hash) {
		document.getElementById("consoleMe").innerHTML = txt;
	}
}

/**
 * Starts and update gameloop
 */
function run() {
	var loop = function() {
		update();
		render();
		window.requestAnimationFrame(loop, canvas);
	}
	window.requestAnimationFrame(loop, canvas);
}

/**
 * Update foreground, bird and pipes position
 */
function update() {
	frames++;

	if (currentstate !== states.Score) {
		fgpos = (fgpos - 2) % 14;
	} else {
		// set best score to maximum score
		best = Math.max(best, score);
		localStorage.setItem("best", best);
		scrollTextPos = width*1.5;
	}
	if (currentstate === states.Game) {
		pipes.update();
	}

	bird.update();
	backgroundFx.update();
}

/**
 * Draws bird and all pipes and assets to the canvas
 */
function render() {
	// draw background color
	ctx.fillRect(0, 0, width, height);
	// draw background sprites
	s_bg.draw(ctx, 0, height - s_bg.height);
	s_bg.draw(ctx, s_bg.width, height - s_bg.height);

	pipes.draw(ctx);
	bird.draw(ctx);

	// draw foreground sprites
	s_fg.draw(ctx, fgpos, height - s_fg.height);
	s_fg.draw(ctx, fgpos+s_fg.width, height - s_fg.height);

	var width2 = width/2; // center of canvas

	if (currentstate === states.Splash) {
		// draw splash text and sprite to canvas
		s_splash.draw(ctx, width2 - s_splash.width/2, height - 300);
		s_text.GetReady.draw(ctx, width2 - s_text.GetReady.width/2, height-380);

		if (scrollTextPos < (0-s_text.FlappyBird.width-width)) {
			scrollTextPos = width*1.5;
		}

		scrollTextPos = scrollTextPos -3;
		s_text.FlappyBird.draw(ctx, scrollTextPos, s_fg.height+300);
	}
	if (currentstate === states.Score) {
		// draw gameover text and score board
		s_text.GameOver.draw(ctx, width2 - s_text.GameOver.width/2, height-400);
		s_score.draw(ctx, width2 - s_score.width/2, height-340);
		s_buttons.Ok.draw(ctx, okbtn.x, okbtn.y);
		// draw score and best inside the score board
		s_numberS.draw(ctx, width2-47, height-304, score, null, 10);
		s_numberS.draw(ctx, width2-47, height-262, best, null, 10);

	} else {
		// draw score to top of canvas
		s_numberB.draw(ctx, null, 20, score, width2);
	}
}

// start and run the game
window.onload = function () {
	main();
};
