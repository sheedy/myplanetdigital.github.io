(function banner() {
  if (!window.isSinglePageApp) {
    return;
  }

  var $menu = $('#menu');
  var banner = document.getElementById('banner');
  var $bannerText = $('#banner > .banner-text');
  var $bannerBg = $('#banner-bg');
  var $bannerDoodle = $('#banner-doodle');
  var noop = function(){};

  var pathToBannerSettnigsMap = {};
  $('#menu').find('a').each(function(){
    var self = $(this);
    pathToBannerSettnigsMap[self.attr('href')] = {
      'bannerText' : self.data('banner'),
      'bannerColour' : self.data('menu-colour'),
      'bannerDoodle' : '/images/' + self.data('menu-doodle'),
    }
    // preload all the doodles
    ;(new Image()).src = pathToBannerSettnigsMap[self.attr('href')]['bannerDoodle'];
  })

  function placeBannerBackground(newHeight, newColor) {
    if (typeof newColor === 'undefined') {
      newColor = MPD_ORANGE;
    }

    $bannerBg.css({
      'transform' : 'translate3d(0, ' + newHeight + 'px, 0)',
      'background-color' : newColor,
      'opacity' : 0.99
    });
  }

  // Adjustable transitionend handler.
  // This will always be assigned as handler for
  // transitionend but the actual functionality can be changed by
  // assigning function to bannerTextTransitionHandler.cb
  function bannerTextTransitionHandler() {
    arguments.callee.cb()
    arguments.callee.cb = noop;
  }
  bannerTextTransitionHandler.cb = noop;
  $bannerText.on('transitionend webkitTransitionEnd', bannerTextTransitionHandler);

  function bannerTextFadeIn() {
    $bannerText.css({'opacity': 0.99});
  }

  function bannerTextFadeOut(cb) {
    bannerTextTransitionHandler.cb = cb;
    $bannerText.css({'opacity': 0.01});
  }

  function bannerDoodleTransitionHandler() {
    arguments.callee.cb();
    arguments.callee.cb = noop;
  }
  bannerTextTransitionHandler.cb = noop;
  $bannerDoodle.on('transitionend webkitTransitionEnd', bannerDoodleTransitionHandler);

  function bannerChangeDoodle(newDoodle) {
    bannerDoodleTransitionHandler.cb = function() {
      $bannerDoodle.css({
        'background-image' : 'url("' + newDoodle + '")',
        //'opacity' : 0.99
        'transform' : 'translate3d(0, 0, 0)',
      });
    };

    $bannerDoodle.css({'transform' : 'translate3d(0, -450px, 0)'});
    // $bannerDoodle.css({'opacity' : 0.01});
  }

  function handleBannerTextUpdate() {
    var pathTo = window.location.pathname;
    var bannerText = pathToBannerSettnigsMap[pathTo]['bannerText'];
    var newColour = pathToBannerSettnigsMap[pathTo]['bannerColour'];
    var newDoodle = pathToBannerSettnigsMap[pathTo]['bannerDoodle'];

    bannerChangeDoodle(newDoodle);

    bannerTextFadeOut(function() {
      $bannerText.html(bannerText);
      bannerTextFadeIn();
      placeBannerBackground(banner.offsetHeight, newColour);
    });
  }

  function bannerTransparent() {
    //$bannerBg.css({'opacity': 0.01});
  }

  var initialColour = pathToBannerSettnigsMap[window.location.pathname]['bannerColour'];
  var initialDoodle = pathToBannerSettnigsMap[window.location.pathname]['bannerDoodle'];

  window.requestAnimationFrame(function(){
    placeBannerBackground(banner.offsetHeight, initialColour);
    bannerChangeDoodle(initialDoodle);
  });

  $(window).on('filter', handleBannerTextUpdate);
  $(window).on('article', bannerTransparent);
  $(window).on('tiles', handleBannerTextUpdate);
} ());
