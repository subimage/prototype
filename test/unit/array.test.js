var globalArgsTest = 'nothing to see here';

suite('Array Namespace',function(){

	test('$A({}) should equal []',function(){
		assertenum([], $A({}),"$A({}) != []")
	});
	
	test('use $A() on function arguments',function(){
		function toArrayOnArguments(){
			globalArgsTest = $A(arguments);
		}
		toArrayOnArguments();
		assertenum([],globalArgsTest,"globalArgsTest != []");
		toArrayOnArguments('foo');
		assertenum(['foo'],globalArgsTest,"globalArgsTest != ['foo']");
		toArrayOnArguments('foo','bar');
		assertenum(['foo','bar'],globalArgsTest,"globalArgsTest != ['foo','bar']");
	});

	test('use $A() On NodeList',function(){
		// direct HTML
		assert(0 === $A($('testfixture').childNodes).length,"HTML childNodes length != 0");
		
		// DOM
		var element = document.createElement('div');
		element.appendChild(document.createTextNode('22'));
		(2).times(function(){ element.appendChild(document.createElement('span')) });
		assert(3 === $A(element.childNodes).length,"DOM childNodes length != 3");
		
		// HTML String
		element = document.createElement('div');
		$(element).update('22<span></span><span></span');
		assert(3 === $A(element.childNodes).length,"String childNodes length != 3");
	});
	
	test("use $A() On Primitive values",function() {
		assertenum(['a', 'b', 'c'], $A('abc'));
		assertenum([], $A(''));
		assertenum([], $A(null));
		assertenum([], $A(undefined));
		assertenum([], $A());
		assertenum([], $A(5));
		assertenum([], $A(true));
	});
	suite('Instance Methods',function(){
		test(".clear() method",function(){
			assertenum([], [].clear());
			assertenum([], [1].clear());
			assertenum([], [1,2].clear());
		});
		
		test(".clone() method",function(){
			assertenum([], [].clone());
			assertenum([1], [1].clone());
			assertenum([1,2], [1,2].clone());
			assertenum([0,1,2], [0,1,2].clone());
			var a = [0,1,2];
			var b = a;
			assertenum(a, b);
			b = a.clone();
			try{
				assertenum(a, b)
			} catch (e) {
				assert(e,"Error not thrown")
			}
		});
		
		test(".first() method",function(){
			assert([].first() === undefined,"[].first() != undefined");
			assert(1 === [1].first(),"[1].first() != 1");
			assert(1 === [1,2].first(),"[1,2].first() != 1");
		});
		
		test(".last() method",function(){
			assert([].last() === undefined,"[].last() != undefined");
			assert(1 === [1].last(),"[1].last() != 1");
			assert(2 === [1,2].last(),"[1,2].last() != 2");
		});
		
		test(".compact() method",function(){
			assertenum([],[].compact(),"[] != [].compact()");
			assertenum([1,2,3], [1,2,3].compact(),"[1,2,3] != [1,2,3].compact()");
			assertenum([0,1,2,3], [0,null,1,2,undefined,3].compact(),"[0,1,2,3] != [0,null,1,2,undefined,3].compact()");
			assertenum([1,2,3], [null,1,2,3,null].compact(),"[1,2,3] != [null,1,2,3,null].compact()");
		});
		
		test(".flatten() method",function(){
			assertenum([],      [].flatten(),"[] != [].flatten()");
			assertenum([1,2,3], [1,2,3].flatten(),"[1,2,3] != [1,2,3].flatten()");
			assertenum([1,2,3], [1,[[[2,3]]]].flatten(),"[1,2,3] != [1,[[[2,3]]]].flatten()");
			assertenum([1,2,3], [[1],[2],[3]].flatten(),"[1,2,3] != [[1],[2],[3]].flatten()");
			assertenum([1,2,3], [[[[[[[1]]]]]],2,3].flatten(),"[1,2,3] != [[[[[[[1]]]]]],2,3].flatten()");
		});
		
		test(".indexOf() method",function(){
			assert(-1 === [].indexOf(1),"1 found in []");
			assert(-1 === [0].indexOf(1),"1 found in [0]");
			assert(0 === [1].indexOf(1),"1 not found in [1]");
			assert(1 === [0,1,2].indexOf(1),"[0,1,2].indexOf(1) != 1");
			assert(0 === [1,2,1].indexOf(1),"[1,2,1].indexOf(1) != 0");
			assert(2 === [1,2,1].indexOf(1, -1),"[1,2,1].indexOf(1, -1) != 2");
			assert(1 === [undefined,null].indexOf(null),"[undefined,null].indexOf(null) != 1");

			// ES5 compatibility tests.
			var undef;
			var array = [1, 2, 3, 4, 5, undef, 6, 7, 1, 2, 3];

			assert(2 === array.indexOf(3, -47),"large negative value for fromIndex");
			assert(10 === array.indexOf(3, 4));
			assert(10 === array.indexOf(3, -5))
			assert(2 === array.indexOf(3, {}),"nonsensical value for fromIndex");
			assert(2 === array.indexOf(3, ""),"nonsensical value for fromIndex");
			assert(-1 === array.indexOf(3, 41),"fromIndex value larger than the length of the array");
		});

		test(".lastIndexOf() method",function(){
			assert(-1 === [].lastIndexOf(1));
			assert(-1 === [0].lastIndexOf(1));
			assert(0 === [1].lastIndexOf(1));
			assert(2 === [0,2,4,6].lastIndexOf(4));
			assert(3 === [4,4,2,4,6].lastIndexOf(4));
			assert(3 === [0,2,4,6].lastIndexOf(6,3));
			assert(-1 === [0,2,4,6].lastIndexOf(6,2));
			assert(0 === [6,2,4,6].lastIndexOf(6,2));

			var fixture = [1,2,3,4,3];
			assert(4, fixture.lastIndexOf(3));
			assertenum([1,2,3,4,3],fixture);

			//tests from http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Objects:Array:lastIndexOf
			var array = [2, 5, 9, 2];
			assert(3 === array.lastIndexOf(2));
			assert(-1 === array.lastIndexOf(7));
			assert(3 === array.lastIndexOf(2,3));
			assert(0 === array.lastIndexOf(2,2));
			assert(0 === array.lastIndexOf(2,-2));
			assert(3 === array.lastIndexOf(2,-1));
		});
		
		test(".inspect() method",function(){
			assert('[]' === [].inspect());
			assert('[1]' === [1].inspect());
			assert('[\'a\']' === ['a'].inspect());
			assert('[\'a\', 1]' === ['a',1].inspect());
		});
		
		test(".intersect() method",function(){
			assertenum([1,3], [1,1,3,5].intersect([1,2,3]));
			assertenum([0,1], [0,1,2].intersect([0,1]));
			assertenum([1], [1,1].intersect([1,1]));
			assertenum([], [1,1,3,5].intersect([4]));
			assertenum([], [1].intersect(['1']));

			assertenum(
				['B','C','D'], 
				$R('A','Z').toArray().intersect($R('B','D').toArray())
			);
		});
		
		test(".reverse() method",function(){
			assertenum([], [].reverse());
			assertenum([1], [1].reverse());
			assertenum([2,1], [1,2].reverse());
			assertenum([3,2,1], [1,2,3].reverse());
		});
		
		test(".size() method", function(){
			assert(4 === [0, 1, 2, 3].size());
			assert(0 === [].size());
		});

		test(".uniq() method", function(){
			assertenum([1], [1, 1, 1].uniq());
			assertenum([1], [1].uniq());
			assertenum([], [].uniq());
			assertenum([0, 1, 2, 3], [0, 1, 2, 2, 3, 0, 2].uniq());
			assertenum([0, 1, 2, 3], [0, 0, 1, 1, 2, 3, 3, 3].uniq(true));
		});
		
		test(".without() method",function(){
			assertenum([], [].without(0));
			assertenum([], [0].without(0));
			assertenum([1], [0,1].without(0));
			assertenum([1,2], [0,1,2].without(0));
		});
		test(".concat() method", function() {
			var x = {};

			assert(1 === Array.prototype.concat.length);

			assertenum([0, 1],[0, 1].concat(),"test 2");
			assert(2 === [0, 1].concat().length, "test 3");

			assertenum([0, 1, 2, 3, 4],[].concat([0, 1], [2, 3, 4]),"test 4");
			assert(5 === [].concat([0, 1], [2, 3, 4]).length, "test 5");

			assertenum([0, x, 1, 2, true, "NaN"], [0].concat(x, [1, 2], true, "NaN"), "test 6");
			assert(6 === [0].concat(x, [1, 2], true, "NaN").length, "test 7");


			// These tests will fail in older IE because of the trailing comma.
			// Nothing we can do about that, so just skip them and let the user know.
			if ([,].length === 2)
			{

				console.log("NOTE: Old versions of IE don't like trailing commas in arrays. Skipping some tests.");
			}
			else
			{
				assertenum([undefined, 1, undefined], [,1].concat([], [,]),"concatenation behavior with a trailing comma (1)");
				assert(3 === [,1].concat([], [,]).length,"concatenation behavior with a trailing comma (2)");
			}

			assertenum(["1"], Object.keys([,1].concat([], [,])), "test 10");

			// Check that Array.prototype.concat can be used in a generic way
			x.concat = Array.prototype.concat;
			assertenum([x], x.concat(),"test 11");
			assert(1 === x.concat().length,"test 12");

			// Checking an edge case
			var arr = []; arr[2] = true;
			assertenum([undefined, undefined, true], [].concat(arr),"test 13");
			assert(3 === [].concat(arr).length,"test 14");
			assertenum(["2"], Object.keys([].concat(arr)),"test 15");

			var args = (function() { return [].concat(arguments) })(1, 2);
			assert(1 === args[0][0],"test 16");
		});

		test(".map() method",function() {
			assertenum([1,2,3], [1,2,3].map());
			assertenum([2,4,6], [1,2,3].map(function(x) { return x * 2; }));

			var x = [1,2,3,4];
			delete x[1];
			delete x[3];
			assertenum([1, undefined, 3, undefined], x.map());
			assert(4 === x.map().length);

			var traversed = [];
			x.map(function(val) {
				traversed.push(val);
			});
			assertenum([1, 3], traversed);
			assert(2 === traversed.length);
		});

		test(".findAll() method", function() {
			assertenum([2, 4, 6], [1, 2, 3, 4, 5, 6].findAll(function(x) {
				return (x % 2) == 0;
			}));

			var x = [1,2,3], traversed = [];
			delete x[1];
			x.findAll(function(val) { traversed.push(val); });
			assertenum([1, 3], traversed);
			assert(2 === traversed.length);
		});

		test(".any() method",function() {
			assert(!([].any()));

			assert([true, true, true].any());
			assert([true, false, false].any());
			assert(![false, false, false].any());

			assert([1,2,3,4,5].any(function(value) {
				return value > 2;
			}));
			assert(![1,2,3,4,5].any(function(value) {
				return value > 5;
			}));

			var x = [1,2,3], traversed = [];
			delete x[1];
			x.any(function(val) { traversed.push(val); });
			assertenum([1, 3], traversed);
			assert(2 === traversed.length);
		});
		test(".all() method",function() {
			assert([].all());

			assert([true, true, true].all());
			assert(![true, false, false].all());
			assert(![false, false, false].all());

			assert([1,2,3,4,5].all(function(value) {
				return value > 0;
			}));
			assert(![1,2,3,4,5].all(function(value) {
				return value > 1;
			}));

			var x = [1,2,3], traversed = [];
			delete x[1];
			x.all(function(val) { traversed.push(val); return true; });
			assertenum([1, 3], traversed);
			assert(2, traversed.length);
		});
	});
	
	test("$w()",function(){
		assertenum(['a', 'b', 'c', 'd'], $w('a b c d'));
		assertenum([], $w(' '));
		assertenum([], $w(''));
		assertenum([], $w(null));
		assertenum([], $w(undefined));
		assertenum([], $w());
		assertenum([], $w(10));
		assertenum(['a'], $w('a'));
		assertenum(['a'], $w('a '));
		assertenum(['a'], $w(' a'));
		assertenum(['a', 'b', 'c', 'd'], $w(' a   b\nc\t\nd\n'));
	});
	
	
	test(".each() On Sparse Arrays",function() {
		var counter = 0;

		var sparseArray = [0, 1];
		sparseArray[5] = 5;
		sparseArray.each( function(item) { counter++; });

		assert(3 === counter, "Array#each should skip nonexistent keys in an array");
	});
	
	test(".map() Generic", function() {
		var result = Array.prototype.map.call({0:0, 1:1, length:2});
		assertenum([0, 1], result);
	});
	

	
	test(".findAll() Generic", function() {
		var result = Array.prototype.findAll.call({0:0, 1:1, length:2}, function(x) {
			return x === 1;
		});
		assertenum([1], result);
	});
	

	test(".any() Generic", function() {
		assert(Array.prototype.any.call({ 0:false, 1:true, length:2 }));
		assert(!Array.prototype.any.call({ 0:false, 1:false, length:2 }));
	});
	
	
	test(".all() Generic", function() {
		assert(Array.prototype.all.call({ 0:true, 1:true, length:2 }));
		assert(!Array.prototype.all.call({ 0:false, 1:true, length:2 }));
	});
	
});