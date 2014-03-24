(function elevator () {
	'use strict';

	if (!window.isSinglePageApp) {
		return;
	}
	var $window = $(window),
		$body = $('body'),
		$viewport = $('#viewport'),
		MOBILE_MENU_WIDTH = '-249px',
		curOffset;

	function getNormalizedScrollBy(delta) {
		var offset = window.pageYOffset,
			maxDelta = document.body.scrollHeight - window.pageHeight - offset,
			minDelta = -offset;
		return Math.max(minDelta, Math.min(delta, maxDelta));
	}

	$window.on('scroll-top', function() {
		window.requestAnimationFrame(function() {
			if(window.isBusy) {
				return;
			}
			var delta = window.pageYOffset,
				isMobileMenuOpen = window.responsiveState === 'mobile' && window.mobileMenuIsOpen;
			if(!delta) {
				return $window.trigger('elevator-done');
			}
			curOffset = 0;
			$viewport.css({
				transform: 'translate3d(' + (isMobileMenuOpen ? MOBILE_MENU_WIDTH : '0') + '0,0)'
			});
			window.setTimeout(window.requestAnimationFrame.bind(null, function () {
				$body.addClass('animating');
				$viewport.css({
					transform: 'translate3d(' + (isMobileMenuOpen ? MOBILE_MENU_WIDTH : '0') + ',' + delta + 'px, 0)',
					transition: 'transform ' + (isMobileMenuOpen ? '0.6s' : '0.825s')
				});
				window.isElevating = true;
			}), 0);
		});
	});

	$window.on('scroll-to', function(e, newTop) {
		window.requestAnimationFrame(function () {
			if(window.isBusy) {
				return;
			}
			var delta = getNormalizedScrollBy(newTop),
				isMobileMenuOpen = window.responsiveState === 'mobile' && window.mobileMenuIsOpen;
			if (!delta) {
				return $window.trigger('elevator-done');
			}
			curOffset =  window.pageYOffset + delta;
			$viewport.css({
				transform: 'translate3d(' + (isMobileMenuOpen ? MOBILE_MENU_WIDTH : '0') + '0,0)'
			});
			window.setTimeout(window.requestAnimationFrame.bind(null, function () {
				$body.addClass('animating');
				$viewport.css({
					transform: 'translate3d(' + (isMobileMenuOpen ? MOBILE_MENU_WIDTH : '0') +  ',' + -delta + 'px, 0)',
					transition: 'transform ' + (isMobileMenuOpen ? '0.6s' : '0.825s')
				});
				window.isElevating = true;
			}), 0);
		});
	});

	function finishTransitionEnd () {
		$viewport.css({
			transform: '',
			transition: ''
		});
		$body.removeClass('animating');
		$window.trigger('elevator-done');
		window.isElevating = false;
	}

	$viewport.on('transitionend webkitTransitionEnd', function(e) {
		if (!window.isElevating || e.target !== $viewport[0]) {
			return;
		}
		var isMobileMenuOpen = window.responsiveState === 'mobile' && window.mobileMenuIsOpen;

		window.setTimeout(window.requestAnimationFrame.bind(null, function() {
			$viewport.css({
				transform: 'translate3d(' + (isMobileMenuOpen ? MOBILE_MENU_WIDTH : '0') + ',0,0)',
				transition: 'none'
			});
			if (!window.isIOS) {
				window.scroll(0, window.curScrollTop = curOffset);
			}
			window.setTimeout(function() {
				if (!window.isIOS) {
					return finishTransitionEnd();
				}
				window.scroll(0, window.curScrollTop = curOffset);
				window.setTimeout(window.requestAnimationFrame.bind(null,finishTransitionEnd), 0);
			}, 0);
		}), 0);
	});

}());