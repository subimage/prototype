var testVar = 'to be updated';

suite("Position Namespace",function(){
  
  setup(function() {
    scrollTo(0,0);
    Position.prepare();
    Position.includeScrollOffsets = false;
  });
  
  teardown(function() {
    scrollTo(0,0);
    Position.prepare();
    Position.includeScrollOffsets = false;
  });
  
  test("Prepare", function() {
    Position.prepare();
    assert.equal(0, Position.deltaX);
    assert.equal(0, Position.deltaY);
    scrollTo(20,30);
    Position.prepare();
    assert.equal(20, Position.deltaX);
    assert.equal(30, Position.deltaY);
  });
  
  test("Within", function() {
    [true, false].each(function(withScrollOffsets) {
      Position.includeScrollOffsets = withScrollOffsets;
      assert(!Position.within($('body_absolute'), 9, 9), 'outside left/top');
      assert(Position.within($('body_absolute'), 10, 10), 'left/top corner');
      assert(Position.within($('body_absolute'), 10, 19), 'left/bottom corner');
      assert(!Position.within($('body_absolute'), 10, 20), 'outside bottom');
    });
    
    scrollTo(20,30);
    Position.prepare();
    Position.includeScrollOffsets = true;
    assert(!Position.within($('body_absolute'), 9, 9), 'outside left/top');
    assert(Position.within($('body_absolute'), 10, 10), 'left/top corner');
    assert(Position.within($('body_absolute'), 10, 19), 'left/bottom corner');
    assert(!Position.within($('body_absolute'), 10, 20), 'outside bottom');
  });
});