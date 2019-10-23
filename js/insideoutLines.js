'use strict';

function getRandomInt(x, y) {
	return Math.floor(Math.random() * (y - x)) + x;
}

function sign(x) {
	if (x > 0) return 1;else if (x < 0) return -1;else return 0;
}

function windowScrollY() {
	return document.body.scrollTop || document.documentElement.scrollTop;
}


function insideout() {
	var insideoutLines = document.getElementById('insideout-lines');

	var canvasWidth;
	var canvasHeight;
	var x0;
	var y0;

	var c;

	var t;

	var mouse;
	var mouseX;
	var mouseY;
	var totalSpinFactor;
	var currentSpin;

	var numberOfLines = void 0;
	
	var numberOfLinesInput = document.getElementById('number-of-lines');

	var changeFunctionParametersBtn = document.getElementById('change-function-parameters');

	function changeBtnClick() {
		console.log('changeFunctionParametersBtn clicked');
		numberOfLines = numberOfLinesInput.value > 500 ? 500 : numberOfLinesInput.value;
		console.log(numberOfLines);
		initGlobalVariables();
	}

	function changeFunctionParameters() {

		window.addEventListener('keyup', function (e) {
			if (e.key == 'Enter') {
				console.log(e.key);
				changeBtnClick();
			}
		});
		
		changeFunctionParametersBtn.addEventListener('click', changeBtnClick);
	}

	function initInputs() {
		
		numberOfLinesInput.value = numberOfLines;
		// console.log('numberOfLinesInput.setAttribute: ' + numberOfLines);
		numberOfLinesInput.focus();
	}

	function setNumberOfLinesByWidth() {
		
		numberOfLines = Math.floor((window.innerWidth - 300) * 0.35) + 100;
		// console.log('n of lines: ' + numberOfLines);
	}

	function initGlobalVariables() {
		insideoutLines.width = insideoutLines.parentElement.clientWidth;
		insideoutLines.height = insideoutLines.parentElement.clientHeight;

		canvasWidth = insideoutLines.width;
		canvasHeight = insideoutLines.height;
		x0 = canvasWidth / 2;
		y0 = canvasHeight / 2;

		c = insideoutLines.getContext('2d');

		t = 0;

		mouse = { angle1: 0, angle2: 0, angleChange: 0, spinFactor: 0 };
		mouseX = [];
		mouseY = [];
		totalSpinFactor = 0;
		currentSpin = 0;
	}

	initGlobalVariables();
	setNumberOfLinesByWidth();
	initInputs();
	changeFunctionParameters();

	function getAngleOfXYFromTheCenter(x, y, x0, y0) {
		var dx = x - x0;
		var dy = y - y0;
		if (dx > 0) return Math.atan(dy / dx);else return Math.PI + Math.atan(dy / dx);
	}

	var spinSpeed = 1;
	function calculateTotalSpinFactor(event) {
		if (event.touches == undefined) {
			mouseX.push(event.clientX);
			mouseY.push(event.clientY);
		} else {
			mouseX.push(event.touches[0].clientX);
			mouseY.push(event.touches[0].clientY);
			spinSpeed = 2;
		}
		if (mouseX.length > 1) {
			mouse.angle1 = getAngleOfXYFromTheCenter(mouseX[0], mouseY[0], x0, y0);
			mouse.angle2 = getAngleOfXYFromTheCenter(mouseX[1], mouseY[1], x0, y0);

			mouse.angleChange = mouse.angle2 - mouse.angle1;
			mouse.spinFactor = Math.sin(mouse.angleChange);
			if (Math.abs(mouse.spinFactor) > 0.01) mouse.spinFactor = 0.01 * sign(mouse.spinFactor);

			mouseX = [];
			mouseY = [];

			totalSpinFactor += mouse.spinFactor * 0.01 * spinSpeed;
		}
	}

	addEventListener('mousemove', function (event) {
		if (windowScrollY() == 0) {
			calculateTotalSpinFactor(event);
		}
	});

	// for screens:
	function detectSwipe(evt) {
		evt = evt || window.event;
		if ("buttons" in evt) {
			return evt.buttons == 0;
		}
		var button = evt.which;
		return button == 0;
	}
	window.addEventListener('touchmove', function (e) {
		if (windowScrollY() < window.innerHeight / 2 && window.innerWidth < 768) {
			if (detectSwipe(e)) {
				calculateTotalSpinFactor(e);
			}
		}
	});

	function Line(x, y, radius) {
		this.x = x;
		this.y = y;
		this.t = 0;

		this.radius = radius;
		this.startAngle = getAngleOfXYFromTheCenter(x, y, x0, y0);

		this.rndx = Math.random();
		this.rndy = Math.random();

		var colors = ['#D5FBFF', '#9FBCBF', '#647678', '#59D8E5'];
		this.ballColor = colors[getRandomInt(0, colors.length)];

		var r = Math.pow(Math.pow(x - x0, 2) + Math.pow(y - y0, 2), .5);
		var dx = .05 * x / r;
		var dy = .05 * y / r;
		this.dx = dx;
		this.dy = dy;
		this.dxdyPower = 1;

		this.lastXYwasSet = false;
		this.spinFactor = 0;

		this.draw = function () {
			c.beginPath();
			c.moveTo(this.lastX, this.lastY);
			c.lineTo(this.x, this.y);
			c.lineWidth = this.radius * 2;
			c.fillStyle = this.ballColor;
			c.strokeStyle = this.ballColor;
			c.stroke();
		};

		this.setLastXYifNotSet = function () {
			if (!this.lastXYwasSet) {
				this.lastX = this.x;
				this.lastY = this.y;
				this.lastXYwasSet = true;
			}
		};

		this.update = function () {
			this.setLastXYifNotSet();

			if (this.x > canvasWidth - radius || this.x < radius || this.y > canvasHeight - radius || this.y < radius) {
				this.lastX = x;
				this.lastY = y;
				this.x = x;
				this.y = y;
				this.t = 0;
				this.radius = radius;
				this.dx = dx;
				this.dy = dy;
				this.dxdyPower = 1;
			}
			this.x += this.dx;
			this.y += this.dy;
			this.t += 1;
			this.dx *= 1.03;
			this.dy *= 1.03;
			this.dxdyPower *= 1.03;
			this.radius *= 1.01;
		};

		this.rotateAroundTheCenter = function (t) {
			this.setLastXYifNotSet();

			this.spinFactor = currentSpin;

			var x0y0distance = Math.pow(Math.pow(this.x - x0, 2) + Math.pow(this.y - y0, 2), 0.5);

			dx = .05 * (this.x - x0) / x0y0distance * this.dxdyPower;
			dy = .05 * (this.y - y0) / x0y0distance * this.dxdyPower;
			this.dx = dx;
			this.dy = dy;

			this.x = x0y0distance * Math.cos(this.t * this.spinFactor + this.startAngle) + x0;
			this.y = x0y0distance * Math.sin(this.t * this.spinFactor + this.startAngle) + y0;
		};
	}

	var lines = [];

	var paused = false;

	var bckgr = {};

	bckgr.r = 12;
	bckgr.g = 16;
	bckgr.b = 16;

	function animation() {
		if (paused) return;

		requestAnimationFrame(animation);

		if (t == 0) lines = [];

		if (t < numberOfLines) {
			var radius = .2 + Math.random() * .2;
			var x = Math.random() * x0 * 2;
			var y = Math.random() * y0 * 2;
			lines.push(new Line(x, y, radius));
		}

		c.fillStyle = 'rgba(' + bckgr.r + ',' + bckgr.g + ',' + bckgr.b + ',.5)';
		c.fillRect(0, 0, canvasWidth, canvasHeight);

		totalSpinFactor -= sign(totalSpinFactor) * 0.00001;
		totalSpinFactor *= 0.995;
		currentSpin += (totalSpinFactor - currentSpin) * 0.05;

		for (var i = lines.length - 1; i >= 0; i--) {
			lines[i].rotateAroundTheCenter(t);
			lines[i].update();
			lines[i].draw();
			lines[i].lastXYwasSet = false;
		}

		t++;

		if (t == Infinity) t = 0;
	}

	var animationWorking = void 0;
	var animationWasWorking = void 0;

	function startStopAnimation() {
		if (document.body.scrollTop > insideoutLines.height || document.documentElement.scrollTop > insideoutLines.height) {
			animationWorking = false;
			if (animationWorking !== animationWasWorking) {
				paused = true;
				animationWasWorking = animationWorking;
			}
		} else {
			animationWorking = true;
			if (animationWorking !== animationWasWorking) {
				paused = false;
				animation();
				animationWasWorking = animationWorking;
			}
		}
	}

	startStopAnimation();

	document.addEventListener('scroll', function () {
		startStopAnimation();
	});

	var lastWindowWidth = window.innerWidth;
	window.addEventListener('resize', function () {
		if (lastWindowWidth != window.innerWidth) {
			initGlobalVariables();
			setNumberOfLinesByWidth();
			initInputs();
			lastWindowWidth = window.innerWidth;
		}
	});
}

insideout();