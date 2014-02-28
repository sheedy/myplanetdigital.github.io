(function initialize () {
	'use strict';

	if(!window.isSinglePageApp) {
		return;
	}

	window.FastClick.attach(document.body);

}());