// base class
var Animal = Class.create({
  initialize: function(name) {
    this.name = name;
  },
  name: "",
  eat: function() {
    return this.say("Yum!");
  },
  say: function(message) {
    return this.name + ": " + message;
  }
});

// subclass that augments a method
var Cat = Class.create(Animal, {
  eat: function($super, food) {
    if (food instanceof Mouse) return $super();
    else return this.say("Yuk! I only eat mice.");
  }
});

// empty subclass
var Mouse = Class.create(Animal, {});

//mixins
var Sellable = {
  getValue: function(pricePerKilo) {
    return this.weight * pricePerKilo;
  },

  inspect: function() {
    return '#<Sellable: #{weight}kg>'.interpolate(this);
  }
};

var Reproduceable = {
  reproduce: function(partner) {
    if (partner.constructor != this.constructor || partner.sex == this.sex)
      return null;
    var weight = this.weight / 10, sex = Math.random(1).round() ? 'male' : 'female';
    return new this.constructor('baby', weight, sex);
  }
};

// base class with mixin
var Plant = Class.create(Sellable, {
  initialize: function(name, weight) {
    this.name = name;
    this.weight = weight;
  },

  inspect: function() {
    return '#<Plant: #{name}>'.interpolate(this);
  }
});

// subclass with mixin
var Dog = Class.create(Animal, Reproduceable, {
  initialize: function($super, name, weight, sex) {
    this.weight = weight;
    this.sex = sex;
    $super(name);
  }
});

// subclass with mixins
var Ox = Class.create(Animal, Sellable, Reproduceable, {
  initialize: function($super, name, weight, sex) {
    this.weight = weight;
    this.sex = sex;
    $super(name);
  },

  eat: function(food) {
    if (food instanceof Plant)
      this.weight += food.weight;
  },

  inspect: function() {
    return '#<Ox: #{name}>'.interpolate(this);
  }
});

suite("Class Namespace",function(){
  test("Class Create()",function() {
    assert(Object.isFunction(Animal), 'Animal is not a constructor');
    assert.deepEqual([Cat, Mouse, Dog, Ox], Animal.subclasses);
    Animal.subclasses.each(function(subclass) {
      assert(Animal === subclass.superclass);
    }, this);

    var Bird = Class.create(Animal);
    assert(Bird === Animal.subclasses.last());
    // for..in loop (for some reason) doesn't iterate over the constructor property in top-level classes
    assert.deepEqual(Object.keys(new Animal).sort(), Object.keys(new Bird).without('constructor').sort());
  });

	test("Class Instantiation",function() {
		var pet = new Animal("Nibbles");
		assert("Nibbles" === pet.name, "property not initialized");
		assert('Nibbles: Hi!' === pet.say('Hi!'));
		assert(Animal === pet.constructor, "bad constructor reference");
		assert(pet.superclass === undefined );

		var Empty = Class.create();
		assert('object' === typeof new Empty);
	});

	test("Class Inheritance", function() {
		var tom = new Cat('Tom');
		assert(Cat === tom.constructor, "bad constructor reference");
		assert(Animal === tom.constructor.superclass, 'bad superclass reference');
		assert('Tom' === tom.name);
		assert('Tom: meow' === tom.say('meow'));
		assert('Tom: Yuk! I only eat mice.' === tom.eat(new Animal));
	});

	test("Superclass Method Call",function() {
		var tom = new Cat('Tom');
		assert('Tom: Yum!' === tom.eat(new Mouse));

		// augment the constructor and test
		var Dodo = Class.create(Animal, {
			initialize: function($super, name) {
				$super(name);
				this.extinct = true;
			},

			say: function($super, message) {
				return $super(message) + " honk honk";
			}
		});

		var gonzo = new Dodo('Gonzo');
		assert('Gonzo' === gonzo.name);
		assert(gonzo.extinct, 'Dodo birds should be extinct');
		assert("Gonzo: hello honk honk" === gonzo.say("hello"));
	});

	test("Class addMethods() method",function() {
		var tom   = new Cat('Tom');
		var jerry = new Mouse('Jerry');

		Animal.addMethods({
			sleep: function() {
				return this.say('ZZZ');
			}
		});

		Mouse.addMethods({
			sleep: function($super) {
				return $super() + " ... no, can't sleep! Gotta steal cheese!";
			},
			escape: function(cat) {
				return this.say('(from a mousehole) Take that, ' + cat.name + '!');
			}
		});

		assert('Tom: ZZZ' === tom.sleep(), "added instance method not available to subclass");
		assert("Jerry: ZZZ ... no, can't sleep! Gotta steal cheese!" === jerry.sleep());
		assert("Jerry: (from a mousehole) Take that, Tom!" === jerry.escape(tom));
		// insure that a method has not propagated *up* the prototype chain:
		assert(tom.escape === undefined);
		assert(new Animal().escape === undefined);

		Animal.addMethods({
			sleep: function() {
				return this.say('zZzZ');
			}
		});

		assert("Jerry: zZzZ ... no, can't sleep! Gotta steal cheese!" === jerry.sleep());
	});

	test("Base Class With Mixin",function() {
		var grass = new Plant('grass', 3);
		assertRespondsTo('getValue', grass);
		assert('#<Plant: grass>' === grass.inspect());
	});

	test("Subclass With Mixin",function() {
		var snoopy = new Dog('Snoopy', 12, 'male');
		assertRespondsTo('reproduce', snoopy);
	});

	test("Subclass With Mixins",function() {
		var cow = new Ox('cow', 400, 'female');
		assert('#<Ox: cow>' === cow.inspect());
		assertRespondsTo('reproduce', cow);
		assertRespondsTo('getValue', cow);
	});

	test("Class With To String And Value Of Methods",function() {
		var Foo = Class.create({
			toString: function() { return "toString" },
			valueOf: function() { return "valueOf" }
		});

		var Bar = Class.create(Foo, {
			valueOf: function() { return "myValueOf" }
		});

		var Parent = Class.create({
			m1: function(){ return 'm1' },
			m2: function(){ return 'm2' }
		});
		var Child = Class.create(Parent, {
			m1: function($super) { return 'm1 child' },
			m2: function($super) { return 'm2 child' }
		});

		assert(new Child().m1.toString().indexOf('m1 child') > -1);

		assert("toString" === new Foo().toString());
		assert("valueOf" === new Foo().valueOf());
		assert("toString" === new Bar().toString());
		assert("myValueOf" === new Bar().valueOf());
	});
});