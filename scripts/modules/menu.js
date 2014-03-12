(function menu () {

	'use strict';

	if (! window.isSinglePageApp) {
		return;
	}

	var $window = $(window),
		$body = $('body'),
		$wrap = $('#wrap'),
		$menu = $('#menu'),
		$viewport = $('#viewport'),
		$indicator = $('<span data-role="menu-indicator" />'),
		$active = $menu.find('.active'),
		$mainWrap = $('.main-wrap'),
		curScrollTop,
		curMouseTop,
		lastMouseMove = new Date(),
		mobileMenuIsOpen = false,
		mobileMenuIsTransitioning = false,
		indicatorOffset,
		desktopMenuState,
		desktopMenuOffset = 0,
		mobileMenuYOffset = 0,
		mouseMoveDelta = 0,
		scrollDelta = 0,
		pageHasLoaded = false,
		desktopMenuRafTimeout,
		isWebkitMobileNotIOS,
		HEADER_HEIGHT = 127,
		MENU_WIDTH = 250,
		SCROLL_UP_THRESHOLD = 20,
		MOUSE_MOVE_THRESHOLD = 50,
		DESKTOP_MENU_BREAKPOINT =  17, //parseInt($viewport.css('padding-top').replace(/px/,''), 10) - $menu.outerHeight(true),
		MOUSE_MOVE_THROTTLE_THRESHOLD = 25;

	function setIndicator(item, transition) {
		if(item) {
			indicatorOffset = item.offsetLeft - (window.responsiveState === 'full' ? $wrap[0].offsetLeft + $mainWrap[0].offsetLeft : 0);
		}
		$indicator.css({
			transform: 'translate3d(' + indicatorOffset + 'px, ' + desktopMenuOffset + 'px, 0)',
			transition: transition || ''
		});
	}

	//active an item in the menu
	function activateLink (item) {
		window.requestAnimationFrame(function () {
			var $item = $(item);
			if(window.responsiveState !== 'mobile') {
				setIndicator(item);
			} else if(mobileMenuIsOpen) {
				$body.removeClass('menu');
				mobileMenuIsOpen = false;
			}
			$active.removeClass('active');
			$active = $item.addClass('active');
			$menu.attr('data-active', $item.text());
		});
	}

	function onPageLoad() {
		//let the page load scroll event fire
		window.setTimeout(function() {
			pageHasLoaded = true;
		}, 750);
	}

	//setup the menu for desktop view
	function initDesktopMenu() {
		if(window.desktopCapable) {
			curScrollTop = window.pageYOffset;
			if(window.responsiveState !== 'mobile' && $active.length) {
				window.requestAnimationFrame(function () {
					return setIndicator($active[0]);
				});
			}
		}
		onPageLoad();
	}

	function initMobileMenu() {
		window.afterScrollFixOrientationChange = function() {
			$menu.css('height',  window.innerHeight + (isWebkitMobileNotIOS ? 58 : 2));
		};
		window.afterScrollFixOrientationChange();

		window.scrollFix({
			scrollable: [$menu[0]]
		});

		$window.on('touchstart', function(e) {
			if(mobileMenuIsTransitioning) {
				return;
			}
			if(mobileMenuIsOpen && e.originalEvent.touches[0].clientX < window.innerWidth - MENU_WIDTH) {
				closeMenu();
				return false;
			}
		});
		$window.on('resize', window.afterScrollFixOrientationChange);
	}

	function showLargeMenu() {
		if(desktopMenuState !== 'large-menu') {
			desktopMenuState = 'large-menu'
			window.requestAnimationFrame(function () {
				desktopMenuOffset = 0;
				desktopMenuRafTimeout = null;
				setIndicator();
				$menu.css({
					transform: '',
					transition: ''
				});
			});
		}
	}

	function getMenuTransitionTime() {
		return window.responsiveState === 'mobile' ? 0.4 : 0.725;
	}

	function stickLargeMenu(top, returningToTileView) {
		var doTransition,
			transition
		if(window.responsiveState === 'mobile') {
			return;
		}
		doTransition = returningToTileView || !window.isTileView || top > (HEADER_HEIGHT + DESKTOP_MENU_BREAKPOINT);
		transition = 'transform ' + getMenuTransitionTime() + 's ease';
		top = top || window.pageYOffset;
		desktopMenuOffset = window.isTileView ? (returningToTileView ? 0 : -Math.min(top - DESKTOP_MENU_BREAKPOINT, HEADER_HEIGHT - 1)) : -HEADER_HEIGHT + 1;
		desktopMenuState = 'sticky';
		setIndicator(null, returningToTileView ? transition : (doTransition ? '' : 'none'));
		$menu.css({
			transform: 'translate3d(0,' + desktopMenuOffset + 'px, 0)',
			transition: returningToTileView ? transition : (doTransition ? '' : 'none')
		});
	}

	function hideLargeMenu(e, data) {
		var transitionTime;
		if(window.responsiveState === 'mobile') {
			return;
		}
		transitionTime = getMenuTransitionTime();
		$menu.css({
			transform: 'translate3d(0,' + (desktopMenuOffset = -HEADER_HEIGHT) + 'px,0)',
			transition: 'transform ' + transitionTime + 's ease'
		});
		desktopMenuState = 'hidden';
		curScrollTop = data ? data.top || window.pageYOffset : window.pageYOffset;
		setIndicator(null, 'transform ' + transitionTime + 's ease');
	}

	function closeMenu(immediate) {
		if(!mobileMenuIsTransitioning  && mobileMenuIsOpen) {
			mobileMenuIsTransitioning = true;
			mobileMenuIsOpen = false;
			//window.location.hash = '';
			window.requestAnimationFrame(function() {
				$body.removeClass('menu');
			});
		}
	}

	function openMenu(dontPushState) {
		if(!mobileMenuIsTransitioning  && !mobileMenuIsOpen) {
			if(window.hasTouchEvents) {
				window.afterScrollFixOrientationChange();
			}
			mobileMenuIsTransitioning = true;
			mobileMenuIsOpen = true;
			mobileMenuYOffset = window.pageYOffset;
			if(dontPushState !== true) {
		//		window.location.hash = 'menu-open';
			}

			$window.trigger('menu');
			window.requestAnimationFrame(function () {
				$viewport.css({
					transform:'translateZ(0)'
				});
				window.setTimeout(function() {
					window.requestAnimationFrame(function() {
						$viewport.css({
							transform:''
						});
						$body.addClass('menu');
					});
				}, 0);
			});
		} else if(window.desktopCapable) {
			closeMenu();
		}
	}

	function handleScroll (e, data) {
		var top,
			doTransition;
		if(window.isBusy || data.isFinalEvent || window.responsiveState === 'mobile' ) {
			return;
		}

		top = Math.max(data.top, 0);
		if(!pageHasLoaded || top <= curScrollTop || (window.isTileView && top <= DESKTOP_MENU_BREAKPOINT)) {
			scrollDelta += curScrollTop - top;
			if(scrollDelta > SCROLL_UP_THRESHOLD) {
				showLargeMenu();
				scrollDelta = 0;
			}
		} else if(-desktopMenuOffset < HEADER_HEIGHT) {
			stickLargeMenu(top);
			scrollDelta = 0;
		}
		curScrollTop = top;
		mouseMoveDelta = 0;
	}

	function handleMouseMove(e) {
		if(window.isBusy) {
			return;
		}
		var y,
			now = new Date();
		if(window.responsiveState === 'mobile' || (now - MOUSE_MOVE_THROTTLE_THRESHOLD <= lastMouseMove)) {
			return lastMouseMove = now;
		}

		if((y = e.clientY) < curMouseTop) {
			mouseMoveDelta += curMouseTop - y;
			if((y < (HEADER_HEIGHT * 1.5)) || mouseMoveDelta >= MOUSE_MOVE_THRESHOLD) {
				showLargeMenu();
				mouseMoveDelta = 0;
			}
		}
		scrollDelta = 0;
		curMouseTop = y;
		lastMouseMove = now;
	}

	//handle the mobile menu toggle button being pressed
	$('#menu-toggle').on('click', openMenu);

	//after the menu has finished its toggling transition
	$menu.parent().on('transitionend webkitTransitionEnd', function (e) {
		if (!mobileMenuIsTransitioning || e.target !== $menu[0]) {
			return;
		}
		if(window.responsiveState === 'mobile') {
			if(isWebkitMobileNotIOS) {
				window.requestAnimationFrame(function () {
					$wrap.css({
						position: mobileMenuIsOpen ? 'fixed' : '',
						top: mobileMenuIsOpen ? -mobileMenuYOffset : ''
					});
					if(!mobileMenuIsOpen) {
						window.scrollTo(0, mobileMenuYOffset);
					}
				});
			} else if(window.hasTouchEvents) {
				$menu.css({
					top: mobileMenuIsOpen ? 0 : ''
				});
			}
			mobileMenuIsTransitioning = false;
		}
	});

	//only attach desktop events if the device is capable of showing desktop
	$window.on('deviceCapabilities', function (e, data) {
		if(data.desktopCapable) {
			$window.on('pageScroll', handleScroll);
			$body.on('mousemove', handleMouseMove);
			$wrap.append($indicator);
			$menu.on('mouseenter mouseleave', 'li', function() {
				$(this).toggleClass('hover');
			});
			if(!window.isTileView) {
				window.setTimeout(function () {
					window.requestAnimationFrame(hideLargeMenu);
				}, 100);
			}
			$(initDesktopMenu);

			//sred: [8 hours] animated gif in browser
			//window.prepareAnimatedIcon('menu-hover', $menu, 3, -136, -40, 0, -41);
			//	window.animateIcon('menu-hover', 160);
		} else if (data.hasTouchEvents) {
			isWebkitMobileNotIOS = !data.isIOS; //meh
			$(initMobileMenu);
		}
		if($active.length) {
			$menu.attr('data-active', $active.text());
		}
	});

	//handle menu view changes when the users resizes the window
	$window.on('responsiveStateChange', function (e, data) {
		window.requestAnimationFrame(function() {
			if(data.oldState === 'mobile') {
				initDesktopMenu();
				showLargeMenu();
			} else {
				pageHasLoaded = false;
				onPageLoad();
				$menu.css({
					transform:'',
					transition: ''
				});
			}
		});
	});

	$window.on('page-change', function (e, data) {
		if(mobileMenuIsOpen) {
			closeMenu();
		}
		mouseMoveDelta = 0;
		scrollDelta = 0;
	});

	$window.on('article-transition', hideLargeMenu);

	$window.on('tiles-transition', function(e, data) {
		if((curScrollTop = data.top) <= HEADER_HEIGHT) {
			stickLargeMenu(curScrollTop, true);
		}
	});

	//DEMO CODE todo: remove
	$menu.on('click', 'li', function() {
		activateLink(this);
	});

}());