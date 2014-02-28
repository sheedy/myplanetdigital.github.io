(function main () {

	'use strict';

	if(!window.isSinglePageApp) {
		return;
	}

	var $window = $(window),
		$body = $('body'),
		scrollTimeout,
		FULL_WIDTH = 1324,
		DESKTOP_WIDTH = 1174,
		END_SCROLL_THRESHOLD = 215;


	function setResponsiveState() {
		var width = $window.width(),
			old,
			state = width >= FULL_WIDTH ? 'full' : (width >= DESKTOP_WIDTH ? 'desktop' : 'mobile');
		window.pageHeight = $window.height();
		if(window.responsiveState === state) {
			return;
		}

		old = window.responsiveState;
		window.responsiveState = state;

		$window.trigger('responsiveStateChange', [{
			newState: state,
			oldState: old
		}]);
	}

	function finishStartScrolling() {
		window.isScrolling = true;
		$body.addClass('scrolling');
	}

	function startScrolling() {
		//window.requestAnimationFrame(finishStartScrolling);
		finishStartScrolling();
	}

	function finishEndScrolling() {
		window.isScrolling = false;
		$body.removeClass('scrolling');
	}

	function endScrolling() {
		window.requestAnimationFrame(finishEndScrolling);
		scrollTimeout = null;
		$window.trigger('after-scrolling');
	}

	setResponsiveState();
	$window.smartresize(setResponsiveState);

	$window.trigger('deviceCapabilities', [{
		desktopCapable: window.desktopCapable = Math.max(screen.width, screen.height) >= DESKTOP_WIDTH,
		hasTouchEvents: window.hasTouchEvents = 'ontouchstart' in window,
		isIOS: !!navigator.userAgent.match(/(iPad|iPhone|iPod)/g),
		top: window.pageYOffset,
		bottom: window.pageYOffset + window.pageHeight
	}]);

	if(window.desktopCapable) {
		$body.addClass('desktop-capable');
	}

	$window.on('scroll', function() {
		var top = window.pageYOffset;
		if(!window.isScrolling) {
			startScrolling();
		}

		$window.trigger('pageScroll', [{
			top: top,
			bottom: top + window.pageHeight
		}]);

		if(scrollTimeout) {
			window.clearTimeout(scrollTimeout);
		}
		scrollTimeout = window.setTimeout(endScrolling, END_SCROLL_THRESHOLD);
	});

	window.isScrolling = false;



	window.tiles = new Isotope( '.main-wrap', {
	  itemSelector: '.tile',
	  masonry: {
	    columnWidth: '.grid-size'
	  }
	});
	if('ontouchstart' in window) {
		var els = document.querySelectorAll('.tile'),
			len = els.length;
		while(len--) {
			els[len].style.opacity = 1;
		}
	}
}());