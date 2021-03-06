var getInnerHTML = function(id) {
  return $(id).innerHTML.toString().toLowerCase().gsub(/[\r\n\t]/, '');
};
var createParagraph = function(text) {
  var p = document.createElement('p');
  p.appendChild(document.createTextNode(text));
  return p;
}

var RESIZE_DISABLED = false;

function simulateClick(node) {
  var oEvent;
  if (document.createEvent) {
    oEvent = document.createEvent('MouseEvents');
    oEvent.initMouseEvent('click', true, true, document.defaultView,
     0, 0, 0, 0, 0, false, false, false, false, 0, node);
    node.dispatchEvent(oEvent);
  } else {
    node.click();
  }
}

var testVar = 'to be updated', testVar2 = '', documentViewportProperties;

Element.addMethods({
  hashBrowns: function(element) { return 'hash browns'; }
});

Element.addMethods("LI", {
  pancakes: function(element) { return "pancakes"; }
});

Element.addMethods("DIV", {
  waffles: function(element) { return "waffles"; }
});

Element.addMethods($w("li div"), {
  orangeJuice: function(element) { return "orange juice"; }
});

suite("DOM Interactions",function(){
  this.timeout(10000)
  setup(function() {
    if (documentViewportProperties) return;
    // Based on properties check from http://www.quirksmode.org/viewport/compatibility.html
    documentViewportProperties = {
      properties : [
        'self.pageXOffset', 'self.pageYOffset',
        'self.screenX', 'self.screenY',
        'self.innerHeight', 'self.innerWidth',
        'self.outerHeight', 'self.outerWidth',
        'self.screen.height', 'self.screen.width',
        'self.screen.availHeight', 'self.screen.availWidth',
        'self.screen.availTop', 'self.screen.availLeft',
        'self.screen.Top', 'self.screen.Left', 
        'self.screenTop', 'self.screenLeft',
        'document.body.clientHeight', 'document.body.clientWidth',
        'document.body.scrollHeight', 'document.body.scrollWidth',
        'document.body.scrollLeft', 'document.body.scrollTop',
        'document.body.offsetHeight', 'document.body.offsetWidth',
        'document.body.offsetTop', 'document.body.offsetLeft'
      ].inject([], function(properties, prop) {
        if(!self.screen && prop.include('self.screen')) return;
        if (!document.body && prop.include('document.body')) return;
        properties.push(prop);
        if (prop.include('.body') && document.documentElement)
          properties.push(prop.sub('.body', '.documentElement'));
        return properties;
      }),

      inspect : function() {
        var props = [];
        this.properties.each(function(prop) {
          if (eval(prop)) props[prop] = eval(prop);
        }, this);
        return props;
      }
    };
  });

  test("$() Utility Function",function() {
    assert($() === undefined);
    
    assert(document.getElementById('noWayThisIDExists') === null,'nonexistent ID should return null from getElementById');
    assert($('noWayThisIDExists') === null,'nonexistent ID should return null from $');
    
    assert(document.getElementById('testdiv') === $('testdiv'),'getElementById and $ should return the same element');

    assertenum([ $('testdiv'), $('container') ], $('testdiv', 'container'));
    assertenum([ $('testdiv'), null, $('container') ],$('testdiv', 'noWayThisIDExists', 'container'));
    var elt = $('testdiv');
    assert(elt === $(elt));
    assertRespondsTo('hide', elt);
    assertRespondsTo('childOf', elt);
  });
  
  test("document.getElementsByClassName()",function() {
    if (document.getElementsByClassName.toString().include('[native code]')) {
      info("browser uses native getElementsByClassName; skipping tests");
      return;
    } 

    
    var div = $('class_names'), list = $('class_names_ul');
    
    assertElementsMatch(document.getElementsByClassName('A'), 'p.A', 'ul#class_names_ul.A', 'li.A.C');
    
    
    var isElementPrototypeSupported = (function(){
      var el = document.createElement('div');
      var result = typeof el.show != 'undefined';
      el = null;
      return result;
    })();
    
    if (!isElementPrototypeSupported)
      assert.isUndefined(document.getElementById('unextended').show);
    
    assertElementsMatch(div.getElementsByClassName('B'), 'ul#class_names_ul.A.B', 'div.B.C.D');
    assertElementsMatch(div.getElementsByClassName('D C B'), 'div.B.C.D');
    assertElementsMatch(div.getElementsByClassName(' D\nC\tB '), 'div.B.C.D');
    assertElementsMatch(div.getElementsByClassName($w('D C B')));
    assertElementsMatch(list.getElementsByClassName('A'), 'li.A.C');
    assertElementsMatch(list.getElementsByClassName(' A '), 'li.A.C');
    assertElementsMatch(list.getElementsByClassName('C A'), 'li.A.C');
    assertElementsMatch(list.getElementsByClassName("C\nA "), 'li.A.C');
    assertElementsMatch(list.getElementsByClassName('B'));
    assertElementsMatch(list.getElementsByClassName('1'), 'li.1');
    assertElementsMatch(list.getElementsByClassName([1]), 'li.1');
    assertElementsMatch(list.getElementsByClassName(['1 junk']));
    assertElementsMatch(list.getElementsByClassName(''));
    assertElementsMatch(list.getElementsByClassName(' '));
    assertElementsMatch(list.getElementsByClassName(['']));
    assertElementsMatch(list.getElementsByClassName([' ', '']));
    assertElementsMatch(list.getElementsByClassName({}));
    
    // those lookups shouldn't have extended all nodes in document
    if (!isElementPrototypeSupported) 
      assert.isUndefined(document.getElementById('unextended')['show']);
  });

  test("Element.insert() With HTML",function() {
    Element.insert('insertions-main', {before:'<p><em>before</em> text</p><p>more testing</p>'});
    assert(getInnerHTML('insertions-container').startsWith('<p><em>before</em> text</p><p>more testing</p>'));
    Element.insert('insertions-main', {after:'<p><em>after</em> text</p><p>more testing</p>'});
    assert(getInnerHTML('insertions-container').endsWith('<p><em>after</em> text</p><p>more testing</p>'));
    Element.insert('insertions-main', {top:'<p><em>top</em> text.</p><p>more testing</p>'});
    assert(getInnerHTML('insertions-main').startsWith('<p><em>top</em> text.</p><p>more testing</p>'));
    Element.insert('insertions-main', {bottom:'<p><em>bottom</em> text.</p><p>more testing</p>'});
    assert(getInnerHTML('insertions-main').endsWith('<p><em>bottom</em> text.</p><p>more testing</p>'));
  });

  test("Element.insert() With DOM Node", function() {
    Element.insert('insertions-node-main', {before: createParagraph('node before')});
    assert(getInnerHTML('insertions-node-container').startsWith('<p>node before</p>'));
    Element.insert('insertions-node-main', {after: createParagraph('node after')});
    assert(getInnerHTML('insertions-node-container').endsWith('<p>node after</p>'));
    Element.insert('insertions-node-main', {top:createParagraph('node top')});
    assert(getInnerHTML('insertions-node-main').startsWith('<p>node top</p>'));
    Element.insert('insertions-node-main', {bottom:createParagraph('node bottom')});
    assert(getInnerHTML('insertions-node-main').endsWith('<p>node bottom</p>'));
    assert.equal($('insertions-node-main').insert(document.createElement('p')),$('insertions-node-main'));
  });
  
  test("Element.insert() With To Element Method", function() {
    Element.insert('insertions-node-main', {toElement: createParagraph.curry('toElement') });
    assert(getInnerHTML('insertions-node-main').endsWith('<p>toelement</p>'));
    Element.insert('insertions-node-main', {bottom: {toElement: createParagraph.curry('bottom toElement') }});
    assert(getInnerHTML('insertions-node-main').endsWith('<p>bottom toelement</p>'));
  });
  
  test("Element.insert() With To HTMLMethod", function() {
    Element.insert('insertions-node-main', {toHTML: function() { return '<p>toHTML</p>'} });
    assert(getInnerHTML('insertions-node-main').endsWith('<p>tohtml</p>'));
    Element.insert('insertions-node-main', {bottom: {toHTML: function() { return '<p>bottom toHTML</p>'} }});
    assert(getInnerHTML('insertions-node-main').endsWith('<p>bottom tohtml</p>'));
  });
  
  test("Element.insert() With NonString", function() {
    Element.insert('insertions-main', {bottom:3});
    assert(getInnerHTML('insertions-main').endsWith('3'));
  });

  test("Element.insert() In Tables", function() {
    Element.insert('second_row', { after:'<tr id="third_row"><td>Third Row</td></tr>' });

    assert($('second_row').parentNode == $('table'),
     'table rows should be inserted correctly');
    
    $('a_cell').insert({ top: 'hello world' });
    assert($('a_cell').innerHTML.startsWith('hello world'),
     'content should be inserted into table cells correctly');

    $('a_cell').insert({ after: '<td>hi planet</td>'});
    assert.equal('hi planet', $('a_cell').next().innerHTML,
     'table cells should be inserted after existing table cells correctly');

    $('table_for_insertions').insert('<tr><td>a cell!</td></tr>');
    assert($('table_for_insertions').innerHTML.gsub('\r\n', '').toLowerCase().include('<tr><td>a cell!</td></tr>'),
     'complex content should be inserted into a table correctly');
    
    $('row_1').insert({ after:'<tr></tr><tr></tr><tr><td>last</td></tr>' });
    assert.equal('last', $A($('table_for_row_insertions').getElementsByTagName('tr')).last().lastChild.innerHTML,
     'complex content should be inserted after a table row correctly');
  });
  
  test("Element.insert() In Select",function() {
    var selectTop = $('select_for_insert_top'), selectBottom = $('select_for_insert_bottom');
    selectBottom.insert('<option value="33">option 33</option><option selected="selected">option 45</option>');
    assert.equal('option 45', selectBottom.getValue());
    selectTop.insert({top:'<option value="A">option A</option><option value="B" selected="selected">option B</option>'});
    assert.equal(4, selectTop.options.length);
  });
      
  test("Element Method Insert()",function() {
    $('element-insertions-main').insert({before:'some text before'});
    assert(getInnerHTML('element-insertions-container').startsWith('some text before'), 'some text before');
    $('element-insertions-main').insert({after:'some text after'});
    assert(getInnerHTML('element-insertions-container').endsWith('some text after'), 'some text after');
    $('element-insertions-main').insert({top:'some text top'});
    assert(getInnerHTML('element-insertions-main').startsWith('some text top'), 'some text top');
    $('element-insertions-main').insert({bottom:'some text bottom'});
    assert(getInnerHTML('element-insertions-main').endsWith('some text bottom'), 'some text bottom');
    
    $('element-insertions-main').insert('some more text at the bottom');
    assert(getInnerHTML('element-insertions-main').endsWith('some more text at the bottom'),
     'some more text at the bottom');
    
    $('element-insertions-main').insert({TOP:'some text uppercase top'});
    assert(getInnerHTML('element-insertions-main').startsWith('some text uppercase top'), 'some text uppercase top');
    
    $('element-insertions-multiple-main').insert({
      top:'1', bottom:2, before: new Element('p').update('3'), after:'4'
    });
    assert(getInnerHTML('element-insertions-multiple-main').startsWith('1'), '1');
    assert(getInnerHTML('element-insertions-multiple-main').endsWith('2'), '2');
    assert(getInnerHTML('element-insertions-multiple-container').startsWith('<p>3</p>'), '<p>3</p>');
    assert(getInnerHTML('element-insertions-multiple-container').endsWith('4'), '4');
    
    $('element-insertions-main').update('test');
    $('element-insertions-main').insert(null);
    $('element-insertions-main').insert({bottom:null});
    assert.equal('test', getInnerHTML('element-insertions-main'), 'should insert nothing when called with null');
    $('element-insertions-main').insert(1337);
    assert.equal('test1337', getInnerHTML('element-insertions-main'), 'should coerce to string when called with number');
  });
  
  test("New Element Insert",function() {
    var container = new Element('div'), element = new Element('div');
    container.insert(element);
    
    element.insert({ before: '<p>a paragraph</p>' });
    assert.equal('<p>a paragraph</p><div></div>', getInnerHTML(container));
    element.insert({ after: 'some text' });
    assert.equal('<p>a paragraph</p><div></div>some text', getInnerHTML(container));
    
    element.insert({ top: '<p>a paragraph</p>' });
    assert.equal('<p>a paragraph</p>', getInnerHTML(element));
    element.insert('some text');
    assert.equal('<p>a paragraph</p>some text', getInnerHTML(element));
  });
  
  test("Insertion Backwards Compatibility", function() {
    new Insertion.Before('element-insertions-main', 'some backward-compatibility testing before');
    assert(getInnerHTML('element-insertions-container').include('some backward-compatibility testing before'));
    new Insertion.After('element-insertions-main', 'some backward-compatibility testing after');
    assert(getInnerHTML('element-insertions-container').include('some backward-compatibility testing after'));
    new Insertion.Top('element-insertions-main', 'some backward-compatibility testing top');
    assert(getInnerHTML('element-insertions-main').startsWith('some backward-compatibility testing top'));
    new Insertion.Bottom('element-insertions-main', 'some backward-compatibility testing bottom');
    assert(getInnerHTML('element-insertions-main').endsWith('some backward-compatibility testing bottom'));
  });
  
  test("Element.wrap()", function() {
    var element = $('wrap'), parent = document.createElement('div');
    element.wrap();
    assert(getInnerHTML('wrap-container').startsWith('<div><p'));
    element.wrap('div');
    assert(getInnerHTML('wrap-container').startsWith('<div><div><p'));
    
    element.wrap(parent);
    assert(Object.isFunction(parent.setStyle));
    assert(getInnerHTML('wrap-container').startsWith('<div><div><div><p'));
    
    element.wrap('div', {className: 'wrapper'});
    assert(element.up().hasClassName('wrapper'));      
    element.wrap({className: 'other-wrapper'});
    assert(element.up().hasClassName('other-wrapper'));
    element.wrap(new Element('div'), {className: 'yet-other-wrapper'});
    assert(element.up().hasClassName('yet-other-wrapper'));
    
    var orphan = new Element('p'), div = new Element('div');
    orphan.wrap(div);
    assert.equal(orphan.parentNode, div);
  });
  
  test("Element.wrap() ReturnsWrapper", function() {
    var element = new Element("div");
    var wrapper = element.wrap("div");
    assert.notEqual(element, wrapper);
    assert.equal(element.up(), wrapper);
  });
  
  test("Element.visible()", function(){
    assert.notEqual('none', $('test-visible').style.display);
    assert.equal('none', $('test-hidden').style.display);
  });
  
  test("Element.toggle()", function(){
    $('test-toggle-visible').toggle();
    assert(!$('test-toggle-visible').visible(), 'test-toggle-visible 1');
    $('test-toggle-visible').toggle();
    assert($('test-toggle-visible').visible()), 'test-toggle-visible 2';
    $('test-toggle-hidden').toggle();
    assert($('test-toggle-hidden').visible(), 'test-toggle-hidden 1');
    $('test-toggle-hidden').toggle();
    assert(!$('test-toggle-hidden').visible(), 'test-toggle-hidden 2');
  });
  
  test("Element.show()", function(){
    $('test-show-visible').show();
    assert($('test-show-visible').visible());
    $('test-show-hidden').show();
    assert($('test-show-hidden').visible());
  });
  
  test("Element.hide()", function(){
    $('test-hide-visible').hide();
    assert(!$('test-hide-visible').visible());
    $('test-hide-hidden').hide();
    assert(!$('test-hide-hidden').visible());
  });
  
  test("Element.remove()", function(){
    $('removable').remove();
    assert($('removable-container').empty());
  });
   
  test("Element.update()", function() {
    $('testdiv').update('hello from div!');
    assert.equal('hello from div!', $('testdiv').innerHTML);
    
    Element.update('testdiv', 'another hello from div!');
    assert.equal('another hello from div!', $('testdiv').innerHTML);
    
    Element.update('testdiv', 123);
    assert.equal('123', $('testdiv').innerHTML);
    
    Element.update('testdiv');
    assert.equal('', $('testdiv').innerHTML);
    
    Element.update('testdiv', '&nbsp;');
    assert(!$('testdiv').innerHTML.empty());
  });

  test("Element.update() With Script",function(done) {
    $('testdiv').update('hello from div!<script>\ntestVar="hello!";\n</'+'script>');
    assert.equal('hello from div!',$('testdiv').innerHTML);
    setTimeout(function(){
      assert.equal('hello!',testVar);
      
      Element.update('testdiv','another hello from div!\n<script>testVar="another hello!"</'+'script>\nhere it goes');
      
      // note: IE normalizes whitespace (like line breaks) to single spaces, thus the match test
      assert.match($('testdiv').innerHTML,/^another hello from div!\s+here it goes$/);
      setTimeout(function(){
        assert.equal('another hello!',testVar);
        
        Element.update('testdiv','a\n<script>testVar="a"\ntestVar="b"</'+'script>');
        setTimeout(function(){
          assert.equal('b', testVar);
          
          Element.update('testdiv','x<script>testVar2="a"</'+'script>\nblah\nx<script>testVar2="b"</'+'script>');
          setTimeout(function(){
            assert.equal('b', testVar2);
            done();
          },100);
        },100);
      },100);
    },100);
  });
  
  test("Element.update() In Table Row", function() {
    $('second_row').update('<td id="i_am_a_td">test</td>');
    assert.equal('test',$('i_am_a_td').innerHTML);

    Element.update('second_row','<td id="i_am_a_td">another <span>test</span></td>');
    assert.equal('another <span>test</span>',$('i_am_a_td').innerHTML.toLowerCase());
  });
  
  test("Element.update() In Table Cell", function() {
    Element.update('a_cell','another <span>test</span>');
    assert.equal('another <span>test</span>',$('a_cell').innerHTML.toLowerCase());
  });
  
  test("Element.update() In Table", function() {
    Element.update('table','<tr><td>boo!</td></tr>');
    assert.match($('table').innerHTML.toLowerCase(),/^<tr>\s*<td>boo!<\/td><\/tr>$/);
  });
  
  test("Element.update() In Select", function() {
    var select = $('select_for_update');
    select.update('<option value="3">option 3</option><option selected="selected">option 4</option>');
    assert.equal('option 4', select.getValue());
  });
  
  test("Element.update() With Link Tag", function() {
    var div = new Element('div');
    div.update('<link rel="stylesheet" />');
    assert.equal(1, div.childNodes.length);
    var link = div.down('link');
    assert(link);
    assert(link.rel === 'stylesheet');
    
    div.update('<p><link rel="stylesheet"></p>')
    assert.equal(1, div.childNodes.length);
    assert.equal(1, div.firstChild.childNodes.length);

    var link = div.down('link');
    assert(link);
    assert(link.rel === 'stylesheet');
  });

  test("Element.update() With DOM Node", function() {
    $('testdiv').update(new Element('div').insert('bla'));
    assert.equal('<div>bla</div>', getInnerHTML('testdiv'));
  });
  
  test("Element.update() With ToElement Method", function() {
    $('testdiv').update({toElement: createParagraph.curry('foo')});
    assert.equal('<p>foo</p>', getInnerHTML('testdiv'));
  });
  
  test("Element.update() With ToHTML Method", function() {
    $('testdiv').update({toHTML: function() { return 'hello world' }});
    assert.equal('hello world', getInnerHTML('testdiv'));
  });
  
  test("Element.update() Script Element", function() {
    var el = new Element('script', {
      type: 'text/javascript'
    });
    assert.doesNotThrow(function(){
      el.update('(function(){})');
    })
  });
  
  test("Element.replace()", function() {
    $('testdiv-replace-1').replace('hello from div!');
    assert.equal('hello from div!', $('testdiv-replace-container-1').innerHTML);
    
    $('testdiv-replace-2').replace(123);
    assert.equal('123', $('testdiv-replace-container-2').innerHTML);
    
    $('testdiv-replace-3').replace();
    assert.equal('', $('testdiv-replace-container-3').innerHTML);
    
    $('testrow-replace').replace('<tr><td>hello</td></tr>');
    assert(getInnerHTML('testrow-replace-container').include('<tr><td>hello</td></tr>'));
    
    $('testoption-replace').replace('<option>hello</option>');
    assert($('testoption-replace-container').innerHTML.include('hello'));
    
    Element.replace('testinput-replace', '<p>hello world</p>');
    assert.equal('<p>hello world</p>', getInnerHTML('testform-replace'));

    Element.replace('testform-replace', '<form></form>');
    assert.equal('<p>some text</p><form></form><p>some text</p>', getInnerHTML('testform-replace-container'));
  });
  
  test("Element.replace() With Script", function(done) {
    $('testdiv-replace-4').replace('hello from div!<script>testVarReplace="hello!"</'+'script>');
    assert.equal('hello from div!', $('testdiv-replace-container-4').innerHTML);
    setTimeout(function(){
      assert.equal('hello!',testVarReplace);
      
      $('testdiv-replace-5').replace('another hello from div!\n<script>testVarReplace="another hello!"</'+'script>\nhere it goes');
      
      // note: IE normalizes whitespace (like line breaks) to single spaces, thus the match test
      assert.match($('testdiv-replace-container-5').innerHTML,/^another hello from div!\s+here it goes$/);
      setTimeout(function(){
        assert.equal('another hello!',testVarReplace);
        done()
      },100);
    },100);
  });

  test("Element.replace() With DOM Node", function() {
    $('testdiv-replace-element').replace(createParagraph('hello'));
    assert.equal('<p>hello</p>', getInnerHTML('testdiv-replace-container-element'));
  });
  
  test("Element.replace() With toElement() Method", function() {
    $('testdiv-replace-toelement').replace({toElement: createParagraph.curry('hello')});
    assert.equal('<p>hello</p>', getInnerHTML('testdiv-replace-container-toelement'));
  });
  
  test("Element.replace() With toHTML() Method", function() {
    $('testdiv-replace-tohtml').replace({toHTML: function() { return 'hello' }});
    assert.equal('hello', getInnerHTML('testdiv-replace-container-tohtml'));
  });
      
  test("Element.selector() Method", function() {      
    ['getElementsBySelector','select'].each(function(method) {
      var testSelector = $('container')[method]('p.test');
      assert.equal(testSelector.length, 4);
      assert.equal(testSelector[0], $('intended'));
      assert.equal(testSelector[0], $$('#container p.test')[0]);        
    });
  });
  
  test("Element.adjacent() method", function() {
    var elements = $('intended').adjacent('p');
    assert.equal(elements.length, 3);
    elements.each(function(element){
      assert(element != $('intended'));
    });
  });
  
  test("Element.identify()", function() {
    var parent = $('identification');
    assert.equal(parent.down().identify(), 'predefined_id',
     "identify should preserve the IDs of elements that already have them");
    assert(parent.down(1).identify().startsWith('anonymous_element_'),
     "should have #anonymous_element_1");
    assert(parent.down(2).identify().startsWith('anonymous_element_'),
     "should have #anonymous_element_2");
    assert(parent.down(3).identify().startsWith('anonymous_element_'),
     "should have #anonymous_element_3");
    
    assert(parent.down(3).id !== parent.down(2).id,
     "should not assign duplicate IDs");
  });
     
  test("Element.className() Method", function() {
    var testClassNames = $('container').getElementsByClassName('test');
    var testSelector = $('container').getElementsBySelector('p.test');
    assert.equal(testClassNames[0], $('intended'));
    assert.equal(testClassNames.length, 4);
    assert.equal(testSelector[3], testClassNames[3]);
    assert.equal(testClassNames.length, testSelector.length);
  });
  
  test("Element.ancestors()", function() {
    var ancestors = $('navigation_test_f').ancestors();
    assertElementsMatch(ancestors, 'ul', 'li', 'ul#navigation_test',
      'div#nav_tests_isolator', 'body', 'html');
    assertElementsMatch(ancestors.last().ancestors());
    
    var dummy = $(document.createElement('DIV'));
    dummy.innerHTML = '<div></div>'.times(3);
    assert(typeof $(dummy.childNodes[0]).ancestors()[0]['setStyle'] == 'function');
  });
  
  test("Element.descendants()", function() {
    assertElementsMatch($('navigation_test').descendants(), 
      'li', 'em', 'li', 'em.dim', 'li', 'em', 'ul', 'li',
      'em.dim', 'li#navigation_test_f', 'em', 'li', 'em');
    assertElementsMatch($('navigation_test_f').descendants(), 'em');
    
    var dummy = $(document.createElement('DIV'));
    dummy.innerHTML = '<div></div>'.times(3);
    assert(typeof dummy.descendants()[0].setStyle == 'function');
  });
  
  test("Element.firstDescendant()", function() {
    assertElementsMatch([$('navigation_test').firstDescendant()], 'li.first');
    assert.isNull($('navigation_test_next_sibling').firstDescendant());
  });
  
  test("Element.childElements()", function() {
    assertElementsMatch($('navigation_test').childElements(),
      'li.first', 'li', 'li#navigation_test_c', 'li.last');
    assert.notEqual(0, $('navigation_test_next_sibling').childNodes.length);
    assert.deepEqual($('navigation_test_next_sibling').childElements(),[]);
    
    var dummy = $(document.createElement('DIV'));
    dummy.innerHTML = '<div></div>'.times(3);
    assert(typeof dummy.childElements()[0].setStyle == 'function');
  });

  test("Element.immediateDescendants()", function() {
    assert.strictEqual(Element.Methods.immediateDescendants,Element.Methods.childElements);
  });
      
  test("Element.previousSiblings()", function() {
    assertElementsMatch($('navigation_test').previousSiblings(),
      'span#nav_test_prev_sibling', 'p.test', 'div', 'div#nav_test_first_sibling');
    assertElementsMatch($('navigation_test_f').previousSiblings(), 'li');
    
    var dummy = $(document.createElement('DIV'));
    dummy.innerHTML = '<div></div>'.times(3);
    assert(typeof $(dummy.childNodes[1]).previousSiblings()[0].setStyle == 'function');
  });
  
  test("Element.nextSiblings()", function() {
    assertElementsMatch($('navigation_test').nextSiblings(),
      'div#navigation_test_next_sibling', 'p');
    assertElementsMatch($('navigation_test_f').nextSiblings());
    
    var dummy = $(document.createElement('DIV'));
    dummy.innerHTML = '<div></div>'.times(3);
    assert(typeof $(dummy.childNodes[0]).nextSiblings()[0].setStyle == 'function');
  });
  
  test("Element.siblings()", function() {
    assertElementsMatch($('navigation_test').siblings(),
      'div#nav_test_first_sibling', 'div', 'p.test',
      'span#nav_test_prev_sibling', 'div#navigation_test_next_sibling', 'p');
      
    var dummy = $(document.createElement('DIV'));
    dummy.innerHTML = '<div></div>'.times(3);
    assert(typeof $(dummy.childNodes[0]).siblings()[0].setStyle == 'function');
  });
  
  test("Element.up()", function() {
    var element = $('navigation_test_f');
    assertElementsMatch([element.up()], 'ul');
    assertElementsMatch([element.up(0)], 'ul');
    assertElementsMatch([element.up(1)], 'li');
    assertElementsMatch([element.up(2)], 'ul#navigation_test');
    assertElementsMatch(element.up('li').siblings(), 'li.first', 'li', 'li.last');
    assertElementsMatch([element.up('ul', 1)], 'ul#navigation_test');
    assert.equal(undefined, element.up('garbage'));
    assert.equal(undefined, element.up(6));
    assertElementsMatch([element.up('.non-existant, ul')], 'ul');
    
    var dummy = $(document.createElement('DIV'));
    dummy.innerHTML = '<div></div>'.times(3);
    assert(typeof $(dummy.childNodes[0]).up().setStyle == 'function');
  });
  
  test("Element.down()", function() {
    var element = $('navigation_test');
    assertElementsMatch([element.down()], 'li.first');
    assertElementsMatch([element.down(0)], 'li.first');
    assertElementsMatch([element.down(1)], 'em');
    assertElementsMatch([element.down('li', 5)], 'li.last');
    assertElementsMatch([element.down('ul').down('li', 1)], 'li#navigation_test_f');
    assertElementsMatch([element.down('.non-existant, .first')], 'li.first');
    
    var dummy = $(document.createElement('DIV'));
    dummy.innerHTML = '<div></div>'.times(3);
    assert(typeof dummy.down().setStyle == 'function');
    
    var input = $$('input')[0];
    assert.doesNotThrow(function(){ input.down('span') });
    assert.isUndefined(input.down('span'));
  });
  
  test("Element.previous()", function() {
    var element = $('navigation_test').down('li.last');
    assertElementsMatch([element.previous()], 'li#navigation_test_c');
    assertElementsMatch([element.previous(1)], 'li');
    assertElementsMatch([element.previous('.first')], 'li.first');
    assert.equal(undefined, element.previous(3));
    assert.equal(undefined, $('navigation_test').down().previous());
    assertElementsMatch([element.previous('.non-existant, .first')], 'li.first');
    
    var dummy = $(document.createElement('DIV'));
    dummy.innerHTML = '<div></div>'.times(3);
    assert(typeof $(dummy.childNodes[1]).previous().setStyle == 'function');
  });
  
  test("Element.next()", function() {
    var element = $('navigation_test').down('li.first');
    assertElementsMatch([element.next()], 'li');
    assertElementsMatch([element.next(1)], 'li#navigation_test_c');
    assertElementsMatch([element.next(2)], 'li.last');
    assertElementsMatch([element.next('.last')], 'li.last');
    assert.equal(undefined, element.next(3));
    assert.equal(undefined, element.next(2).next());
    assertElementsMatch([element.next('.non-existant, .last')], 'li.last');
    
    var dummy = $(document.createElement('DIV'));
    dummy.innerHTML = '<div></div>'.times(3);
    assert(typeof $(dummy.childNodes[0]).next().setStyle == 'function');
  });
  
  test("Element.inspect()", function() {
    assert.equal('<ul id="navigation_test">', $('navigation_test').inspect());
    assert.equal('<li class="first">', $('navigation_test').down().inspect());
    assert.equal('<em>', $('navigation_test').down(1).inspect());
  });
  
  test("Element.makeClipping()", function() {
    var chained = Element.extend(document.createElement('DIV'));
    assert.equal(chained, chained.makeClipping());
    assert.equal(chained, chained.makeClipping());
    assert.equal(chained, chained.makeClipping().makeClipping());
    
    assert.equal(chained, chained.undoClipping());
    assert.equal(chained, chained.undoClipping());
    assert.equal(chained, chained.undoClipping().makeClipping());
    
    ['hidden','visible','scroll'].each( function(overflowValue) {
      var element = $('element_with_'+overflowValue+'_overflow');
      
      assert.equal(overflowValue, element.getStyle('overflow'));
      element.makeClipping();
      assert.equal('hidden', element.getStyle('overflow'));
      element.undoClipping();
      assert.equal(overflowValue, element.getStyle('overflow'));
    });
  });
  
  test("Element.extend()", function() {
    
    Element.Methods.Simulated.simulatedMethod = function() { 
      return 'simulated';
    };
    Element.addMethods();
    
    function testTag(tagName) {
      var element = document.createElement(tagName);
      assert.equal(element, Element.extend(element));
      // test method from Methods
      assertRespondsTo('show', element);
      // test method from Simulated
      assertRespondsTo('simulatedMethod', element);
    }
    var element = $('element_extend_test');
    assertRespondsTo('show', element);
    
    var XHTML_TAGS = $w(
      'a abbr acronym address applet area '+
      'b bdo big blockquote br button caption '+
      'cite code col colgroup dd del dfn div dl dt '+
      'em fieldset form h1 h2 h3 h4 h5 h6 hr '+
      'i iframe img input ins kbd label legend li '+
      'map object ol optgroup option p param pre q samp '+
      'script select small span strong style sub sup '+
      'table tbody td textarea tfoot th thead tr tt ul var');
      
    XHTML_TAGS.each(function(tag) {
      var element = document.createElement(tag);
      assert.equal(element, Element.extend(element));
      assertRespondsTo('show', element);
    });
    
    [null,'','a','aa'].each(function(content) {
      var textnode = document.createTextNode(content);
      assert.equal(textnode, Element.extend(textnode));
      assert(typeof textnode['show'] == 'undefined');
    });
    
    // clean up
    delete Element.Methods.Simulated.simulatedMethod;
  });
  
  test("Element.extend() Reextends Discarded Nodes", function() {
    assertRespondsTo('show', $('discard_1'));
    $('element_reextend_test').innerHTML += '<div id="discard_2"></div>';
    assertRespondsTo('show', $('discard_1'));
  });
  
  test("Element.cleanWhitespace()", function() {
    Element.cleanWhitespace("test_whitespace");
    assert.equal(3, $("test_whitespace").childNodes.length);
    
    assert.equal(1, $("test_whitespace").firstChild.nodeType);
    assert.equal('SPAN', $("test_whitespace").firstChild.tagName);
    
    assert.equal(1, $("test_whitespace").firstChild.nextSibling.nodeType);
    assert.equal('DIV', $("test_whitespace").firstChild.nextSibling.tagName);
    
    assert.equal(1, $("test_whitespace").firstChild.nextSibling.nextSibling.nodeType);
    assert.equal('SPAN', $("test_whitespace").firstChild.nextSibling.nextSibling.tagName);
    
    var element = document.createElement('DIV');
    element.appendChild(document.createTextNode(''));
    element.appendChild(document.createTextNode(''));
    assert.equal(2, element.childNodes.length);
    Element.cleanWhitespace(element);
    assert.equal(0, element.childNodes.length);
  });
  
  test("Element.empty()", function() {
    assert($('test-empty').empty());
    assert($('test-empty-but-contains-whitespace').empty());
    assert(!$('test-full').empty());
  });

  test("Element.descendantOf()", function() {
    assert($('child').descendantOf('ancestor'),'#child should be descendant of #ancestor');
    assert($('child').descendantOf($('ancestor')),'#child should be descendant of #ancestor');    
    assert(!$('ancestor').descendantOf($('child')),'#ancestor should not be descendant of child');

    assert($('great-grand-child').descendantOf('ancestor'), 'great-grand-child < ancestor');
    assert($('grand-child').descendantOf('ancestor'), 'grand-child < ancestor');
    assert($('great-grand-child').descendantOf('grand-child'), 'great-grand-child < grand-child');
    assert($('grand-child').descendantOf('child'), 'grand-child < child');
    assert($('great-grand-child').descendantOf('child'), 'great-grand-child < child');
    
    assert($('sibling').descendantOf('ancestor'), 'sibling < ancestor');
    assert($('grand-sibling').descendantOf('sibling'), 'grand-sibling < sibling');
    assert($('grand-sibling').descendantOf('ancestor'), 'grand-sibling < ancestor');
    
    assert($('grand-sibling').descendantOf(document.body), 'grand-sibling < body');      
    
    assert(!$('great-grand-child').descendantOf('great-grand-child'), 'great-grand-child < great-grand-child');
    assert(!$('great-grand-child').descendantOf('sibling'), 'great-grand-child < sibling');
    assert(!$('sibling').descendantOf('child'), 'sibling < child');
    assert(!$('great-grand-child').descendantOf('not-in-the-family'), 'great-grand-child < not-in-the-family');
    assert(!$('child').descendantOf('not-in-the-family'), 'child < not-in-the-family');
    
    assert(!$(document.body).descendantOf('great-grand-child'),'BODY should not be descendant of anything within it');

    // dynamically-created elements
    $('ancestor').insert(new Element('div', { id: 'weird-uncle' }));
    assert($('weird-uncle').descendantOf('ancestor'),'dynamically-created element should work properly');
    
    $(document.body).insert(new Element('div', { id: 'impostor' }));
    assert(!$('impostor').descendantOf('ancestor'),'elements inserted elsewhere in the DOM tree should not be descendants');
    
    // test descendantOf document
    assert($(document.body).descendantOf(document),'descendantOf(document) should behave predictably');  
    assert($(document.documentElement).descendantOf(document),'descendantOf(document) should behave predictably');
  });
  
  test("Element.childOf()", function() {
    assert($('child').childOf('ancestor'));
    assert($('child').childOf($('ancestor')));
    assert($('great-grand-child').childOf('ancestor'));
    assert(!$('great-grand-child').childOf('not-in-the-family'));
    assert.strictEqual(Element.Methods.childOf, Element.Methods.descendantOf);
  });
  
  test("Element.setStyle()", function() {
    Element.setStyle('style_test_3',{ 'left': '2px' });
    assert.equal('2px', $('style_test_3').style.left);
    
    Element.setStyle('style_test_3',{ marginTop: '1px' });
    assert.equal('1px', $('style_test_3').style.marginTop);
    
    $('style_test_3').setStyle({ marginTop: '2px', left: '-1px' });
    assert.equal('-1px', $('style_test_3').style.left);
    assert.equal('2px', $('style_test_3').style.marginTop);
    
    assert.equal('none', $('style_test_3').getStyle('float'));
    $('style_test_3').setStyle({ 'float': 'left' });
    assert.equal('left', $('style_test_3').getStyle('float'));
    
    $('style_test_3').setStyle({ cssFloat: 'none' });
    assert.equal('none', $('style_test_3').getStyle('float'));
    
    assert.equal(1, $('style_test_3').getStyle('opacity'),
     '#style_test_3 opacity should be 1');
    
    $('style_test_3').setStyle({ opacity: 0.5 });
    assert.equal(0.5, $('style_test_3').getStyle('opacity'));
    
    $('style_test_3').setStyle({ opacity: '' });
    assert.equal(1, $('style_test_3').getStyle('opacity'),
     '#style_test_3 opacity should be 1');
    
    $('style_test_3').setStyle({ opacity: 0 });
    assert.equal(0, $('style_test_3').getStyle('opacity'),
     '#style_test_3 opacity should be 0');
  
    $('test_csstext_1').setStyle('font-size: 15px');
    assert.equal('15px', $('test_csstext_1').getStyle('font-size'));
    
    $('test_csstext_2').setStyle({height: '40px'});
    $('test_csstext_2').setStyle('font-size: 15px');
    assert.equal('15px', $('test_csstext_2').getStyle('font-size'));
    assert.equal('40px', $('test_csstext_2').getStyle('height'));
    
    $('test_csstext_3').setStyle('font-size: 15px');
    assert.equal('15px', $('test_csstext_3').getStyle('font-size'));
    assert.equal('1px', $('test_csstext_3').getStyle('border-top-width'));
    
    $('test_csstext_4').setStyle('font-size: 15px');
    assert.equal('15px', $('test_csstext_4').getStyle('font-size'));
    
    $('test_csstext_4').setStyle('float: right; font-size: 10px');
    assert.equal('right', $('test_csstext_4').getStyle('float'));
    assert.equal('10px', $('test_csstext_4').getStyle('font-size'));
    
    $('test_csstext_5').setStyle('float: left; opacity: .5; font-size: 10px');
    assert.equal(parseFloat('0.5'), parseFloat($('test_csstext_5').getStyle('opacity')));
 });
  
  test("Element.setStyle() Camelized", function() {
    assert.notEqual('30px', $('style_test_3').style.marginTop);
    $('style_test_3').setStyle({ marginTop: '30px'}, true);
    assert.equal('30px', $('style_test_3').style.marginTop);
  });
  
  test("Element.setOpacity()", function() {
    [0, 0.1, 0.5, 0.999].each(function(opacity){
      $('style_test_3').setOpacity(opacity);
      
      // b/c of rounding issues on IE special case
      var realOpacity = $('style_test_3').getStyle('opacity');
      
      // opera rounds off to two significant digits, so we check for a
      // ballpark figure
      assert(
        (Number(realOpacity) - opacity) <= 0.002,
        'setting opacity to ' + opacity + ' (actual: ' + realOpacity + ')'
      );        
    });
    
    assert.equal(0,
      $('style_test_3').setOpacity(0.0000001).getStyle('opacity'));
    
    // for Firefox, we don't set to 1, because of flickering
    assert(
      $('style_test_3').setOpacity(0.9999999).getStyle('opacity') > 0.999
    );

    // setting opacity before element was added to DOM
    assert.equal(0.5, new Element('div').setOpacity(0.5).getOpacity());

    /*
    
    IE <= 7 needs a `hasLayout` for opacity ("filter") to function properly
    `hasLayout` is triggered by setting `zoom` style to `1`, 
    
    In IE8 setting `zoom` does not affect `hasLayout`
    and IE8 does not even need `hasLayout` for opacity to work
    
    We do a proper feature test here
    
    */
    
    var ZOOM_AFFECT_HAS_LAYOUT = (function(){
      // IE7
      var el = document.createElement('div');
      el.style.zoom = 1;
      var result = el.hasLayout;
      el = null;
      return result;
    })();
    
    if (ZOOM_AFFECT_HAS_LAYOUT) {
      assert($('style_test_4').setOpacity(0.5).currentStyle.hasLayout);
      assert.equal(1, $('style_test_5').setOpacity(0.5).getStyle('zoom'));
      assert.equal(2, new Element('div').setOpacity(0.5).setStyle('zoom: 2;').getStyle('zoom'));
      assert.equal(2, new Element('div').setStyle('zoom: 2;').setOpacity(0.5).getStyle('zoom'));
    }
  });
  
  test("Element.getStyle()", function() {
    assert.equal("none",$('style_test_1').getStyle('display'));
    
    // not displayed, so "null" ("auto" is tranlated to "null")
    assert.isNull(Element.getStyle('style_test_1', 'width'), 'elements that are hidden should return null on getStyle("width")');
    
    $('style_test_1').show();
    
    // from id rule
    assert.equal(Element.getStyle('style_test_1','cursor'),"pointer");
    
    assert.equal(Element.getStyle('style_test_2','display'),"block");
    
    // we should always get something for width (if displayed)
    // firefox and safari automatically send the correct value,
    // IE is special-cased to do the same
    assert.equal($('style_test_2').offsetWidth+'px', Element.getStyle('style_test_2','width'));
    
    assert.equal("static",Element.getStyle('style_test_1','position'));
    // from style
    assert.equal("11px",
      Element.getStyle('style_test_2','font-size'));
    // from class
    assert.equal("1px",
      Element.getStyle('style_test_2','margin-left'));
    
    ['not_floating_none','not_floating_style','not_floating_inline'].each(function(element) {
      
      assert.equal('none', $(element).getStyle('float'),
       'float on ' + element);
      assert.equal('none', $(element).getStyle('cssFloat'),
       'cssFloat on ' + element);
    }, this);
    
    ['floating_style','floating_inline'].each(function(element) {
      assert.equal('left', $(element).getStyle('float'));
      assert.equal('left', $(element).getStyle('cssFloat'));
    }, this);

    assert.equal(0.5, $('op1').getStyle('opacity'), 'get opacity on #op1');
    assert.equal(0.5, $('op2').getStyle('opacity'), 'get opacity on #op2');
    assert.equal(1.0, $('op3').getStyle('opacity'), 'get opacity on #op3');
    
    $('op1').setStyle({opacity: '0.3'});
    $('op2').setStyle({opacity: '0.3'});
    $('op3').setStyle({opacity: '0.3'});
    
    assert.equal(0.3, $('op1').getStyle('opacity'), 'get opacity on #op1');
    assert.equal(0.3, $('op2').getStyle('opacity'), 'get opacity on #op2');
    assert.equal(0.3, $('op3').getStyle('opacity'), 'get opacity on #op3');
    
    $('op3').setStyle({opacity: 0});
    assert.equal(0, $('op3').getStyle('opacity'), 'get opacity on #op3');
    
    // Opacity feature test borrowed from Modernizr.
    var STANDARD_CSS_OPACITY_SUPPORTED = (function() {
      var DIV = document.createElement('div');
      DIV.style.cssText = "opacity:.55";
      var result = /^0.55/.test(DIV.style.opacity);
      DIV = null;
      return result;
    })();
    
    if (!STANDARD_CSS_OPACITY_SUPPORTED) {
      // Run these tests only on older versions of IE. IE9 and 10 dropped
      // support for filters and therefore fail these tests.
      assert.equal('alpha(opacity=30)', $('op1').getStyle('filter').strip());
      assert.equal('progid:DXImageTransform.Microsoft.Blur(strength=10) alpha(opacity=30)', $('op2').getStyle('filter').strip());
      $('op2').setStyle({opacity:''});
      assert.equal('progid:DXImageTransform.Microsoft.Blur(strength=10)', $('op2').getStyle('filter').strip());
      assert.equal('alpha(opacity=0)', $('op3').getStyle('filter').strip());
      assert.equal(0.3, $('op4-ie').getStyle('opacity'));
    }
    
    // verify that value is still found when using camelized
    // strings (function previously used getPropertyValue()
    // which expected non-camelized strings)
    assert.equal("12px", $('style_test_1').getStyle('fontSize'));
    
    // getStyle on width/height should return values according to
    // the CSS box-model, which doesn't include 
    // margin, padding, or borders
    // TODO: This test fails on IE because there seems to be no way
    // to calculate this properly (clientWidth/Height returns 0)
    if(!navigator.appVersion.match(/MSIE/)) {
      assert.equal("14px", $('style_test_dimensions').getStyle('width'));
      assert.equal("17px", $('style_test_dimensions').getStyle('height'));
    }
    
    // height/width could always be calculated if it's set to "auto" (Firefox)
    assert.isNotNull($('auto_dimensions').getStyle('height'));
    assert.isNotNull($('auto_dimensions').getStyle('width'));
  });
  
  test("Element.getOpacity()", function() {
    assert.equal(0.45, $('op1').setOpacity(0.45).getOpacity());
  });
  
  test("Element.readAttribute()", function() {
    assert.equal('test.html' , $('attributes_with_issues_1').readAttribute('href'));
    assert.equal('L' , $('attributes_with_issues_1').readAttribute('accesskey'));
    assert.equal('50' , $('attributes_with_issues_1').readAttribute('tabindex'));
    assert.equal('a link' , $('attributes_with_issues_1').readAttribute('title'));
    
    $('cloned_element_attributes_issue').readAttribute('foo')
    var clone = $('cloned_element_attributes_issue').clone(true);
    clone.writeAttribute('foo', 'cloned');
    assert.equal('cloned', clone.readAttribute('foo'));
    assert.equal('original', $('cloned_element_attributes_issue').readAttribute('foo'));
    
    ['href', 'accesskey', 'accesskey', 'title'].each(function(attr) {
      assert.equal('' , $('attributes_with_issues_2').readAttribute(attr));
    }, this);
    
    ['checked','disabled','readonly','multiple'].each(function(attr) {
      assert.equal(attr, $('attributes_with_issues_'+attr).readAttribute(attr));
    }, this);
    
    assert.equal("alert('hello world');", $('attributes_with_issues_1').readAttribute('onclick'));
    assert.isNull($('attributes_with_issues_1').readAttribute('onmouseover'));
   
    assert.equal('date', $('attributes_with_issues_type').readAttribute('type'));
    assert.equal('text', $('attributes_with_issues_readonly').readAttribute('type'));
    
    var elements = $('custom_attributes').immediateDescendants();
    assertenum(['1', '2'], elements.invoke('readAttribute', 'foo'));
    assertenum(['2', null], elements.invoke('readAttribute', 'bar'));

    var table = $('write_attribute_table');
    assert.equal('4', table.readAttribute('cellspacing'));
    assert.equal('6', table.readAttribute('cellpadding'));
  });
  
  test("Element.writeAttribute()", function() {
    var element = Element.extend(document.body.appendChild(document.createElement('p')));
    assertRespondsTo('writeAttribute', element);
    assert.equal(element, element.writeAttribute('id', 'write_attribute_test'));
    assert.equal('write_attribute_test', element.id);
    assert.equal('http://prototypejs.org/', $('write_attribute_link').
      writeAttribute({href: 'http://prototypejs.org/', title: 'Home of Prototype'}).href);
    assert.equal('Home of Prototype', $('write_attribute_link').title);
    
    var element2 = Element.extend(document.createElement('p'));
    element2.writeAttribute('id', 'write_attribute_without_hash');
    assert.equal('write_attribute_without_hash', element2.id);
    element2.writeAttribute('animal', 'cat');
    assert.equal('cat', element2.readAttribute('animal'));
  });
  
  test("Element.writeAttribute() With Boolean Values", function() {
    var input = $('write_attribute_input'),
      select = $('write_attribute_select');
    assert( input.          writeAttribute('readonly').            hasAttribute('readonly'));
    assert(!input.          writeAttribute('readonly', false).     hasAttribute('readonly'));
    assert( input.          writeAttribute('readonly', true).      hasAttribute('readonly'));
    assert(!input.          writeAttribute('readonly', null).      hasAttribute('readonly'));
    assert( input.          writeAttribute('readonly', 'readonly').hasAttribute('readonly'));
    assert( select.         writeAttribute('multiple').            hasAttribute('multiple'));
    assert( input.          writeAttribute('disabled').            hasAttribute('disabled'));
  });
  test("Element.writeAttribute() For Checkbox", function() {
    var checkbox = $('write_attribute_checkbox'),
      checkedCheckbox = $('write_attribute_checked_checkbox');
    assert( checkbox.       writeAttribute('checked').             checked);
    assert( checkbox.       writeAttribute('checked').             hasAttribute('checked'));
    assert.equal('checked', checkbox.writeAttribute('checked').getAttribute('checked'));
    assert(!checkbox.       writeAttribute('checked').             hasAttribute('undefined'));
    assert( checkbox.       writeAttribute('checked', true).       checked);
    assert( checkbox.       writeAttribute('checked', true).       hasAttribute('checked'));
    assert( checkbox.       writeAttribute('checked', 'checked').  checked);
    assert( checkbox.       writeAttribute('checked', 'checked').  hasAttribute('checked'));
    assert(!checkbox.       writeAttribute('checked', null).       checked);
    assert(!checkbox.       writeAttribute('checked', null).       hasAttribute('checked'));
    assert(!checkbox.       writeAttribute('checked', true).       hasAttribute('undefined'));
    assert(!checkedCheckbox.writeAttribute('checked', false).      checked);
    assert(!checkbox.       writeAttribute('checked', false).      hasAttribute('checked'));
  });
  test("Element.writeAttribute() For Style", function() {
    var element = Element.extend(document.body.appendChild(document.createElement('p')));
    assert( element.        writeAttribute('style', 'color: red'). hasAttribute('style'));
    assert(!element.        writeAttribute('style', 'color: red'). hasAttribute('undefined'));
  });

  test("Element.writeAttribute() With Issues", function() {
    var input = $('write_attribute_input').writeAttribute({maxlength: 90, tabindex: 10}),
      td = $('write_attribute_td').writeAttribute({valign: 'bottom', colspan: 2, rowspan: 2});
    assert.equal("90", input.readAttribute('maxlength'));
    assert.equal("10", input.readAttribute('tabindex'));
    assert.equal("2",  td.readAttribute('colspan'));
    assert.equal("2",  td.readAttribute('rowspan'));
    assert.equal('bottom', td.readAttribute('valign'));
    
    var p = $('write_attribute_para'), label = $('write_attribute_label');
    assert.equal('some-class',     p.    writeAttribute({'class':   'some-class'}).    readAttribute('class'));
    assert.equal('some-className', p.    writeAttribute({className: 'some-className'}).readAttribute('class'));
    assert.equal('some-id',        label.writeAttribute({'for':     'some-id'}).       readAttribute('for'));
    assert.equal('some-other-id',  label.writeAttribute({htmlFor:   'some-other-id'}). readAttribute('for'));
    
    assert(p.writeAttribute({style: 'width: 5px;'}).readAttribute('style').toLowerCase().include('width'));      

    var table = $('write_attribute_table');
    table.writeAttribute('cellspacing', '2')
    table.writeAttribute('cellpadding', '3')
    assert.equal('2', table.readAttribute('cellspacing'));
    assert.equal('3', table.readAttribute('cellpadding'));

    var iframe = new Element('iframe', { frameborder: 0 });
    assert.strictEqual(0, parseInt(iframe.readAttribute('frameborder')));
  });
  
  test("Element.writeAttribute() With Custom", function() {
    var p = $('write_attribute_para').writeAttribute({name: 'martin', location: 'stockholm', age: 26});
    assert.equal('martin',    p.readAttribute('name'));
    assert.equal('stockholm', p.readAttribute('location'));
    assert.equal('26',        p.readAttribute('age'));
  });
  
  test("Element.hasAttribute()", function() {
    var label = $('write_attribute_label');
    assert.strictEqual(true,  label.hasAttribute('for'));
    assert.strictEqual(false, label.hasAttribute('htmlFor'));
    assert.strictEqual(false, label.hasAttribute('className'));
    assert.strictEqual(false, label.hasAttribute('rainbows'));
    
    var input = $('write_attribute_input');
    assert.notStrictEqual(null, input.hasAttribute('readonly'));
    assert.notStrictEqual(null, input.hasAttribute('readOnly'));
  });
  
  test("new Element()", function() {
    assert(new Element('h1'));
    
    var XHTML_TAGS = $w(
      'a abbr acronym address area '+
      'b bdo big blockquote br button caption '+
      'cite code col colgroup dd del dfn div dl dt '+
      'em fieldset form h1 h2 h3 h4 h5 h6 hr '+
      'i iframe img input ins kbd label legend li '+
      'map object ol optgroup option p param pre q samp '+
      'script select small span strong style sub sup '+
      'table tbody td textarea tfoot th thead tr tt ul var');
      
    XHTML_TAGS.each(function(tag, index) {
      var id = tag + '_' + index, element = document.body.appendChild(new Element(tag, {id: id}));
      assert.equal(tag, element.tagName.toLowerCase());
      assert.equal(element, document.body.lastChild);
      assert.equal(id, element.id);
    });
    
    
    assertRespondsTo('update', new Element('div'));
    Element.addMethods({
      cheeseCake: function(){
        return 'Cheese cake';
      }
    });
    
    assertRespondsTo('cheeseCake', new Element('div'));
    
    /* window.ElementOld = function(tagName, attributes) { 
      if (Prototype.Browser.IE && attributes && attributes.name) { 
        tagName = '<' + tagName + ' name="' + attributes.name + '">'; 
        delete attributes.name; 
      } 
      return Element.extend(document.createElement(tagName)).writeAttribute(attributes || {}); 
    };
    
    this.benchmark(function(){
      XHTML_TAGS.each(function(tagName) { new Element(tagName) });
    }, 5);
    
    this.benchmark(function(){
      XHTML_TAGS.each(function(tagName) { new ElementOld(tagName) });
    }, 5); */
    
    assert.equal('foobar', new Element('a', {custom: 'foobar'}).readAttribute('custom'));
    var input = document.body.appendChild(new Element('input', 
      {id: 'my_input_field_id', name: 'my_input_field'}));
    assert.equal(input, document.body.lastChild);
    assert.equal('my_input_field', $(document.body.lastChild).name);
    if ('outerHTML' in document.documentElement) {
      assert.match($('my_input_field_id').outerHTML,/name=["']?my_input_field["']?/);
      //'
    }

    //disable this check as it will never fire
    // if (originalElement && Prototype.BrowserFeatures.ElementExtensions) {
    //   Element.prototype.fooBar = Prototype.emptyFunction
    //   assertRespondsTo('fooBar', new Element('div'));
    // }
    
    elWithClassName = new Element('div', { 'className': 'firstClassName' });
    assert(elWithClassName.hasClassName('firstClassName'));
    
    elWithClassName = new Element('div', { 'class': 'firstClassName' });
    assert(elWithClassName.hasClassName('firstClassName'));
    
    var radio = new Element('input', { type: 'radio', value: 'test' });
    assert(radio.value === 'test', 'value of a dynamically-created radio button');
    
    var radio2 = new Element('input', { type: 'radio', value: 'test2' });
    assert(radio2.value === 'test2', 'value of a dynamically-created radio button');
  });

  test("Element.getHeight()", function() {
    assert.strictEqual(100, $('dimensions-visible').getHeight());
    assert.strictEqual(100, $('dimensions-display-none').getHeight());
  });
  
  test("Element.getWidth()", function() {
    assert.strictEqual(200, $('dimensions-visible').getWidth(), '#dimensions-visible');
    assert.strictEqual(200, $('dimensions-display-none').getWidth(), '#dimensions-display-none');
  });
  
  test("Element.getDimensions()", function() {
    assert.strictEqual(100, $('dimensions-visible').getDimensions().height);
    assert.strictEqual(200, $('dimensions-visible').getDimensions().width);
    assert.strictEqual(100, $('dimensions-display-none').getDimensions().height);
    assert.strictEqual(200, $('dimensions-display-none').getDimensions().width);
    
    assert.strictEqual(100, $('dimensions-visible-pos-rel').getDimensions().height);
    assert.strictEqual(200, $('dimensions-visible-pos-rel').getDimensions().width);
    assert.strictEqual(100, $('dimensions-display-none-pos-rel').getDimensions().height);
    assert.strictEqual(200, $('dimensions-display-none-pos-rel').getDimensions().width);
    
    assert.strictEqual(100, $('dimensions-visible-pos-abs').getDimensions().height);
    assert.strictEqual(200, $('dimensions-visible-pos-abs').getDimensions().width);
    assert.strictEqual(100, $('dimensions-display-none-pos-abs').getDimensions().height);
    assert.strictEqual(200, $('dimensions-display-none-pos-abs').getDimensions().width);
    
    // known failing issue
    // assert($('dimensions-nestee').getDimensions().width <= 500, 'check for proper dimensions of hidden child elements');
    
    $('dimensions-td').hide();
    assert.strictEqual(100, $('dimensions-td').getDimensions().height);
    assert.strictEqual(200, $('dimensions-td').getDimensions().width);
    $('dimensions-td').show();
    
    $('dimensions-tr').hide();
    assert.strictEqual(100, $('dimensions-tr').getDimensions().height);
    assert.strictEqual(200, $('dimensions-tr').getDimensions().width);
    $('dimensions-tr').show();
    
    $('dimensions-table').hide();
    assert.strictEqual(100, $('dimensions-table').getDimensions().height);
    assert.strictEqual(200, $('dimensions-table').getDimensions().width);
  });
      
  test("DOM Attributes Have Precedence Over Extended Element Methods", function() {
    assert.doesNotThrow(function() { $('dom_attribute_precedence').down('form') });
    assert.equal($('dom_attribute_precedence').down('input'), $('dom_attribute_precedence').down('form').update);
  });
  
  test("Element.classNames() [deprecated]", function() {
    assertenum([], $w($('class_names').className));
    assertenum(['A'], $w($('class_names').down().className));
    assertenum(['A', 'B'], $w($('class_names_ul').className));
  });
  
  test("Element.hasClassName()", function() {
    assert.strictEqual(false, $('class_names').hasClassName('does_not_exist'));
    assert.strictEqual(true, $('class_names').down().hasClassName('A'));
    assert.strictEqual(false, $('class_names').down().hasClassName('does_not_exist'));
    assert.strictEqual(true, $('class_names_ul').hasClassName('A'));
    assert.strictEqual(true, $('class_names_ul').hasClassName('B'));
    assert.strictEqual(false, $('class_names_ul').hasClassName('does_not_exist'));
  });
  
  test("Element.addClassName()", function() {
    $('class_names').addClassName('added_className');
    assertenum(['added_className'], $w($('class_names').className));

    $('class_names').addClassName('added_className'); // verify that className cannot be added twice.
    assertenum(['added_className'], $w($('class_names').className));
    
    $('class_names').addClassName('another_added_className');
    assertenum(['added_className', 'another_added_className'], $w($('class_names').className));
  });
  
  test("Element.removeClassName()", function() {
    $('class_names').removeClassName('added_className');
    assertenum(['another_added_className'], $w($('class_names').className));
    
    $('class_names').removeClassName('added_className'); // verify that removing a non existent className is safe.
    assertenum(['another_added_className'], $w($('class_names').className));
    
    $('class_names').removeClassName('another_added_className');
    assertenum([], $w($('class_names').className));
  });
  
  test("Element.toggleClassName()", function() {
    $('class_names').toggleClassName('toggled_className');
    assertenum(['toggled_className'], $w($('class_names').className));
    
    $('class_names').toggleClassName('toggled_className');
    assertenum([], $w($('class_names').className));
    
    $('class_names_ul').toggleClassName('toggled_className');
    assertenum(['A', 'B', 'toggled_className'], $w($('class_names_ul').className));
           
    $('class_names_ul').toggleClassName('toggled_className');
    assertenum(['A', 'B'], $w($('class_names_ul').className));
  });
  
  test("Element.scrollTo()", function() {
    var elem = $('scroll_test_2');
    Element.scrollTo('scroll_test_2');
    assert.equal(Position.page(elem)[1], 0);
    window.scrollTo(0, 0);
    
    elem.scrollTo();
    assert.equal(Position.page(elem)[1], 0);      
    window.scrollTo(0, 0);
  });
  
  test("Custom Element Methods", function() {
    var elem = $('navigation_test_f');
    assertRespondsTo('hashBrowns', elem);
    assert.equal('hash browns', elem.hashBrowns());
    
    assertRespondsTo('hashBrowns', Element);
    assert.equal('hash browns', Element.hashBrowns(elem));
  });
  
  test("Specific Custom Element Methods", function() {
    var elem = $('navigation_test_f');
    
    assert(Element.Methods.ByTag[elem.tagName]);
    assertRespondsTo('pancakes', elem);
    assert.equal("pancakes", elem.pancakes());
    
    var elem2 = $('test-visible');

    assert(Element.Methods.ByTag[elem2.tagName]);
    assert.isUndefined(elem2.pancakes);
    assertRespondsTo('waffles', elem2);
    assert.equal("waffles", elem2.waffles());
    
    assertRespondsTo('orangeJuice', elem);
    assertRespondsTo('orangeJuice', elem2);
    assert.equal("orange juice", elem.orangeJuice());
    assert.equal("orange juice", elem2.orangeJuice());
    
    assert(typeof Element.orangeJuice == 'undefined');
    assert(typeof Element.pancakes == 'undefined');
    assert(typeof Element.waffles == 'undefined');
  });
  
  test("Script Fragment", function() {
    var element = document.createElement('div');
    // tests an issue with Safari 2.0 crashing when the ScriptFragment
    // regular expression is using a pipe-based approach for
    // matching any character
    ['\r','\n',' '].each(function(character){
      $(element).update("<script>"+character.times(10000)+"</scr"+"ipt>");
      assert.equal('', element.innerHTML);
    }, this);
    $(element).update("<script>var blah='"+'\\'.times(10000)+"'</scr"+"ipt>");
    assert.equal('', element.innerHTML);
  });

  test("Element.positionedOffset()",function() {
    assertenum({0:10,1:10,top:10,left:10},
      $('body_absolute').positionedOffset(), '#body_absolute');
    assertenum({0:10,1:10,top:10,left:10},
      $('absolute_absolute').positionedOffset(), '#absolute_absolute');
    assertenum({0:10,1:10,top:10,left:10},
      $('absolute_relative').positionedOffset(), '#absolute_relative');
    assertenum({0:0,1:10,left:0,top:10},
      $('absolute_relative_undefined').positionedOffset(), '#absolute_relative_undefined');
    assertenum({0:10,1:10,left:10,top:10},
      $('absolute_fixed_absolute').positionedOffset(), '#absolute_fixed_absolute');
      
    var afu = $('absolute_fixed_undefined');
    assertenum({0:afu.offsetTop,1:afu.offsetLeft,left:afu.offsetLeft, top:afu.offsetTop},
      afu.positionedOffset(), '#absolute_fixed_undefined');
      
    var element = new Element('div'), offset = element.positionedOffset();
    assertenum({0:0,1:0,left:0,top:0}, offset, 'new element');
    assert.strictEqual(0, offset.top, 'new element top');
    assert.strictEqual(0, offset.left, 'new element left');
  });
  
  test("Element.cumulativeOffset()", function() {
    var element = new Element('div'), offset = element.cumulativeOffset();
    assertenum({0:0,1:0,left:0,top:0}, offset, 'new element');
    assert.strictEqual(0, offset.top, 'new element top');
    assert.strictEqual(0, offset.left, 'new element left');
    
    var innerEl = new Element('div'), outerEl = new Element('div');
    outerEl.appendChild(innerEl);
    assertenum({0:0,1:0,left:0,top:0}, innerEl.cumulativeOffset(), 'new inner element');
  });
  
  test("Element.viewportOffset()", function() {
    assertenum({0:10,1:10,left:10,top:10},$('body_absolute').viewportOffset());
    assertenum({0:20,1:20,left:20,top:20},$('absolute_absolute').viewportOffset());
    assertenum({0:20,1:20,left:20,top:20},$('absolute_relative').viewportOffset());
    assertenum({0:20,1:30,left:20,top:30},$('absolute_relative_undefined').viewportOffset());
    var element = new Element('div'), offset = element.viewportOffset();
    assertenum({0:0,1:0,left:0,top:0}, offset);
    assert.strictEqual(0, offset.top);
    assert.strictEqual(0, offset.left);
  });
  
  test("Element.offsetParent()", function() {
    assert.equal('body_absolute', $('absolute_absolute').getOffsetParent().id,
     '#body_absolute should be parent of #absolute_absolute');
    assert.equal('body_absolute', $('absolute_relative').getOffsetParent().id, 
     '#body_absolute should be parent of #absolute_relative');
    assert.equal('absolute_relative', $('inline').getOffsetParent().id,
     '#absolute_relative should be parent of #inline');
    assert.equal('absolute_relative', $('absolute_relative_undefined').getOffsetParent().id,
     '#absolute_relative should be parent of #absolute_relative_undefined');
    
    assert.equal(document.body, new Element('div').getOffsetParent(),
     'body should be parent of unattached element');
     
    [document, document.body, document.documentElement].each (function(node) {
      assert.equal(document.body, Element.getOffsetParent(node));
    });
  });

  test("Element.absolutize()", function() {
    $('notInlineAbsoluted', 'inlineAbsoluted').each(function(elt) {
      if ('_originalLeft' in elt) delete elt._originalLeft;
      elt.absolutize();
      assert.isUndefined(elt._originalLeft, 'absolutize() did not detect absolute positioning');
    });
    // invoking on "absolute" positioned element should return element 
    var element = $('absolute_fixed_undefined').setStyle({position: 'absolute'});
    assert.equal(element, element.absolutize());
  });
  
  test("Element.relativize()", function() {
    // invoking on "relative" positioned element should return element
    var element = $('absolute_fixed_undefined').setStyle({position: 'relative'});
    assert.equal(element, element.relativize());
  });
  
  test("document.viewport.getDimensions()", function(done) {
    var original = document.viewport.getDimensions();
    
    window.resizeTo(800, 600);
    
    setTimeout(function() {
      var before = document.viewport.getDimensions();
      
      var delta = { width: 800 - before.width, height: 600 - before.height };
      
      window.resizeBy(50, 50);
      setTimeout(function() {
        var after  = document.viewport.getDimensions();
        
        // Assume that JavaScript window resizing is disabled if before width
        // and after width are the same.
        if (before.width === after.width) {
          RESIZE_DISABLED = true;
          console.log("SKIPPING REMAINING TESTS (JavaScript window resizing disabled)");
          done();
          return;
        }

        assert.equal(before.width + 50, after.width,
         "NOTE: YOU MUST ALLOW JAVASCRIPT TO RESIZE YOUR WINDOW FOR THIS TEST TO PASS");
        assert.equal(before.height + 50, after.height,
         "NOTE: YOU MUST ALLOW JAVASCRIPT TO RESIZE YOUR WINDOW FOR THIS TEST TO PASS");
        
        setTimeout(function() {
          // Restore original dimensions.
          window.resizeTo(
            original.width  + delta.width,
            original.height + delta.height
          );
          done();
        },1000);
      },1000)
    },1000);
  });
  
  test("Element To Viewport Dimensions Does Not Affect Document Properties", function() {
    // No properties on the document should be affected when resizing
    // an absolute positioned(0,0) element to viewport dimensions
    var vd = document.viewport.getDimensions();

    var before = documentViewportProperties.inspect();
    $('elementToViewportDimensions').setStyle({ height: vd.height + 'px', width: vd.width + 'px' }).show();
    var after = documentViewportProperties.inspect();
    $('elementToViewportDimensions').hide();

    documentViewportProperties.properties.each(function(prop) {
      assert.equal(before[prop], after[prop], prop + ' was affected');
    });
  });

  test("Viewport Scroll Offsets", function(done) {
    var original = document.viewport.getDimensions();
    
    window.scrollTo(0, 0);
    assert.equal(0, document.viewport.getScrollOffsets().top);
  
    window.scrollTo(0, 35);
    assert.equal(35, document.viewport.getScrollOffsets().top);
    
    if (RESIZE_DISABLED)
    {
      console.log("SKIPPING REMAINING TESTS (JavaScript window resizing disabled)");
      done();
      return;
    }
    
    window.resizeTo(200, 650);
    
    setTimeout(function() {
      var before = document.viewport.getDimensions();
      var delta = { width: 200 - before.width, height: 650 - before.height };
      
      window.scrollTo(25, 35);
      assert.equal(25, document.viewport.getScrollOffsets().left,
       "NOTE: YOU MUST ALLOW JAVASCRIPT TO RESIZE YOUR WINDOW FOR THESE TESTS TO PASS");
      
      setTimeout(function() {
        // Restore original dimensions.
        window.resizeTo(
          original.width  + delta.width,
          original.height + delta.height
        );
        done();
      },1000);
    },1000);
  });
  
  test("NodeConstants", function() {
    assert(window.Node, 'window.Node is unavailable');

    var constants = $H({
      ELEMENT_NODE: 1,
      ATTRIBUTE_NODE: 2,
      TEXT_NODE: 3,
      CDATA_SECTION_NODE: 4,
      ENTITY_REFERENCE_NODE: 5,
      ENTITY_NODE: 6,
      PROCESSING_INSTRUCTION_NODE: 7,
      COMMENT_NODE: 8,
      DOCUMENT_NODE: 9,
      DOCUMENT_TYPE_NODE: 10,
      DOCUMENT_FRAGMENT_NODE: 11,
      NOTATION_NODE: 12
    });

    constants.each(function(pair) {
      assert.equal(Node[pair.key], pair.value);
    });
  });
  
  test("Element.storage()", function() {
    var element = $('test-empty');
    element.store('foo', 'bar');
    assert.equal("bar", element.retrieve("foo"), "Setting and reading a property");
    var result = element.store('foo', 'thud');
    assert.equal("thud", element.retrieve("foo"), "Re-setting and reading property");
    assert.strictEqual(element, result, "Element#store should return element");

    element.store('bar', 'narf');
    assertenum($w('foo bar'), element.getStorage().keys(), "Getting the storage hash");    
    element.getStorage().unset('bar');
    assertenum($w('foo'), element.getStorage().keys(), "Getting the storage hash after unsetting a key");
    
    element.store({ 'narf': 'narf', 'zort': 'zort' });
    
    assert.equal("narf", element.retrieve('narf'), "Storing multiple properties at once");
    assert.equal("zort", element.retrieve('zort'), "Storing multiple properties at once");
    
    assert.isUndefined(element.retrieve('bar'), "Undefined key should return undefined if default value is not defined");
    assert.equal("default", element.retrieve('bar', 'default'), "Return default value if undefined key");
    assert.equal("default", element.retrieve('bar'), "Makes sure default value has been set properly");
    
    
    $('test-empty').store('foo', 'bar');
    var clonedElement = $('test-empty').clone(false);
    assert.equal(
      clonedElement.retrieve('foo', null),
      null,
      "Cloning a node should not confuse the storage engine"
    );
  });
  
  test("Element.clone()", function() {
    var element = new Element('div', {
      title: 'bar'
    });
    element.className = 'foo';
    
    // add child
    element.update('<span id="child">child node</span>');
    
    // add observer
    element.observe('click', Prototype.emptyFunction);
    
    // add observer on a child
    element.down('span').observe('dblclick', Prototype.emptyFunction);
    
    element.store('foo', 'bar');
    element.down('span').store('baz', 'thud');

    var shallowClone = element.clone();
    var deepClone = element.clone(true);
    
    var assertCloneTraits = (function(clone) {
      assert(clone, 'clone should exist');
      assert(clone.show, 'clone should be extended');
      assert.equal('DIV', clone.nodeName.toUpperCase(),
       'clone should have proper tag name');
      assert.equal('foo', clone.className, 
       'clone should have proper attributes');
      assert.equal('bar', clone.title,
       'clone should have proper title');
       
      assert.equal(
        clone.retrieve('foo', false),
        false,
        'clone should not share storage with original'
      );
    }).bind(this);
    
    // test generic traits of both deep and shallow clones first
    assertCloneTraits(shallowClone);
    assertCloneTraits(deepClone);
    
    // test deep clone traits
    assert(deepClone.firstChild,
     'deep clone should have children');
    assert.equal('SPAN', deepClone.firstChild.nodeName.toUpperCase(),
     "deep clone's children should have proper tag name");
    assert.equal(
      deepClone.down('span').retrieve('baz', false),
      false,
      "deep clone's child should not share storage with original's child"
    );
  });
  
  test("Element.purge()", function() {
    function uidForElement(elem) {
      return elem.uniqueID ? elem.uniqueID : elem._prototypeUID;
    }
    
    var element = new Element('div');
    element.store('foo', 'bar');
    
    var uid = uidForElement(element);
    assert(uid in Element.Storage, "newly-created element's uid should exist in `Element.Storage`");

    var storageKeysBefore = Object.keys(Element.Storage).length;
    element.purge();
    var storageKeysAfter = Object.keys(Element.Storage).length;

    assert.equal(
      storageKeysAfter,
      storageKeysBefore - 1,
      "purged element's UID should no longer exist in `Element.Storage`"
    );
    
    // Should purge elements replaced via innerHTML.
    var parent = new Element('div');
    var child = new Element('p').update('lorem ipsum');
    
    parent.insert(child);    
    child.store('foo', 'bar');
    
    var trigger = false;    
    child.observe('click', function(event) { trigger = true; });
    var childUID = child._prototypeUID;

    storageKeysBefore = Object.keys(Element.Storage).length;
    parent.update("");
    storageKeysAfter = Object.keys(Element.Storage).length;
    
    // At this point, `child` should have been purged.
    assert.equal(
      storageKeysAfter,
      storageKeysBefore - 1,
      "purged element's UID should no longer exist in `Element.Storage`"
    );
    
    // Simulate a click to be sure the element's handler has been
    // unregistered.
    simulateClick(child);
    assert(!trigger, "fired event should not have triggered handler");
  });
});

function preservingBrowserDimensions(callback) {
  var original = document.viewport.getDimensions();
  
  window.resizeTo(640, 480);
  
  var resized = document.viewport.getDimensions();
  original.width += 640 - resized.width, original.height += 480 - resized.height;
  
  try {
    window.resizeTo(original.width, original.height);
    callback();
  } catch(e) {
    throw e;
  }finally {
    window.resizeTo(original.width, original.height);
  }
}