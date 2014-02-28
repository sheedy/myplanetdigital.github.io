(function tiles () {

	'use strict';

	if (! window.isSinglePageApp) {
		return;
	}
	var $window = $(window),
		$wrap = $('#main .main-wrap'),
		topOffset = parseInt($wrap.css('margin-top').replace(/px/, ''), 10),
		scrollData,
		firstEventTimeout = null,
		throttleTimeout = null,
		flushingTimeout = null,
		hasHiddenTiles = true,
		queue = [],
		layerQueue = [],
		finishFlush,
		$hiddenTiles,
		$body = $('body'),
		$articleContainer = $('#article');

	function initializePage() {
		$hiddenTiles = window.tiles.items.filter(function (tile) {
			if(tile.position.y + topOffset < scrollData.bottom ) {
				tile.element.style.opacity = '0.99';
				return false;
			} else {
				$(tile.element).addClass('hidden');
			}
			return true;
		}).sort(function (a, b) {
			if(b.position.y === a.position.y) {
				return b.position.x - a.position.x;
			}
			return a.position.y - b.position.y;
		});

		hasHiddenTiles = $hiddenTiles.length;
		firstEventTimeout = null;
	}

	function removeLayer(item) {
		item.classList.remove('reveal');
		item.classList.remove('show');
		item.classList.remove('hidden');
		item.classList.add('revealed');
		item.style.opacity = '1';
	}

	function removeLayers() {
		var len = layerQueue.length,
			item;
		while(len--){
			removeLayer(layerQueue[len]);
			layerQueue.splice(len, 1);
		}
	}

	function removeAllLayers() {
		var len = $hiddenTiles.length;
		while(len--){
			removeLayer($hiddenTiles[len].element);
		}
		len = queue.length;
		while(len--){
			removeLayer(queue[len]);
		}
		len = layerQueue.length;
		while(len--){
			removeLayer(queue[len]);
		}
	}

	function flushQueue() {
		var len = queue.length,
			item,
			count = 0;
		while(len--) {
			item = queue[len];
			item.tile.classList.add(queue[len].klass);
			queue.splice(len, 1);
			if(++count === 3 && queue.length) {
				return flushingTimeout = window.setTimeout(finishFlush, 50);
			}
		}
		if(queue.length) {
			return flushingTimeout = window.setTimeout(finishFlush, 50);
		}
		flushingTimeout = null;
	}

	finishFlush = window.requestAnimationFrame.bind(null, flushQueue);

	function onScroll() {
		var tile,
			len = $hiddenTiles.length,
			added = false;
		hasHiddenTiles = len;

		while(len--) {
			tile = $hiddenTiles[len];
			if(tile.position.y + topOffset < scrollData.bottom) {
				if (tile.position.y + tile.size.height > scrollData.top) {
					if(!firstEventTimeout) {
						queue.push({tile: tile.element, klass: 'reveal'});
						added = true;
					}
				} else {
					queue.push({tile: tile.element, klass: 'show'});
					added = true;
				}
				$hiddenTiles.splice(len, 1);
			}
		}

		if(added && !flushingTimeout) {
			window.requestAnimationFrame(flushQueue);
		}
		throttleTimeout = null;
	}

	function handleScroll(e, data) {
		if(!hasHiddenTiles || throttleTimeout) {
			return;
		}
		if(firstEventTimeout) {
			return scrollData = data;
		}

		scrollData = data;
		throttleTimeout = setTimeout(onScroll, 120);
	}

	function transitionEnd (e) {
		if(!e.target.classList.contains('tile')) {
			return;
		}
		if (!e.target.classList.contains('show') && !e.target.classList.contains('reveal')) {
			return removeLayer(e.target);
		}
		if(! window.isScrolling) {
			window.requestAnimationFrame(removeLayer.bind(null, e.target));
		} else {
			layerQueue.push(e.target);
		}
	}
	//only attach desktop events if the device is capable of showing desktop
	$window.on('deviceCapabilities', function (e, data) {
		if(data.desktopCapable) {
			$window.on('pageScroll', handleScroll);
			$window.on('after-scrolling', window.requestAnimationFrame.bind(null, removeLayers));
			$wrap.on('transitionend webkitTransitionEnd', transitionEnd);
			$window.on('article', removeAllLayers);

			scrollData = data;
			firstEventTimeout = window.setTimeout(initializePage, 750);
		}
	});

	//Article loading
	//Temporary, Proof of concept
	$wrap.on('click', 'a.tile-image, a.tile-title', function(e) {
		e.preventDefault();
		$window.trigger('article');
		window.requestAnimationFrame(function () {
			$body.toggleClass('article');
		});
		$articleContainer.load(this.href + '-content');
	});

}());