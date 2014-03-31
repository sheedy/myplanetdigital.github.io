$(function(){
  $('#menu li').on('mouseenter', function(){
    $(this).addClass('hover');
  });

  $('#menu li').on('mouseleave', function(){
    $(this).removeClass('hover');
  });

  var lastScrollLeft = 0;
  var $menu = $('#menu');
  var $logo = $('#logo');
  $(window).scroll(function() {
    var documentScrollLeft = $(document).scrollLeft();
      if (lastScrollLeft != documentScrollLeft) {
        $menu.css('left', -documentScrollLeft);
        $logo.css('left', -documentScrollLeft);
        lastScrollLeft = documentScrollLeft;
      }
  });
});
