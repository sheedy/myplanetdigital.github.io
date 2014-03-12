(function polyfill() {
    'use strict';

    var s = document.body.style;
    window.isSinglePageApp = window.history && window.history.pushState && (s.MozTransition === '' || s.WebkitTransition === '' || s.OTransition === '' || s.transition === '');

    if (window.isSinglePageApp) {

        //raf
        (function() {
            var lastTime = 0;
            var vendors = ['webkit', 'moz'];
            for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
                window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
                window.cancelAnimationFrame =
                  window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
            }

            if (!window.requestAnimationFrame)
                window.requestAnimationFrame = function(callback, element) {
                    var currTime = new Date().getTime();
                    var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                    var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                      timeToCall);
                    lastTime = currTime + timeToCall;
                    return id;
                };

            if (!window.cancelAnimationFrame)
                window.cancelAnimationFrame = function(id) {
                    clearTimeout(id);
                };
        }());

        //jquery smart resize, classlist and prefixed transitions
        if ('classList' in document.body) {
            var plugin = $.fn,
                cssFn = plugin.css,
                add = DOMTokenList.prototype.add,
                remove = DOMTokenList.prototype.remove,
                styles = window.getComputedStyle(document.documentElement, ''),
                prefix = '-' + (Array.prototype.slice.call(styles).join('').match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o']))[1],
                i, elem, multi, length;

            plugin.hasClass = function(selector) {
                length = this.length;
                for (i = 0; i < length; i++) {
                    if ((elem = this[i]).nodeType === 1 && elem.classList.contains(selector)) {
                        return true;
                    }
                }
                return false;
            };

            plugin.addClass = function(value) {
                if(length = this.length) {
                    if(multi = value.indexOf(' ') > -1) {
                        value = value.trim().split(' ');
                    }
                    for (i = 0; i < length; i++) {
                        if ((elem = this[i]).nodeType === 1) {
                            if(multi) {
                                add.apply(elem.classList, value);
                            } else {
                                elem.classList.add(value);
                            }
                        }
                    }
                }
                return this;
            };

            plugin.removeClass = function(value) {
                if(length = this.length) {
                    if(multi = value.indexOf(' ') > -1) {
                        value = value.trim().split(' ');
                    }

                    for (i = 0; i < length; i++) {
                        if ((elem = this[i]).nodeType === 1) {
                            if(multi) {
                                remove.apply(elem.classList, value);
                            } else {
                                elem.classList.remove(value);
                            }
                        }
                    }
                }
                return this;
            };

            plugin.css = function(key, value) {
                if (key === 'transition') {
                    value = value.replace('transform', prefix + '-transform');
                } else if (key && key.transition) {
                    key.transition = key.transition.replace('transform',  prefix + '-transform');
                }

                return cssFn.apply(this, arguments);
            };

            (function($,sr){

              // debouncing function from John Hann
              // http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
              window.debounce = function (func, threshold, execAsap) {
                  var timeout;

                  return function debounced () {
                      var obj = this, args = arguments;
                      function delayed () {
                          if (!execAsap)
                              func.apply(obj, args);
                          timeout = null;
                      };

                      if (timeout)
                          clearTimeout(timeout);
                      else if (execAsap)
                          func.apply(obj, args);

                      timeout = setTimeout(delayed, threshold || 200);
                  };
              };
              // smartresize
              jQuery.fn[sr] = function(fn){  return fn ? this.bind('resize', window.debounce(fn)) : this.trigger(sr); };

            })(jQuery,'smartresize');
        }

    }

}());