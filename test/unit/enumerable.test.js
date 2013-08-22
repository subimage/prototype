var Fixtures = {
  People: [
    {name: 'Sam Stephenson',    nickname: 'sam-'},
    {name: 'Marcel Molina Jr.', nickname: 'noradio'},
    {name: 'Scott Barron',      nickname: 'htonl'},
    {name: 'Nicholas Seckar',   nickname: 'Ulysses'}
  ],
  
  Nicknames: $w('sam- noradio htonl Ulysses'),
  
  Basic: [1, 2, 3],
  
  Primes: [
     1,  2,  3,  5,  7,  11, 13, 17, 19, 23,
    29, 31, 37, 41, 43,  47, 53, 59, 61, 67,
    71, 73, 79, 83, 89,  97
  ],
  
  Z: []
};

for (var i = 1; i <= 100; i++)
  Fixtures.Z.push(i);

function prime(value) {
  for (var i = 2; i < value; i++)
    if (value % i == 0) return false;
  return true;
}

suite("Enumerable Namespace",function(){
  test(".each() Break", function() {
    var result = 0;
    Fixtures.Basic.each(function(value) {
      if ((result = value) == 2) throw $break;
    });
    
    assert(2 === result);
  });
  
  test(".each() return Acts As Continue",function() {
    var results = [];
    Fixtures.Basic.each(function(value) {
    if (value == 2) return;
      results.push(value);
    });

    assert('1, 3' === results.join(', '));
  });
  
  test(".each() passes value, index and collection to the iterator",function() {
    var i = 0;
    Fixtures.Basic.each(function(value, index, collection) {
      assert(Fixtures.Basic[i] === value);
      assert(i === index);
      assert(Fixtures.Basic === collection);
      i++;
    });
  });
  
  test(".each() Chaining",function() {
    assert(Fixtures.Primes === Fixtures.Primes.each(Prototype.emptyFunction));
    assert(3 === Fixtures.Basic.each(Prototype.emptyFunction).length);
  });

  test("EnumContext",function() {
    var results = [];
    Fixtures.Basic.each(function(value) {
      results.push(value * this.i);
    }, { i: 2 });
    
    assert('2 4 6' === results.join(' '));

    assert(Fixtures.Basic.all(function(value){
      return value >= this.min && value <= this.max;
    }, { min: 1, max: 3 }));
    assert(!Fixtures.Basic.all(function(value){
      return value >= this.min && value <= this.max;
    }));
    assert(Fixtures.Basic.any(function(value){
      return value == this.target_value;
    }, { target_value: 2 }));
  });

  test(".any() method", function() {
    assert(!([].any()));
    
    assert([true, true, true].any());
    assert([true, false, false].any());
    assert(![false, false, false].any());
    
    assert(Fixtures.Basic.any(function(value) {
      return value > 2;
    }));
    assert(!Fixtures.Basic.any(function(value) {
      return value > 5;
    }));
  });
  
  test(".any() passes value, index and collection to the iterator", function() {
    var i = 0;
    Fixtures.Basic.any(function(value, index, collection) {
      assert(Fixtures.Basic[i] === value);
      assert(i === index);
      assert(Fixtures.Basic === collection);
      i++;
      
      // Iterate over all values
      return value > 5;
    });
  });
  
  test(".all() method",function() {
    assert([].all());
    
    assert([true, true, true].all());
    assert(![true, false, false].all());
    assert(![false, false, false].all());

    assert(Fixtures.Basic.all(function(value) {
      return value > 0;
    }));
    assert(!Fixtures.Basic.all(function(value) {
      return value > 1;
    }));
  });
  
  test(".all() passes value, index and collection to the iterator", function() {
    var i = 0;
    Fixtures.Basic.all(function(value, index, collection) {
      assert(Fixtures.Basic[i] === value);
      assert(i === index);
      assert(Fixtures.Basic === collection);
      i++;
      
      // Iterate over all values
      return value > 0;
    });
  });
  
  test(".collect() method",function() {
    assert(Fixtures.Nicknames.join(', ') === 
      Fixtures.People.collect(function(person) {
        return person.nickname;
      }).join(", "));
    
    assert(26 === Fixtures.Primes.map().length);
  });
  
  test(".collect() passes value, index and collection to the iterator", function() {
    var i = 0;
    Fixtures.Basic.collect(function(value, index, collection) {
      assert(Fixtures.Basic[i] === value);
      assert(i === index);
      assert(Fixtures.Basic === collection);
      i++;
      return value;
    });
  });
  
  test(".detect() method",function() {
    assert('Marcel Molina Jr.' ===
      Fixtures.People.detect(function(person) {
        return person.nickname.match(/no/);
      }).name);
  });
  
  test(".detect() passes value, index and collection to the iterator", function() {
    var i = 0;
    Fixtures.Basic.detect(function(value, index, collection) {
      assert(Fixtures.Basic[i] === value);
      assert(i === index);
      assert(Fixtures.Basic === collection);
      i++;
      
      // Iterate over all values
      return value > 5;
    });
  });
  
  test(".eachSlice() method",function() {
    assert.deepEqual([], [].eachSlice(2));
    assert(1 === [1].eachSlice(1).length);
    assert.deepEqual([1], [1].eachSlice(1)[0]);
    assert(2 === Fixtures.Basic.eachSlice(2).length);
    assert.deepEqual(
      [3, 2, 1, 11, 7, 5, 19, 17, 13, 31, 29, 23, 43, 41, 37, 59, 53, 47, 71, 67, 61, 83, 79, 73, 97, 89],
      Fixtures.Primes.eachSlice( 3, function(slice){ return slice.reverse() }).flatten()
    );
    assert.deepEqual(Fixtures.Basic, Fixtures.Basic.eachSlice(-10));
    assert.deepEqual(Fixtures.Basic, Fixtures.Basic.eachSlice(0));
    assert(Fixtures.Basic !== Fixtures.Basic.eachSlice(0));
  });
  
  test(".each() With Index",function() {
    var nicknames = [], indexes = [];
    Fixtures.People.each(function(person, index) {
      nicknames.push(person.nickname);
      indexes.push(index);
    });
    
    assert(Fixtures.Nicknames.join(', ') === 
      nicknames.join(', '));
    assert('0, 1, 2, 3' === indexes.join(', '));
  });
  
  test(".findAll() method",function() {
    assert(Fixtures.Primes.join(', ') === 
      Fixtures.Z.findAll(prime).join(', '));
  });
  
  test(".findAll() passes value, index and collection to the iterator",function() {
    var i = 0;
    Fixtures.Basic.findAll(function(value, index, collection) {
      assert(Fixtures.Basic[i] === value);
      assert(i === index);
      assert(Fixtures.Basic === collection);
      i++;
      return value > 5;
    });
  });
  
  test(".grep()",function() {
    assert('noradio, htonl' === Fixtures.Nicknames.grep(/o/).join(", "));
      
    assert('NORADIO, HTONL' ===
      Fixtures.Nicknames.grep(/o/, function(nickname) {
        return nickname.toUpperCase();
      }).join(", "))

    // assert.deepEqual($('grepHeader', 'grepCell'),
    //   $('grepTable', 'grepTBody', 'grepRow', 'grepHeader', 'grepCell').grep(new Selector('.cell')));

    // troublesome characters
    assert.deepEqual(['?a', 'c?'], ['?a','b','c?'].grep('?'));
    assert.deepEqual(['*a', 'c*'], ['*a','b','c*'].grep('*'));
    assert.deepEqual(['+a', 'c+'], ['+a','b','c+'].grep('+'));
    assert.deepEqual(['{1}a', 'c{1}'], ['{1}a','b','c{1}'].grep('{1}'));
    assert.deepEqual(['(a', 'c('], ['(a','b','c('].grep('('));
    assert.deepEqual(['|a', 'c|'], ['|a','b','c|'].grep('|'));
  });
  
  test(".grep() passes value, index and collection to the iterator", function() {
    var i = 0;
    Fixtures.Basic.grep(/\d/, function(value, index, collection) {
      assert.strictEqual(value,Fixtures.Basic[i]);
      assert.strictEqual(index, i);
      assert.strictEqual(collection,Fixtures.Basic);
      i++;
      return value;
    }, this);
  });
  
  // testInclude: function() {
  //   this.assert(Fixtures.Nicknames.include('sam-'));
  //   this.assert(Fixtures.Nicknames.include('noradio'));
  //   this.assert(!Fixtures.Nicknames.include('gmosx'));
  //   this.assert(Fixtures.Basic.include(2));
  //   this.assert(Fixtures.Basic.include('2'));
  //   this.assert(!Fixtures.Basic.include('4'));
  // },
  
  // testInGroupsOf: function() {
  //   this.assertEnumEqual([], [].inGroupsOf(3));
    
  //   var arr = [1, 2, 3, 4, 5, 6].inGroupsOf(3);
  //   this.assertEqual(2, arr.length);
  //   this.assertEnumEqual([1, 2, 3], arr[0]);
  //   this.assertEnumEqual([4, 5, 6], arr[1]);
    
  //   arr = [1, 2, 3, 4, 5, 6].inGroupsOf(4);
  //   this.assertEqual(2, arr.length);
  //   this.assertEnumEqual([1, 2, 3, 4], arr[0]);
  //   this.assertEnumEqual([5, 6, null, null], arr[1]);
    
  //   var basic = Fixtures.Basic
    
  //   arr = basic.inGroupsOf(4,'x');
  //   this.assertEqual(1, arr.length);
  //   this.assertEnumEqual([1, 2, 3, 'x'], arr[0]);
    
  //   this.assertEnumEqual([1,2,3,'a'], basic.inGroupsOf(2, 'a').flatten());

  //   arr = basic.inGroupsOf(5, '');
  //   this.assertEqual(1, arr.length);
  //   this.assertEnumEqual([1, 2, 3, '', ''], arr[0]);

  //   this.assertEnumEqual([1,2,3,0], basic.inGroupsOf(2, 0).flatten());
  //   this.assertEnumEqual([1,2,3,false], basic.inGroupsOf(2, false).flatten());
  // },
  
  // testInject: function() {
  //   this.assertEqual(1061, 
  //     Fixtures.Primes.inject(0, function(sum, value) {
  //       return sum + value;
  //     }));
  // },
  
  // "test #inject passes memo, value, index and collection to the iterator": function() {
  //   var i = 0;
  //   Fixtures.Basic.inject(0, function(memo, value, index, collection) {
  //     this.assertIdentical(Fixtures.Basic[i], value);
  //     this.assertIdentical(i, index);
  //     this.assertIdentical(Fixtures.Basic, collection);
  //     i++;

  //     return memo + value;
  //   }, this);
  // },
  
  // testInvoke: function() {
  //   var result = [[2, 1, 3], [6, 5, 4]].invoke('sort');
  //   this.assertEqual(2, result.length);
  //   this.assertEqual('1, 2, 3', result[0].join(', '));
  //   this.assertEqual('4, 5, 6', result[1].join(', '));
    
  //   result = result.invoke('invoke', 'toString', 2);
  //   this.assertEqual('1, 10, 11', result[0].join(', '));
  //   this.assertEqual('100, 101, 110', result[1].join(', '));
  // },
  
  // testMax: function() {
  //   this.assertEqual(100, Fixtures.Z.max());
  //   this.assertEqual(97, Fixtures.Primes.max());
  //   this.assertEqual(2, [ -9, -8, -7, -6, -4, -3, -2,  0, -1,  2 ].max());
  //   this.assertEqual('sam-', Fixtures.Nicknames.max()); // ?s > ?U
  // },
  
  // "test #max passes value, index and collection to the iterator": function() {
  //   var i = 0;
  //   Fixtures.Basic.max(function(value, index, collection) {
  //     this.assertIdentical(Fixtures.Basic[i], value);
  //     this.assertIdentical(i, index);
  //     this.assertIdentical(Fixtures.Basic, collection);
  //     i++;
  //     return value;
  //   }, this);
  // },
  
  // testMin: function() {
  //   this.assertEqual(1, Fixtures.Z.min());
  //   this.assertEqual(0, [  1, 2, 3, 4, 5, 6, 7, 8, 0, 9 ].min());
  //   this.assertEqual('Ulysses', Fixtures.Nicknames.min()); // ?U < ?h
  // },
  
  // "test #min passes value, index and collection to the iterator": function() {
  //   var i = 0;
  //   Fixtures.Basic.min(function(value, index, collection) {
  //     this.assertIdentical(Fixtures.Basic[i], value);
  //     this.assertIdentical(i, index);
  //     this.assertIdentical(Fixtures.Basic, collection);
  //     i++;
  //     return value;
  //   }, this);
  // },
  
  // testPartition: function() {
  //   var result = Fixtures.People.partition(function(person) {
  //     return person.name.length < 15;
  //   }).invoke('pluck', 'nickname');
    
  //   this.assertEqual(2, result.length);
  //   this.assertEqual('sam-, htonl', result[0].join(', '));
  //   this.assertEqual('noradio, Ulysses', result[1].join(', '));
  // },
  
  // "test #partition passes value, index and collection to the iterator": function() {
  //   var i = 0;
  //   Fixtures.Basic.partition(function(value, index, collection) {
  //     this.assertIdentical(Fixtures.Basic[i], value);
  //     this.assertIdentical(i, index);
  //     this.assertIdentical(Fixtures.Basic, collection);
  //     i++;
  //     return value < 2;
  //   }, this);
  // },
  
  // testPluck: function() {
  //   this.assertEqual(Fixtures.Nicknames.join(', '),
  //     Fixtures.People.pluck('nickname').join(', '));
  // },
  
  // testReject: function() {
  //   this.assertEqual(0, 
  //     Fixtures.Nicknames.reject(Prototype.K).length);
      
  //   this.assertEqual('sam-, noradio, htonl',
  //     Fixtures.Nicknames.reject(function(nickname) {
  //       return nickname != nickname.toLowerCase();
  //     }).join(', '));
  // },
  
  // "test #reject passes value, index and collection to the iterator": function() {
  //   var i = 0;
  //   Fixtures.Basic.reject(function(value, index, collection) {
  //     this.assertIdentical(Fixtures.Basic[i], value);
  //     this.assertIdentical(i, index);
  //     this.assertIdentical(Fixtures.Basic, collection);
  //     i++;
  //     return value < 2;
  //   }, this);
  // },
  
  // testSortBy: function() {
  //   this.assertEqual('htonl, noradio, sam-, Ulysses',
  //     Fixtures.People.sortBy(function(value) {
  //       return value.nickname.toLowerCase();
  //     }).pluck('nickname').join(', '));
  // },
  
  // "test #sortBy passes value, index and collection to the iterator": function() {
  //   var i = 0;
  //   Fixtures.Basic.sortBy(function(value, index, collection) {
  //     this.assertIdentical(Fixtures.Basic[i], value);
  //     this.assertIdentical(i, index);
  //     this.assertIdentical(Fixtures.Basic, collection);
  //     i++;
  //     return value;
  //   }, this);
  // },
  
  // testToArray: function() {
  //   var result = Fixtures.People.toArray();
  //   this.assert(result != Fixtures.People); // they're different objects...
  //   this.assertEqual(Fixtures.Nicknames.join(', '),
  //     result.pluck('nickname').join(', ')); // but the values are the same
  // },
  
  // testZip: function() {
  //   var result = [1, 2, 3].zip([4, 5, 6], [7, 8, 9]);
  //   this.assertEqual('[[1, 4, 7], [2, 5, 8], [3, 6, 9]]', result.inspect());
    
  //   result = [1, 2, 3].zip([4, 5, 6], [7, 8, 9], function(array) { return array.reverse() });
  //   this.assertEqual('[[7, 4, 1], [8, 5, 2], [9, 6, 3]]', result.inspect());
  // },
  
  // testSize: function() {
  //   this.assertEqual(4, Fixtures.People.size());
  //   this.assertEqual(4, Fixtures.Nicknames.size());
  //   this.assertEqual(26, Fixtures.Primes.size());
  //   this.assertEqual(0, [].size());
  // }
});