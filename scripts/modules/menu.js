(function menu () {

	'use strict';

	if (! window.isSinglePageApp) {
		return;
	}

	var $window = $(window),
		$body = $('body'),
		$wrap = $('#wrap'),
		$menu = $('#menu'),
		$menuGhost = $('<div data-role="menu-ghost"></div>'),
		$logo = $('#logo'),
		$viewport = $('#viewport'),
		$indicator = $('<span data-role="menu-indicator"></span>'),
		$active = $menu.find('.active'),
		$mainWrap = $('.main-wrap'),
		curScrollTop,
		curMouseTop,
		lastMouseMove = new Date(),
		mobileMenuIsTransitioning = false,
		indicatorOffset,
		desktopMenuState,
		desktopMenuOffset = 0,
		mobileMenuYOffset = 0,
		mouseMoveDelta = 0,
		scrollDelta = 0,
		pageHasLoaded = false,
		enteredMenu = false,
		desktopMenuRafTimeout,
		HEADER_HEIGHT = 127,
		MENU_WIDTH = 250,
		SCROLL_UP_THRESHOLD = 20,
		MOUSE_MOVE_THRESHOLD = 50,
		DESKTOP_MENU_BREAKPOINT =  16, //parseInt($viewport.css('padding-top').replace(/px/,''), 10) - $menu.outerHeight(true),
		MOUSE_MOVE_THROTTLE_THRESHOLD = 25;

	function setIndicator(item, transition) {
		if(item) {
			indicatorOffset = (item.offsetLeft - 14) - (window.responsiveState === 'full' ? $wrap[0].offsetLeft + $mainWrap[0].offsetLeft : 0);
		}
		$indicator.css({
			transform: 'translate3d(' + indicatorOffset + 'px, ' + desktopMenuOffset + 'px, 0)',
			transition: transition || ''
		});
	}

	//active an item in the menu
	function activateLink ($item) {
		window.requestAnimationFrame(function () {
			if(window.responsiveState !== 'mobile') {
				setIndicator($item[0]);
			} else if(window.mobileMenuIsOpen) {
				window.setTimeout(closeMenu, 50);
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
			$menu.css('height',  window.innerHeight + 2);
		};
		window.afterScrollFixOrientationChange();

		window.scrollFix({
			scrollable: [$menu[0]]
		});

		$window.on('touchstart', function(e) {
			if(mobileMenuIsTransitioning) {
				return;
			}
			if(window.mobileMenuIsOpen && e.originalEvent.touches[0].clientX < window.innerWidth - MENU_WIDTH) {
				closeMenu();
				return false;
			}
		});
		$window.on('resize', window.afterScrollFixOrientationChange);
	}

	function showLargeMenu() {
		if(desktopMenuState !== 'large-menu') {
			desktopMenuState = 'large-menu';
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
			transition;
		if(window.responsiveState === 'mobile') {
			return;
		}
		top = top || window.pageYOffset;
		doTransition = returningToTileView || !window.isTileView || top > (HEADER_HEIGHT + DESKTOP_MENU_BREAKPOINT);
		transition = 'transform ' + getMenuTransitionTime() + 's ease';
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
		if(window.responsiveState === 'mobile' || desktopMenuState === 'hidden') {
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
		if(!mobileMenuIsTransitioning  && window.mobileMenuIsOpen) {
			mobileMenuIsTransitioning = true;
			//window.location.hash = '';
			window.requestAnimationFrame(function() {
				window.mobileMenuIsOpen = false;
				$body.removeClass('menu');
			});
		}
	}

	function openMenu(dontPushState) {
		if(!mobileMenuIsTransitioning  && !window.mobileMenuIsOpen) {
			if(window.hasTouchEvents) {
				window.afterScrollFixOrientationChange();
			}
			mobileMenuIsTransitioning = true;
			window.mobileMenuIsOpen = true;
			mobileMenuYOffset = window.curScrollTop = window.pageYOffset;

			$window.trigger('menu');

			window.setTimeout(window.requestAnimationFrame.bind(null, function () {
				if(window.isTileView) {
					return $body.addClass('menu');
				}

				$viewport.css({
					transform:'translateZ(0)',
					transition: ''
				});
				window.setTimeout(function() {
					window.requestAnimationFrame(function() {
						$viewport.css({
							transform:''
						});
						$body.addClass('menu');
					});
				}, 0);
			}), 0);
		} else if(window.desktopCapable) {
			closeMenu();
		}
	}

	function handleScroll (e, data) {
		var top,
			doTransition;
		if(window.isBusy || data.isFinalEvent || enteredMenu || window.responsiveState === 'mobile' ) {
			return;
		}
		top = Math.max(data.top, 0);
		if(!pageHasLoaded || (window.isTileView && (top <= curScrollTop || top <= DESKTOP_MENU_BREAKPOINT))) {
			scrollDelta += curScrollTop - top;
			if(scrollDelta > SCROLL_UP_THRESHOLD) {
				showLargeMenu();
				scrollDelta = 0;
			}
		} else if(-desktopMenuOffset < HEADER_HEIGHT) {
			if(window.isTileView) {
				stickLargeMenu(top);
			} else {
				hideLargeMenu();
			}

			scrollDelta = 0;
		}
		curScrollTop = top;
		mouseMoveDelta = 0;
	}

	//handle the mobile menu toggle button being pressed
	$('#menu-toggle').on('click', openMenu);

	//after the menu has finished its toggling transition
	$menu.parent().on('transitionend webkitTransitionEnd', function (e) {
		if (!mobileMenuIsTransitioning || e.target !== $menu[0]) {
			return;
		}
		if(window.responsiveState === 'mobile') {
			if(window.isWebkitMobileNotIOS) {
				//window.requestAnimationFrame(function () {
					$wrap.css({
						position: window.mobileMenuIsOpen ? 'fixed' : '',
						top: window.mobileMenuIsOpen ? -mobileMenuYOffset : ''
					});
					if(!window.justClosedMenu) {
						if(!window.mobileMenuIsOpen) {
							window.scroll(0, mobileMenuYOffset);
						}
					}
					window.justClosedMenu = false;
				//});
			} else if(window.hasTouchEvents) {
				$menu.css({
					top: window.mobileMenuIsOpen ? 0 : ''
				});
			}
			mobileMenuIsTransitioning = false;
		}
	});

	//only attach desktop events if the device is capable of showing desktop
	$window.on('deviceCapabilities', function (e, data) {

		if(data.desktopCapable) {
			$window.on('pageScroll', handleScroll);
			//$body.on('mousemove', handleMouseMove);
			$wrap.append($indicator);
			$menu.on('mouseenter mouseleave', 'li', function() {
				$(this).toggleClass('hover');
			});

			$('#menu, #logo').on('mouseenter', function() {
				enteredMenu = true;
			});
			$menuGhost.on('mouseenter', function() {
				if (window.isTileView && window.curScrollTop <= DESKTOP_MENU_BREAKPOINT) {
					return;
				}
				if(!enteredMenu && desktopMenuState !== 'large-menu') {//} && (!window.isBusy || window.isTileView)) {
					showLargeMenu();
				} else if(enteredMenu) {
					enteredMenu = false;
				}
			});
			$menuGhost.on('mouseleave', function(e) {
				window.setTimeout(function() {
					if (window.isTileView && window.curScrollTop <= DESKTOP_MENU_BREAKPOINT) {
						return;
					}
					if(!enteredMenu && desktopMenuState === 'large-menu' && e.clientY > DESKTOP_MENU_BREAKPOINT && !window.isBusy) {
						hideLargeMenu();
					}
				}, 0);
				enteredMenu = false;
			});

			if(!window.isTileView) {
				window.setTimeout(function () {
					window.requestAnimationFrame(hideLargeMenu);
				}, 200);
			}
			$(initDesktopMenu);
		} else if (data.hasTouchEvents) {
			$(initMobileMenu);
		}
		if($active.length) {
			$menu.attr('data-active', $active.text());
		}
	});

	$wrap.append($menuGhost);
	$menuGhost.on('click', function() {
		if(window.responsiveState === 'mobile') {
			$window.trigger('scroll-top');
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
	window.mobileMenuIsOpen = false;
	$window.on('page-change', function (e, data) {
	//	if(mobileMenuIsOpen) {
	//		closeMenu();
	//	}
		enteredMenu = false;
		mouseMoveDelta = 0;
		scrollDelta = 0;
	});

	$window.on('same-page same-filter elevator-done', closeMenu);
	$window.on('filter',function (e, tag) {
		activateLink($menu.find('li.' + tag));
	});

	$window.on('article-transition', hideLargeMenu);

	$window.on('tiles-transition', function(e, data) {
		if(window.responsiveState !== 'mobile' && (curScrollTop = data.top) <= HEADER_HEIGHT) {
			stickLargeMenu(curScrollTop, true);
		}
	});

}());