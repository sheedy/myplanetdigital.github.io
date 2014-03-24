window.tiles = new Isotope( '.main-wrap', {
  itemSelector: '.tile',
  filter: '.visible',
  masonry: {
    columnWidth: '.grid-size'
  },
  transitionDuration: 0,
  visibleStyle: {},
  hiddenStyle: {}
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

window.currentTag = function() {
  return $('#menu').find('li.active').attr('class').split(' ')[0];
};