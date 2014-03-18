(function banner() {
  $window = $(window);
  $menu = $('#menu');
  $bannerText = $('.banner > .banner-text');

  $window.on('filter', handleBanner);

  function handleBanner() {
    var pathTo = window.location.pathname;
    var bannerText = $('#menu').find('a[href="'+pathTo+'"]').data('banner');
    $bannerText.html(bannerText);
  }

}())
