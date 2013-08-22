suite("Prototype Namespace",function(){
  test("Browser Detection", function() {
    var results = $H(Prototype.Browser).map(function(engine){
      return engine;
    }).partition(function(engine){
      return engine[1] === true
    });
    var trues = results[0], falses = results[1];

    info('User agent string is: ' + navigator.userAgent);

    assert(trues.size() == 0 || trues.size() == 1,
      'There should be only one or no browser detected.');

    // we should have definite trues or falses here
    trues.each(function(result) {
      assert(result[1] === true);
    }, this);
    falses.each(function(result) {
      assert(result[1] === false);
    }, this);

    if(navigator.userAgent.indexOf('AppleWebKit/') > -1) {
      info('Running on WebKit');
      assert(Prototype.Browser.WebKit);
    }

    if(!!window.opera) {
      info('Running on Opera');
      assert(Prototype.Browser.Opera);
    }

    if(!!(window.attachEvent && !window.opera)) {
      info('Running on IE');
      assert(Prototype.Browser.IE);
    }

    if(navigator.userAgent.indexOf('Gecko') > -1 && navigator.userAgent.indexOf('KHTML') == -1) {
      info('Running on Gecko');
      assert(Prototype.Browser.Gecko);
    }
  });
});