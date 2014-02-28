(function animator () {

	'use strict';

	if(!window.isSinglePageApp) {
		return;
	}

	var $items = {},
		timeouts = {},
		rafs = {};

	function step(name, time, number) {
		var nextNum = (number + 1) % $items[name].length;
		$items[name].css('opacity', '0.01');
		$items[name].eq(number).css('opacity', '0.99');
		if(time){
			return timeouts[name] = window.setTimeout(window.requestAnimationFrame.bind(null, step.bind(null, name, time, nextNum)), time);
		}
		rafs[name] = window.requestAnimationFrame(step.bind(null, name, time, nextNum));
	}

	window.animateIcon = function(name, time) {
		window.clearAnimateIcon(name);
		time = time || 200;
		if(time > 16) {
			time = time - 16;
		} else {
			time = 0;
		}
		rafs[name] = window.requestAnimationFrame(step.bind(null, name, time, 0));
	};

	window.clearAnimateIcon = function(name, dontHide) {
		if(!dontHide) {
			$items[name].css('opacity', '0.01');
		}
		if(timeouts[name]) {
			window.clearTimeout(timeouts[name]);
		}
		if(rafs[name]){
			window.cancelAnimationFrame(rafs[name]);
		}
	};

	window.prepareAnimatedIcon = function(name, $parent, numSteps, initialPosX, initialPosY, stepX, stepY) {
		var $child,
			children = [];
		while(numSteps--) {
			$parent.prepend($child = $('<span class="' + name + ' ' + name + '-' + numSteps + '"/>').css({
				'background-position': ((numSteps * stepX) + initialPosX) + 'px ' + ((numSteps * stepY) + initialPosY) + 'px'
			}));
			children.push($child);
		}

		$items[name] = $(children).map (function () {return this.toArray(); } );
	};
}());