(function init () {
  'use strict';

  if(!window.isSinglePageApp) {
    return;
  }

  var $body = $('body');

  window.FastClick.attach(document.body);

  History.Adapter.bind(window,'statechange',function (){
       $body.trigger('page-change', [History.getState()]);
    });

  /*  History.Adapter.bind(window,'hashchange', function (){
      //debugger;
      $body.trigger('hash-change', [History.getState()]);
    });*/

}());