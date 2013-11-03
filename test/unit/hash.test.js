var HashFixtures = {
  one: { a: 'A#' },
  
  many: {
    a: 'A',
    b: 'B',
    c: 'C',
    d: 'D#'
  },

  functions: {
    quad: function(n) { return n*n },
    plus: function(n) { return n+n }
  },
  
  multiple:         { color: $w('r g b') },
  multiple_nil:     { color: ['r', null, 'g', undefined, 0] },
  multiple_all_nil: { color: [null, undefined] },
  multiple_empty:   { color: [] },
  multiple_special: { 'stuff[]': $w('$ a ;') },

  value_undefined:  { a:"b", c:undefined },
  value_null:       { a:"b", c:null },
  value_zero:       { a:"b", c:0 }
};


suite("Hash Namespace",function(){
  test("Hash.set()", function() {
    var h = $H({a: 'A'})

    assert.equal('B', h.set('b', 'B'));
    assertHashEqual({a: 'A', b: 'B'}, h);
    
    assert.isUndefined(h.set('c'));
    assertHashEqual({a: 'A', b: 'B', c: undefined}, h);
  });

  test("Hash.get()", function() {
    var h = $H({a: 'A'});
    assert.equal('A', h.get('a'));
    assert.isUndefined(h.a);
    assert.isUndefined($H({}).get('a'));

    assert.isUndefined($H({}).get('toString'));
    assert.isUndefined($H({}).get('constructor'));
  });
  
  test("Hash.unset()", function() {
    var hash = $H(HashFixtures.many);
    assert.equal('B', hash.unset('b'));
    assertHashEqual({a:'A', c: 'C', d:'D#'}, hash);
    assert.isUndefined(hash.unset('z'));
    assertHashEqual({a:'A', c: 'C', d:'D#'}, hash);
    // not equivalent to Hash#remove
    assert.equal('A', hash.unset('a', 'c'));
    assertHashEqual({c: 'C', d:'D#'}, hash);
  });
  
  test("Hash.toObject", function() {
    var hash = $H(HashFixtures.many), object = hash.toObject();
    assert.isInstanceOf(object,Object);
    assertHashEqual(HashFixtures.many, object);
    assert.notStrictEqual(HashFixtures.many, object);
    hash.set('foo', 'bar');
    assertHashNotEqual(object, hash.toObject());
  });
  
  test("Hash.construct()", function() {
    var object = Object.clone(HashFixtures.one);
    var h = new Hash(object), h2 = $H(object);
    assert.isInstanceOf(h,Hash);
    assert.isInstanceOf(h2,Hash);
    
    assertHashEqual({}, new Hash());
    assertHashEqual(object, h);
    assertHashEqual(object, h2);
    
    h.set('foo', 'bar');
    assertHashNotEqual(object, h);
    
    var clone = $H(h);
    assert.isInstanceOf(clone,Hash);
    assertHashEqual(h, clone);
    h.set('foo', 'foo');
    assertHashNotEqual(h, clone);
    assert.strictEqual($H, Hash.from);
  });
  
  test("Hash.keys()", function() {
    assertenum([],               $H({}).keys());
    assertenum(['a'],            $H(HashFixtures.one).keys());
    assertenum($w('a b c d'),    $H(HashFixtures.many).keys().sort());
    assertenum($w('plus quad'),  $H(HashFixtures.functions).keys().sort());
  });
  
  test("Hash.values()", function() {
    assertenum([],             $H({}).values());
    assertenum(['A#'],         $H(HashFixtures.one).values());
    assertenum($w('A B C D#'), $H(HashFixtures.many).values().sort());
    assertenum($w('function function'),
      $H(HashFixtures.functions).values().map(function(i){ return typeof i }));
    assert.equal(9, $H(HashFixtures.functions).get('quad')(3));
    assert.equal(6, $H(HashFixtures.functions).get('plus')(3));
  });
  
  test("Hash.index()", function() {
    assert.isUndefined($H().index('foo'));
    
    assert('a', $H(HashFixtures.one).index('A#'));
    assert('a', $H(HashFixtures.many).index('A'));
    assert.isUndefined($H(HashFixtures.many).index('Z'))
  
    var hash = $H({a:1,b:'2',c:1});
    assert(['a','c'].include(hash.index(1)));
    assert.isUndefined(hash.index('1'));
  });
    
  test("Hash.merge()", function() {
    var h = $H(HashFixtures.many);
    assert.notStrictEqual(h, h.merge());
    assert.notStrictEqual(h, h.merge({}));
    assert.isInstanceOf(h.merge(),Hash);
    assert.isInstanceOf(h.merge({}),Hash);
    assertHashEqual(h, h.merge());
    assertHashEqual(h, h.merge({}));
    assertHashEqual(h, h.merge($H()));
    assertHashEqual({a:'A',  b:'B', c:'C', d:'D#', aaa:'AAA' }, h.merge({aaa: 'AAA'}));
    assertHashEqual({a:'A#', b:'B', c:'C', d:'D#' }, h.merge(HashFixtures.one));
  });
  
  test("Hash.update()", function() {
    var h = $H(HashFixtures.many);
    assert.strictEqual(h, h.update());
    assert.strictEqual(h, h.update({}));
    assertHashEqual(h, h.update());
    assertHashEqual(h, h.update({}));
    assertHashEqual(h, h.update($H()));
    assertHashEqual({a:'A',  b:'B', c:'C', d:'D#', aaa:'AAA' }, h.update({aaa: 'AAA'}));
    assertHashEqual({a:'A#', b:'B', c:'C', d:'D#', aaa:'AAA' }, h.update(HashFixtures.one));
  });
  
  test("Hash.toQueryString",function() {
    assert.equal('',                   $H({}).toQueryString());
    assert.equal('a%23=A',             $H({'a#': 'A'}).toQueryString());
    assert.equal('a=A%23',             $H(HashFixtures.one).toQueryString());
    assert.equal('a=A&b=B&c=C&d=D%23', $H(HashFixtures.many).toQueryString());
    assert.equal("a=b&c",              $H(HashFixtures.value_undefined).toQueryString());
    assert.equal("a=b&c",              $H("a=b&c".toQueryParams()).toQueryString());
    assert.equal("a=b+d&c",            $H("a=b+d&c".toQueryParams()).toQueryString());
    assert.equal("a=b&c=",             $H(HashFixtures.value_null).toQueryString());
    assert.equal("a=b&c=0",            $H(HashFixtures.value_zero).toQueryString());
    assert.equal("color=r&color=g&color=b", $H(HashFixtures.multiple).toQueryString());
    assert.equal("color=r&color=&color=g&color&color=0", $H(HashFixtures.multiple_nil).toQueryString());
    assert.equal("color=&color",       $H(HashFixtures.multiple_all_nil).toQueryString());
    assert.equal("",                   $H(HashFixtures.multiple_empty).toQueryString());
    assert.equal("",                   $H({foo: {}, bar: {}}).toQueryString());
    assert.equal("stuff%5B%5D=%24&stuff%5B%5D=a&stuff%5B%5D=%3B", $H(HashFixtures.multiple_special).toQueryString());
    assertHashEqual(HashFixtures.multiple_special, $H(HashFixtures.multiple_special).toQueryString().toQueryParams());
    assert.strictEqual(Object.toQueryString, Hash.toQueryString);
    
    // Serializing newlines and spaces is weird. See:
    // http://www.w3.org/TR/1999/REC-html401-19991224/interact/forms.html#h-17.13.4.1
    var complex = "an arbitrary line\n\'something in single quotes followed by a newline\'\r\n" +
     "and more text eventually";
    var queryString = $H({ val: complex }).toQueryString();
    var expected = "val=an+arbitrary+line%0D%0A'something+in+single+quotes+followed+by+a+" + 
     "newline'%0D%0Aand+more+text+eventually";
    assert.equal(expected, queryString, "newlines and spaces should be properly encoded");
  });
  
  test("Hash.inspect()", function() {
    assert.equal('#<Hash:{}>',              $H({}).inspect());
    assert.equal("#<Hash:{'a': 'A#'}>",     $H(HashFixtures.one).inspect());
    assert.equal("#<Hash:{'a': 'A', 'b': 'B', 'c': 'C', 'd': 'D#'}>", $H(HashFixtures.many).inspect());
  });

  test("Hash.clone()", function() {
    var h = $H(HashFixtures.many);
    assertHashEqual(h, h.clone());
    assert.isInstanceOf(h.clone(),Hash);
    assert.notStrictEqual(h, h.clone());
  });
  
  test("Hash.toJSON()", function() {
    assert.equal('{\"b\":[null,false,true,null],\"c\":{\"a\":\"hello!\"}}',
      Object.toJSON({b: [undefined, false, true, undefined], c: {a: 'hello!'}}));
  });
  
  test("Hash.AbilityToContainAnyKey", function() {
    var h = $H({ _each: 'E', map: 'M', keys: 'K', pluck: 'P', unset: 'U' });
    assertenum($w('_each keys map pluck unset'), h.keys().sort());
    assert.equal('U', h.unset('unset'));
    assertHashEqual({ _each: 'E', map: 'M', keys: 'K', pluck: 'P' }, h);
  });
  
  test("Hash.toTemplateReplacements", function() {
    var template = new Template("#{a} #{b}"), hash = $H({ a: "hello", b: "world" });
    assert.equal("hello world", template.evaluate(hash.toObject()));
    assert.equal("hello world", template.evaluate(hash));
    assert.equal("hello", "#{a}".interpolate(hash));
  });
  
  test("Prevent Iteration Over Shadowed Properties", function() {
    // redundant now that object is systematically cloned.
    var FooMaker = function(value) {
      this.key = value;
    };
    FooMaker.prototype.key = 'foo';
    var foo = new FooMaker('bar');
    assert.equal("key=bar", new Hash(foo).toQueryString());
    assert.equal("key=bar", new Hash(new Hash(foo)).toQueryString());
  });

  test("Iteration With each()", function()  {
    var h = $H({a:1, b:2});
    var result = []
    h.each(function(kv, i){
      result.push(i);
    });
   assertenum([0,1], result);
  });
  
});