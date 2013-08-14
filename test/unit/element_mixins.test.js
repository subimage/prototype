Form.Element.Methods.coffee = Prototype.K;
Element.addMethods();

suite("Element Mixins",function(){
  test("<input /> Elements ", function() {
    assert($("input").present != null);
    assert(typeof $("input").present == 'function');
    assert($("input").select != null);
    assertRespondsTo('present', Form.Element);
    assertRespondsTo('present', Form.Element.Methods);
    assertRespondsTo('coffee', $('input'));
    assert.strictEqual(Prototype.K, Form.Element.coffee);
    assert.strictEqual(Prototype.K, Form.Element.Methods.coffee);
  });
  
  test("Form Elements", function() {
    assert($("form").reset != null);
    assert($("form").getInputs().length == 2);
  });
  
  test("Events", function() {
    assert($("form").observe != null)
    // Can't really test this one with TestUnit...
    $('form').observe("submit", function(e) { 
      alert("yeah!"); 
      Event.stop(e); 
    });
  });
  
  test("Collections of elements", function() {
    assert($$("input").all(function(input) {
      return (input.focus != null);
    }));
  });
});