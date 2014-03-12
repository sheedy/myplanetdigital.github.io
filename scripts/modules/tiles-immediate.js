window.tiles = new Isotope( '.main-wrap', {
  itemSelector: '.tile',
  filter: '.visible',
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

// Create predefined groups of tiles, based on their tags
// window.tileTaggedGroups = {'careers': [TileDomEl1, TileDomEl2 ... ],  ... }
/*
window.tileTaggedGroups = {};
if('forEach' in []) {
  [].forEach.call(document.querySelectorAll('.tile'), function(tile) {
      tile.getAttribute('data-tags').split(/\s+/).forEach(function(usedTag) {
          window.tileTaggedGroups[usedTag] = window.tileTaggedGroups[usedTag] || [];
          window.tileTaggedGroups[usedTag].push(tile);
      });
  });
}*/