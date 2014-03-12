(function main () {

	'use strict';

	if(!window.isSinglePageApp) {
		return;
	}

	var $window = $(window),
		$body = $('body'),
		$article = $('#article'),
		$articlein = $('#article-inner'),
		$main = $('#main'),
		$mainWrap = $('.main-wrap'),
		$loadgif = $('.loading-overlay'),
		$loadgiftiles = $('.loading-overlay-tiles'),
		$anchors = $('a'),
		$footer = $('.footer'),
		$ajaxer = null,
		popped = false,
		hasLoadedTiles,
		isLoading =  false,
		scrollTimeout,
		preScrollTimeout,
		articleScrollTop = 0,
		tileScrollTop = 0,
		RELATIVE_URL_REGEX = /^(?:\/\/|[^\/]+)*\//,
		pageUrl = document.location.href.replace(RELATIVE_URL_REGEX, ''),
		lastArticleUrl = '',
		doAjax,
		isTransitioning = false,
		cancelTransition = false,
		linkClickedTime = new Date(),
		wasLinkClick,
		EXTERNAL_URL_REGEX = /^([^:\/?#]+:)?(?:\/\/([^\/?#]*))?([^?#]+)?(\?[^#]*)?(#.*)?/,
		ARTICLE_REGEX = /\/(article|people|careers)\//,
		TAG_REGEX = /\/(tags)\//,
		MAPS_REGEX = /http:\/\/maps\.google\.com/,
		COVER_SRC_REGEX = /url\(['"]?(.*\.\w+)['"]?\)/,
		IS_FIREFOX = navigator.userAgent.toLowerCase().indexOf('firefox') > -1,
		FULL_WIDTH = 1324,
		DESKTOP_WIDTH = 1174,
		END_SCROLL_THRESHOLD = 400,
		SPINNER_HEIGHT = 61,
		IOS_CHROME_HEIGHT = 70,
		PRE_SCROLL_THRESHOLD = 50;

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
		return finishStartScrolling();
		//window.setTimeout(function () {
			window.requestAnimationFrame(finishStartScrolling);
	//	}, 0);
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

	function finishArticleLoad(data) {
		window.setTimeout(function(){
			window.requestAnimationFrame(function () {
				$articlein.html(data);
				window.requestAnimationFrame(function() {
					isLoading = false;
					$loadgif.hide();
					$articlein.addClass('reveal');
					$article.css('height', '');
					window.setTimeout(function () {
						window.isBusy = false;
						window.curScrollTop = window.pageYOffset;
					}, 100);
				});
			});
		}, 0);
	}

	function loadViaAjax() {
		$articlein.removeClass('reveal');

		if (isTileView) {
			if ($mainWrap.find('.tile').length === 0) {
				isLoading = true;
				$ajaxer = $.get('/index-content-tiles.html', function(data){
					$ajaxer = null;
					window.setTimeout(function () {
						window.requestAnimationFrame(function () {
							$mainWrap.html(data);
							$window.trigger('tiles-init');
							window.tileTagSort();
							window.requestAnimationFrame(function() {
								hasLoadedTiles = true;
								isLoading = false;
								$loadgiftiles.hide();
								$main.css('height', '');
								window.setTimeout(function () {
									window.isBusy = false;
									window.curScrollTop = window.pageYOffset;
								}, 100);
							});
						});
					}, 100);
				});
			}
			$loadgif.hide();
		}
		else {
			isLoading = true;

			$ajaxer = $.get(pageUrl + '-content/index.html', function(data) {
				$ajaxer = null;
				window.setTimeout(function () {
					var image = new Image();
					image.onload = finishArticleLoad.bind(null, data);
					if($(data).eq(0).length) {
						image.src = $(data).eq(0).css('background-image').match(COVER_SRC_REGEX)[1];
					} else {
						finishArticleLoad(data);
					}
				}, 100);
			});
		}
		$body.removeClass('animating').css('height', '');
	}

	function handlePageChange(e, data) {
		if($ajaxer) {
			$ajaxer.abort();
			$body.removeClass('animating');
			isLoading = false;
			window.isBusy = false;
		}

		if(window.isIOS) {//!IS_FIREFOX) {
			window.curScrollTop = window.pageYOffset;
		}
		cancelTransition = isTransitioning;

		var isArticleUrl = data.url.match(ARTICLE_REGEX),
			top = window.curScrollTop,
			overridePopstateScrollmove,
			isTagsUrl = data.url.match(TAG_REGEX),
			timeoutLen = 50;

		wasLinkClick = new Date() - linkClickedTime < 300;
		overridePopstateScrollmove = !wasLinkClick && !window.isIOS; //ios doesn't mess with the scrollbar during popstate
		if(!wasLinkClick) {
			pageUrl = document.location.href.replace(RELATIVE_URL_REGEX, '');
			pageUrl = pageUrl || '/';
		}
		if(isArticleUrl && window.isTileView) {
			window.isTileView = false;
			window.isBusy = true;
			isTransitioning = true;
			tileScrollTop = top;
			doAjax = lastArticleUrl !== data.url;
			lastArticleUrl = data.url;
			if(wasLinkClick) {
				articleScrollTop = 0;
			}

			$window.trigger('article');
			//todo: show the loading gif

			$article.css({
				transform:  !overridePopstateScrollmove || wasLinkClick ? 'translate3d(-1px, ' + (top - articleScrollTop) + 'px, 0)' : '',
				transition: 'none'
			});
			$main.css({
				transform: overridePopstateScrollmove ? 'translate3d(-1px, ' + -(top - articleScrollTop) + 'px, 0)' : '',
				transition: 'none'
			});
			$body.addClass('animating').css('height', articleScrollTop + window.pageHeight);

			if(overridePopstateScrollmove) {
				window.scroll(0, window.curScrollTop = articleScrollTop);
			}

			window.setTimeout(function () {
				window.requestAnimationFrame(function () {
					if(doAjax) {
						$article.css('height', window.pageHeight + (window.isIOS ? IOS_CHROME_HEIGHT : 0));
						$loadgif.find('.loading-spinner').css('top', window.pageHeight/2 - SPINNER_HEIGHT);
						$loadgif.show();
					}
					$article.css({
						transform:  !overridePopstateScrollmove || wasLinkClick ?'translate3d(-100%, ' + (top - articleScrollTop) + 'px, 0)' : '',
						transition: ''
					});
					$main.css({
						transform: overridePopstateScrollmove ? 'translate3d(-100%, ' + -(top - articleScrollTop) + 'px, 0)' : '',
						transition: ''
					});
					$window.trigger('article-transition', [{
						top: articleScrollTop
					}]);
					$body.addClass('article');
				});
			}, timeoutLen);

		} else if(!isArticleUrl && !window.isTileView) {
			window.isTileView = true;
			window.isBusy = true;
			isTransitioning = true;
			articleScrollTop = top;

			if(wasLinkClick) {
				tileScrollTop = 0;
			}

			$window.trigger('tiles');
			//todo: show the loading gif


			$main.css({
				transform: !overridePopstateScrollmove || wasLinkClick ? 'translate3d(-100%, ' + (top - tileScrollTop) + 'px, 0)' : '',
				transition: 'none'
			});
			$article.css({
				transform: overridePopstateScrollmove ? 'translate3d(-100%, ' + -(top - tileScrollTop) + 'px, 0)' : '',
				transition: 'none'
			});
			$body.addClass('animating').css('height', tileScrollTop + window.pageHeight);

			if(overridePopstateScrollmove) {
				window.scroll(0, window.curScrollTop = tileScrollTop);
			}

			window.setTimeout(function () {
				window.requestAnimationFrame(function () {
					if (doAjax = !hasLoadedTiles) {
						$main.css('height', window.pageHeight + (window.isIOS ? IOS_CHROME_HEIGHT : 0));
						$loadgiftiles.find('.loading-spinner').css('top', window.pageHeight/2 - SPINNER_HEIGHT);
						$loadgiftiles.show();
					}
					else {
						window.tileTagSort();
					}
					$main.css({
						transform:  !overridePopstateScrollmove || wasLinkClick ? 'translate3d(-1px, ' + (top - tileScrollTop) + 'px, 0)' : '',
						transition: ''
					});
					$article.css({
						transform: overridePopstateScrollmove ? 'translate3d(-1px, ' + -(top - tileScrollTop) + 'px, 0)' : '',
						transition: ''
					});
					$window.trigger('tiles-transition', [{
						top: tileScrollTop
					}]);
					$body.removeClass('article');
				});
			}, timeoutLen);

		} else if (isTagsUrl) {
			// Grab the desired tag.
			var tag = data.hash.split(/\//).pop();

			// window.tiles is defined in tiles-immediate.js
			//[].forEach.call(window.tiles.items, function(item) {
			//	item.element.classList.remove('visible');
			//});

			// Filter the tiles with Isotope.
			window.tiles.arrange({filter: '.' + tag});
			window.removeAllLayers();
			window.revealAll();

			$window.trigger('filter');

			// Initialize the page so that the tiles appear.
			window.initializePage();
		} else {
			// Loading the home tiles.
			window.tiles.arrange({filter: '.home'});
			window.removeAllLayers();
			window.revealAll();
			$window.trigger('filter');

			// Initialize the page so that the tiles appear.
			window.initializePage();
		}
	}
	window.revealAll = function() {

		[].forEach.call(window.tiles.items, function(item) {
			item.element.classList.add('reveal');
		});
	};

	function finishTransition() {
		if(doAjax) {
			window.setTimeout(function () {
				if(cancelTransition) {
					return;
				}
				window.requestAnimationFrame(loadViaAjax);
				isTransitioning = false;
			}, 150);
		} else {
			$body.removeClass('animating');
			window.setTimeout(function () {
				if(cancelTransition) {
					return;
				}
				window.isBusy = false;
				window.curScrollTop = window.pageYOffset;
				isTransitioning = false;
			}, 150);
		}
	}

	function isExternalUrl(url) {
		var match = url.match(EXTERNAL_URL_REGEX);
		if (typeof match[1] === 'string' && match[1].length > 0 && match[1].toLowerCase() !== location.protocol) {
			return true;
		}
		if (typeof match[2] === 'string' && match[2].length > 0 && match[2].replace(new RegExp(':('+{'http:':80,'https:':443}[location.protocol]+')?$'), '') !== location.host) {
			return true;
		}
		return false;
	}

	function handleTransitionEnd(e) {
		if(!isTransitioning || e.target !== $article[0]) {
			return;
		}

		var endTransition;

		if(!window.isTileView) {
			endTransition =  function () {
				if(cancelTransition) {
					return $body.removeClass('animating');
				}
				window.scroll(0, articleScrollTop);// + (window.isIOS ? 0 : (window.pageYOffset - window.curScrollTop)));
				window.setTimeout(function () {
					window.requestAnimationFrame(function () {
						if(cancelTransition) {
							return $body.removeClass('animating');
						}
						$article.css({
							transition: '',
							position: 'static',
							marginLeft: '100%'
						});
						$main.css({
							position: 'absolute'
						});
						finishTransition();
					});
				}, 0);
			};
		} else {
			endTransition = function () {
				if(cancelTransition) {
					return $body.removeClass('animating');
				}
				window.scroll(0, tileScrollTop);//+ (window.isIOS ? 0 : (window.pageYOffset - window.curScrollTop)));
				window.setTimeout(function () {
					window.requestAnimationFrame(function () {
						if(cancelTransition) {
							return $body.removeClass('animating');
						}
						$main.css({
							transition: '',
							position: ''
						});
						$article.css({
							position: 'absolute',
							left: '100%',
							marginLeft: ''
						});
						window.requestAnimationFrame(finishTransition);
					});
				}, 0);
			};
		}
		window.setTimeout(function () {
			window.requestAnimationFrame(function () {
				if(cancelTransition) {
					return $body.removeClass('animating');
				}
				$article.css({
					transform: '',
					transition: 'none'
				});
				$main.css({
					transform: '',
					transition: 'none'
				});
				if(window.isIOS) {
					return window.setTimeout(endTransition, 0);
				}
				endTransition();
			});
		}, 0);
	}
	$article.on('transitionend webkitTransitionEnd', handleTransitionEnd);

	//init capabiliites
	setResponsiveState();
	$window.smartresize(setResponsiveState);

	window.curScrollTop = window.pageYOffset;
	window.isTileView = hasLoadedTiles = !$body.hasClass('article');
	window.isScrolling = false;

	$window.trigger('deviceCapabilities', [{
		desktopCapable: window.desktopCapable = Math.max(screen.width, screen.height) >= DESKTOP_WIDTH,
		hasTouchEvents: window.hasTouchEvents = 'ontouchstart' in window,
		isIOS: window.isIOS = !!navigator.userAgent.match(/(iPad|iPhone|iPod)/g),
		top: window.pageYOffset,
		bottom: window.pageYOffset + window.pageHeight
	}]);

	SPINNER_HEIGHT = window.isIOS ? 25 : SPINNER_HEIGHT;
	pageUrl = pageUrl || '/';

	if(window.desktopCapable) {
		$body.addClass('desktop-capable');
	}

	//handle geo urls
	if(window.hasTouchEvents) {
		$anchors.each(function () {
			var $link = $(this),
				href = $link.attr('href'),
				longLat = $link.attr('data-long-lat') || '43.65163,-79.37104';
			$link.attr('href', window.isIOS ? href.replace(MAPS_REGEX, 'http://maps.apple.com') : href.match(MAPS_REGEX) ? 'geo:' + longLat : href);
		});
	}
	//handle push/pop state
	$body.on('click', 'a', function() {
		var url = $(this).attr('href');
		if(url === '/' && pageUrl === '/') {
			$window.trigger('scroll-top');
			return false;
		} else if(!isExternalUrl(url)) {
			pageUrl = url;
			linkClickedTime = new Date();
			History.pushState(null, null, pageUrl);
			return false;
		}
	});

	$article.append($footer.clone());

	$window.on('page-change', handlePageChange);

	//global scroll handler
	$window.on('scroll', function() {
		if(window.isIOS) {
			return;
		}
		if(isTransitioning || isLoading) {
			return;
		}
		window.curScrollTop = window.pageYOffset;

		if(!window.isScrolling) {
			startScrolling();
		}

		$window.trigger('pageScroll', [{
			top: window.curScrollTop,
			bottom: window.curScrollTop + window.pageHeight,
			isFinalEvent: false
		}]);

		if(scrollTimeout) {
			window.clearTimeout(scrollTimeout);
			window.clearTimeout(preScrollTimeout);
		}
		scrollTimeout = window.setTimeout(endScrolling, END_SCROLL_THRESHOLD);
		preScrollTimeout = window.setTimeout(function() {
			$window.trigger('pageScroll', [{
				top: window.curScrollTop,
				bottom: window.curScrollTop + window.pageHeight,
				isFinalEvent: true
			}]);
		}, PRE_SCROLL_THRESHOLD);
	});

	if(!window.isTileView) {
		articleScrollTop = window.curScrollTop;
		lastArticleUrl = document.location.href;
	} else {
		tileScrollTop = window.curScrollTop;
	}
	window.requestAnimationFrame(function () {
		$body.addClass('loaded');
	});

	/**
	 * Initialize the tiles when the page loads.
	 */
	window.initializeTiles = function() {
		var tag = 'home';
		var $articles = $('.articles');
		if ($articles.length >= 0) {
			tag = $articles.data('tag');
		}
		window.tiles = new Isotope( '.main-wrap', {
		  itemSelector: '.tile',
		  filter: '.' + tag,
		  masonry: {
		    columnWidth: '.grid-size'
		  },
		  transitionDuration: 0
		});

		var loadingGif = new Image();
		loadingGif.src = "/images/loading.gif";
		loadingGif.onload = function () {
			if('ontouchstart' in window) {
			    var els = document.querySelectorAll('.tile'),
			        len = els.length;
			    while(len--) {
			        els[len].style.opacity = 1;
			    }
			}
		};

	}
	$(document).ready(window.initializeTiles);
	
}());