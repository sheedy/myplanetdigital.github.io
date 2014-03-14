$(function(){
  $('#menu li').on('mouseenter', function(){
    $(this).addClass('hover');
  });

  $('#menu li').on('mouseleave', function(){
    $(this).removeClass('hover');
  });
});
