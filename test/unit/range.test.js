suite("Range Namespace",function(){
  
  test(".include()", function() {
    assert(!$R(0, 0, true).include(0));
    assert($R(0, 0, false).include(0));

    assert($R(0, 5, true).include(0));
    assert($R(0, 5, true).include(4));
    assert(!$R(0, 5, true).include(5));

    assert($R(0, 5, false).include(0));
    assert($R(0, 5, false).include(5));
    assert(!$R(0, 5, false).include(6));
  });

  test(".each()", function() {
    var results = [];
    $R(0, 0, true).each(function(value) {
      results.push(value);
    });

    assertenum([], results);

    results = [];
    $R(0, 3, false).each(function(value) {
      results.push(value);
    });

    assertenum([0, 1, 2, 3], results);

    results = [];
    $R(2, 4, true).each(function(value, index) {
      results.push(index);
    });
    assertenum([0, 1], results);

  });

  test(".any()", function() {
    assert(!$R(1, 1, true).any());
    assert($R(0, 3, false).any(function(value) {
      return value == 3;
    }));
  });

  test(".all()", function() {
    assert($R(1, 1, true).all());
    assert($R(0, 3, false).all(function(value) {
      return value <= 3;
    }));
  });

  test(".toArray()", function() {
    assertenum([], $R(0, 0, true).toArray());
    assertenum([0], $R(0, 0, false).toArray());
    assertenum([0], $R(0, 1, true).toArray());
    assertenum([0, 1], $R(0, 1, false).toArray());
    assertenum([-3, -2, -1, 0, 1, 2], $R(-3, 3, true).toArray());
    assertenum([-3, -2, -1, 0, 1, 2, 3], $R(-3, 3, false).toArray());
  });
  
  test("Defaults To Not Exclusive", function() {
    assertenum($R(-3,3).toArray(), $R(-3,3,false).toArray());
  });
});