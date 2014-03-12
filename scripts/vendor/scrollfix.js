(function scrollfix () {
    'use strict';
    var scrollable = [],
        overflowScrollingCssProp = '-webkit-overflow-scrolling',
        overflowScrollingCssVal = 'touch',
        isIpad = /ipad/i.test(navigator.platform),
        isAndroid = /android/i.test(navigator.platform),
        hasAddedListeners = false;

    function ensureScroll(elem) {
        if(elem.scrollHeight <= screen.height) {
            if(elem.children.length) {
                elem.children[0].style.height = ((isIpad ? (window.innerHeight + 20) : screen.height) + 1) + 'px';
            }
        }
    }

    function scrollFix (elem) {
        var startY,
            offsetHeight,
            scrollHeight,
            startTopScroll,
            deltaY;

        elem = elem || elem.querySelector(elem);
        if (!elem) {
            return;
        }

        scrollable.push(elem);

        elem.style[overflowScrollingCssProp] = overflowScrollingCssVal;
        elem.style.overflow = 'auto';

        ensureScroll(elem);
        if(isAndroid) {
            return;
        }
        // Handle the start of interactions

        elem.addEventListener('touchstart', function (e) {
            offsetHeight = elem.offsetHeight;
            scrollHeight = elem.scrollHeight;

            if (elem.clientHeight === scrollHeight) {
                return e.preventDefault();
            }

            startTopScroll = elem.scrollTop;
            startY = e.touches[0].pageY;
            if (startTopScroll <= 0) {
                elem.scrollTop = 1;
            }
            if (startTopScroll + offsetHeight >= scrollHeight) {
                elem.scrollTop = scrollHeight - offsetHeight - 1;
            }
        }, false);
    }

    window.scrollFix = function (obj) {
        var len;

        len = obj.scrollable.length;
        while (len--) {
            scrollFix(obj.scrollable[len]);
        }
        if(obj.fixed) {
            len = obj.fixed.length;
            while (len--) {
                obj.fixed[len].noBounce = true;
            }
        }

        if(! hasAddedListeners) {
            window.addEventListener('resize', function (event) {
                var len = scrollable.length;
                while (len--) {
                    scrollable[len].style[overflowScrollingCssProp] = '';
                }
                window.setTimeout(function () {
                    len = scrollable.length;
                    while (len--) {
                        scrollable[len].style[overflowScrollingCssProp] = overflowScrollingCssVal;
                        ensureScroll(scrollable[len]);
                    }
                    if(window.afterScrollFixOrientationChange) {
                        window.afterScrollFixOrientationChange(scrollable[len]);
                    }
                }, 250);
            }, false);

            if(!isAndroid) {
                document.addEventListener('touchmove', function (event) {
                    if (event.target.hasOwnProperty('noBounce') || event.target.parentNode.hasOwnProperty('noBounce')) {
                        event.preventDefault();
                    }
                }, false);
            }

            hasAddedListeners  = true;
        }

        return true;
    };
}());