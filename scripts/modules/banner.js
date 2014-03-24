(function banner() {
  if (!window.isSinglePageApp) {
    return;
  }
  var $menu = $('#menu'),
      $banner = $('#banner'),
      $bannerText = $('#banner > .banner-text'),
      bannerInfo = {};

  $('#menu').find('a').each(function(){
    var me = $(this),
        tag = me.data('tag');
    bannerInfo[tag] = {
      'bannerText' : me.data('banner'),
      'bannerDoodle' : '../images/' + me.data('menu-doodle'),
    };
    // preload all the doodles
    (new Image()).src = bannerInfo[tag].bannerDoodle;
  });

  function bannerUpdate(tag, immediate) {
    var bannerText = bannerInfo[tag]['bannerText'],
        newDoodle = bannerInfo[tag]['bannerDoodle'];

    if(window.responsiveState === 'mobile' && window.mobileMenuIsOpen) {
      immediate = true;
    }
    $bannerText.css({opacity: 0.01, transition: 'none'});
    $banner.css({transition: immediate ? 'none' : ''});
    $bannerText.html(bannerText);
    $banner.attr('class', tag);
    if(immediate) {
      return $bannerText.css({'opacity': 1});
    }
    window.setTimeout(window.requestAnimationFrame.bind(null, function() {
      $bannerText.css({'opacity': 0.99, 'transition' : ''});
    }), 0);
  }

  $(window).on('filter', function(e, tag, immediate){
    bannerUpdate(tag, immediate);
  });

}());