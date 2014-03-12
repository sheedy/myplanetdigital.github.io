(function elevator () {
	'use strict';

	if (! window.isSinglePageApp) {
		return;
	}
	var $viewport = $('#viewport'),
		isElevating = false;

	$(window).on('scroll-top', function() {
		window.requestAnimationFrame(function() {
			$viewport.css({
				transform: 'translateZ(0)'
			});
			window.requestAnimationFrame(function () {
				var delta = window.pageYOffset;
				if (delta) {
					$viewport.css({
						transform: 'translate3d(0, ' + delta + 'px, 0)',
						transition: 'transform 0.8s'
					});
					isElevating = true;
				}
			});
		});
	});

	$viewport.on('transitionend webkitTransitionEnd', function(e) {
		if (!isElevating || e.target !== $viewport[0]) {
			return;
		}
		isElevating = false;

		window.requestAnimationFrame(function () {
			$viewport.css({
				transform: 'translateZ(0)',
				transition: 'none'
			});

			window.scroll(0, window.curScrollTop = 0);
			window.setTimeout(function () {
				window.requestAnimationFrame(function () {
					$viewport.css({
						transform: '',
						transition: ''
					});
				});
			}, 0);
		});
	});

}());