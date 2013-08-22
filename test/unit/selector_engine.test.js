/*
<div id="test_div_parent" class="test_class">
  <div id="test_div_child" class="test_class">
  </div>
</div>
*/

suite("Selector Engine Test",function(){
  test("Engine", function() {
    assert(Prototype.Selector.engine);
  });
  
  test("Select", function() {
    var elements = Prototype.Selector.select('.test_class');
    
    assert(Object.isArray(elements));
    assert.equal(2, elements.length);
    assert.equal('test_div_parent', elements[0].id);
    assert.equal('test_div_child', elements[1].id);
  });
  
  test("Select With Context", function() {
    var elements = Prototype.Selector.select('.test_class', $('test_div_parent'));
    
    assert(Object.isArray(elements));
    assert.equal(1, elements.length);
    assert.equal('test_div_child', elements[0].id);
  });
  
  test("Select With Empty Result", function() {
    var elements = Prototype.Selector.select('.non_existent');
    
    assert(Object.isArray(elements));
    assert.equal(0, elements.length);
  });
  
  test("Match", function() {
    var element = $('test_div_parent');
    
    assert.equal(true, Prototype.Selector.match(element, '.test_class'));
    assert.equal(false, Prototype.Selector.match(element, '.non_existent'));
  });
  
  test("Find", function() {
    var elements = document.getElementsByTagName('*'),
        expression = '.test_class';
    assert.equal('test_div_parent', Prototype.Selector.find(elements, expression).id);
    assert.equal('test_div_child', Prototype.Selector.find(elements, expression, 1).id);
  });
});