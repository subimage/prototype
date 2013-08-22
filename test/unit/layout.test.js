function isDisplayed(element) {
  var originalElement = element;
  
  while (element && element.parentNode) {
    var display = element.getStyle('display');
    if (display === 'none') {
      return false;
    }
    element = $(element.parentNode);
  }    
  return true;
}

suite("Layout Namespace",function(){
  test("preCompute argument of layout", function() {
    var preComputedLayout = $('box1').getLayout(true),
        normalLayout = $('box1').getLayout();
    
    // restore normal get method from Hash object
    preComputedLayout.get = Hash.prototype.get;
    
    Element.Layout.PROPERTIES.each(function(key) {
      assert.equal(normalLayout.get(key), preComputedLayout.get(key), key);
    });
  });
  test("layout on absolutely-positioned elements", function() {
    var layout = $('box1').getLayout();
    
    assert.equal(242, layout.get('width'),  'width' );
    assert.equal(555, layout.get('height'), 'height');
    
    assert.equal(3, layout.get('border-left'), 'border-left');    
    assert.equal(10, layout.get('padding-top'), 'padding-top');
    assert.equal(1020, layout.get('top'), 'top');
    
    assert.equal(25, layout.get('left'), 'left');  
  });
  
  test("layout on elements with display: none and exact width", function() {
    var layout = $('box2').getLayout();
    
    assert(!isDisplayed($('box2')), 'box should be hidden');

    assert.equal(500, layout.get('width'),            'width');
    assert.equal(  3, layout.get('border-right'),     'border-right');
    assert.equal( 10, layout.get('padding-bottom'),   'padding-bottom');    
    assert.equal(526, layout.get('border-box-width'), 'border-box-width');

    assert(!isDisplayed($('box2')), 'box should still be hidden');
  });
  
  test("layout on elements with negative margins", function() {
    var layout = $('box_with_negative_margins').getLayout();

    assert.equal(-10, layout.get('margin-top')  );
    assert.equal( -3, layout.get('margin-left') );
    assert.equal(  2, layout.get('margin-right'));
  });
  
  test("layout on elements with display: none and width: auto", function() {
    var layout = $('box3').getLayout();
    
    assert(!isDisplayed($('box3')), 'box should be hidden');
    
    assert.equal(364, layout.get('width'),            'width');
    assert.equal(400, layout.get('margin-box-width'), 'margin-box-width');
    assert.equal(390, layout.get('border-box-width'), 'border-box-width');
    assert.equal(3,   layout.get('border-right'),     'border-top');
    assert.equal(10,  layout.get('padding-bottom'),   'padding-right');

    // Ensure that we cleaned up after ourselves.
    assert(!isDisplayed($('box3')), 'box should still be hidden');
  });
  
  test("layout on elements with display: none ancestors",function() {
    var layout = $('box4').getLayout();
    
    assert(!isDisplayed($('box4')), 'box should be hidden');
    
    // Width and height values are nonsensical for deeply-hidden elements.
    assert.equal(0, layout.get('width'), 'width of a deeply-hidden element should be 0');
    assert.equal(0, layout.get('margin-box-height'), 'height of a deeply-hidden element should be 0');
    
    // But we can still get meaningful values for other measurements.
    assert.equal(0, layout.get('border-right'), 'border-top');
    assert.equal(13, layout.get('padding-bottom'), 'padding-right');
    
    // Ensure that we cleaned up after ourselves.
    assert(!isDisplayed($('box4')), 'box should still be hidden');
  });
  
  test("positioning on absolutely-positioned elements", function() {
    var layout = $('box5').getLayout();
    
    assert.equal(30, layout.get('top'), 'top');
    assert.equal(60, layout.get('right'), 'right (percentage value)');
    
    assert.equal(340, layout.get('left'), 'left');
  });
  
  test("positioning on absolutely-positioned element with top=0 and left=0", function() {
    var layout = $('box6').getLayout();
    
    assert.equal(0, layout.get('top'), 'top');
    assert.strictEqual($('box6_parent'), $('box6').getOffsetParent());
  });
  
  test("layout on statically-positioned element with percentage width", function() {
    var layout = $('box7').getLayout();
    
    assert.equal(150, layout.get('width'));
  });

  test("layout on absolutely-positioned element with percentage width", function() {
    var layout = $('box8').getLayout();
    
    assert.equal(150, layout.get('width'));
  });
  
  test("layout on fixed-position element with percentage width", function() {
    var viewportWidth = document.viewport.getWidth();
    var layout = $('box9').getLayout();
    
    info("NOTE: IE6 WILL fail these tests because it doesn't support position: fixed. This is expected.");
    
    function assertNear(v1, v2, message) {
      var abs = Math.abs(v1 - v2);
      assert(abs <= 1, message + ' (actual: ' + v1 + ', ' + v2 + ')');
    }
    
    // With percentage widths, we'll occasionally run into rounding
    // discrepancies. Assert that the values agree to within 1 pixel.
    var vWidth = viewportWidth / 4, eWidth = $('box9').measure('width');
    assertNear.call(this, vWidth, eWidth, 'width (visible)');
            
    $('box9').hide();    
    assertNear.call(this, vWidth, $('box9').measure('width'), 'width (hidden)');   
    $('box9').show();
  });
  
  test("#toCSS, #toObject, #toHash", function() {
    var layout = $('box6').getLayout();
    var top = layout.get('top');
    
    var cssObject = layout.toCSS('top');

    assert('top' in cssObject,
     "layout object should have 'top' property");
     
    cssObject = layout.toCSS('top left bottom');
    
    $w('top left bottom').each( function(prop) {
      assert(prop in cssObject, "layout object should have '" + 
       prop + "' property");
    }, this);
    
    var obj = layout.toObject('top');
    assert('top' in obj,
     "object should have 'top' property");
  });

  test("dimensions on absolutely-positioned, hidden elements", function() {
    var layout = $('box10').getLayout();
    
    assert.equal(278, layout.get('width'),  'width' );
    assert.equal(591, layout.get('height'), 'height');
  });
});
