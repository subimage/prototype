var eventResults = {};
var originalElement = window.Element;

var documentLoaded = document.loaded;

suite("Event Namespace",function(){
  this.timeout(0)
  // test firing an event and observing it on the element it's fired from
  test("Custom Event Firing", function() {
    var span = $("span"), fired = false, observer = function(event) {
      assert.equal(span, event.element());
      assert.equal(1, event.memo.index);
      fired = true;
    };
    
    span.observe("test:somethingHappened", observer);
    span.fire("test:somethingHappened", { index: 1 });
    assert(fired);
    
    fired = false;
    span.fire("test:somethingElseHappened");
    assert(!fired);
    
    span.stopObserving("test:somethingHappened", observer);
    span.fire("test:somethingHappened");
    assert(!fired);
  });
  
  // test firing an event and observing it on a containing element
  test("Custom Event Bubbling", function() {
    var span = $("span"), outer = $("outer"), fired = false, observer = function(event) {
      assert.equal(span, event.element());
      fired = true;
    };
    
    outer.observe("test:somethingHappened", observer);
    span.fire("test:somethingHappened");
    assert(fired);
    
    fired = false;
    span.fire("test:somethingElseHappened");
    assert(!fired);
    
    outer.stopObserving("test:somethingHappened", observer);
    span.fire("test:somethingHappened");
    assert(!fired);
  });
  
  test("Custom Event Canceling", function() {
    var span = $("span"), outer = $("outer"), inner = $("inner");
    var fired = false, stopped = false;

    function outerObserver(event) {
      fired = span == event.element();
    }
    
    function innerObserver(event) {
      event.stop();
      stopped = true;
    }
    
    inner.observe("test:somethingHappened", innerObserver);
    outer.observe("test:somethingHappened", outerObserver);
    span.fire("test:somethingHappened");
    assert(stopped);
    assert(!fired);
    
    fired = stopped = false;
    inner.stopObserving("test:somethingHappened", innerObserver);
    span.fire("test:somethingHappened");
    assert(!stopped);
    assert(fired);
    
    outer.stopObserving("test:somethingHappened", outerObserver);
  });
  
  test("Event Object Is Extended", function() { 
    var span = $("span"), event, observedEvent, observer = function(e) { observedEvent = e };
    span.observe("test:somethingHappened", observer);
    event = span.fire("test:somethingHappened");
    assert.equal(event, observedEvent);
    assert.equal(Event.Methods.stop.methodize(), event.stop);
    span.stopObserving("test:somethingHappened", observer);
    
    event = span.fire("test:somethingHappenedButNoOneIsListening");
    assert.equal(Event.Methods.stop.methodize(), event.stop);
  });
  
  test("Event Observers Are Bound To The Observed Element", function() {
    var span = $("span"), target, observer = function() { target = this };
    
    span.observe("test:somethingHappened", observer);
    span.fire("test:somethingHappened");
    span.stopObserving("test:somethingHappened", observer);
    assert.equal(span, target);
    target = null;
    
    var outer = $("outer");
    outer.observe("test:somethingHappened", observer);
    span.fire("test:somethingHappened");
    outer.stopObserving("test:somethingHappened", observer);
    assert.equal(outer, target);
  });
  
  test("Multiple Custom Event Observers With The Same Handler", function() {
    var span = $("span"), count = 0, observer = function() { count++ };
    
    span.observe("test:somethingHappened", observer);
    span.observe("test:somethingElseHappened", observer);
    span.fire("test:somethingHappened");
    assert.equal(1, count);
    span.fire("test:somethingElseHappened");
    assert.equal(2, count);
  });

  test("Multiple Event Handlers Can Be Added And Removed From An Element", function() {
    var span = $("span"), count1 = 0, count2 = 0;
    var observer1 = function() { count1++ };
    var observer2 = function() { count2++ };

    span.observe("test:somethingHappened", observer1);
    span.observe("test:somethingHappened", observer2);
    span.fire("test:somethingHappened");
    assert.equal(1, count1);
    assert.equal(1, count2);

    span.stopObserving("test:somethingHappened", observer1);
    span.stopObserving("test:somethingHappened", observer2);
    span.fire("test:somethingHappened");
    assert.equal(1, count1); 
    assert.equal(1, count2);
  });
  
  test("Stop Observing Without Arguments", function() {
    var span = $("span"), count = 0, observer = function() { count++ };
    
    span.observe("test:somethingHappened", observer);
    span.observe("test:somethingElseHappened", observer);
    span.stopObserving();
    span.fire("test:somethingHappened");
    assert.equal(0, count);
    span.fire("test:somethingElseHappened");
    assert.equal(0, count);
  });
  
  test("Stop Observing Without Handler Argument", function() {
    var span = $("span"), count = 0, observer = function() { count++ };
    
    span.observe("test:somethingHappened", observer);
    span.observe("test:somethingElseHappened", observer);
    span.stopObserving("test:somethingHappened");
    span.fire("test:somethingHappened");
    assert.equal(0, count);
    span.fire("test:somethingElseHappened");
    assert.equal(1, count);
    span.stopObserving("test:somethingElseHappened");
    span.fire("test:somethingElseHappened");
    assert.equal(1, count);
  });
  
  test("Stop Observing Removes Handler From Cache", function() {
    var span = $("span"), observer = Prototype.emptyFunction, eventID;
    
    span.observe("test:somethingHappened", observer);
    span.observe("test:somethingHappened", function() {});

    function uidForElement(elem) {
      return elem.uniqueID ? elem.uniqueID : elem._prototypeUID;
    }
    
    var registry = Event.cache[uidForElement(span)];
    
    assert(registry, 'registry should exist');
    assert(Object.isArray(registry['test:somethingHappened']));
    assert.equal(2, registry['test:somethingHappened'].length);
    
    span.stopObserving("test:somethingHappened", observer);
    
    registry = Event.cache[uidForElement(span)];
    
    assert(registry);
    assert(Object.isArray(registry['test:somethingHappened']));
    assert.equal(1, registry['test:somethingHappened'].length);
  });
  
  test("Last Stop Observing Cleares Cache", function() {
    var span = $("span"), observer = Prototype.emptyFunction, eventID;
    delete Event.cache[uidForElement(span)];

    span.observe("test:somethingHappened", observer);

    function uidForElement(elem) {
      return elem.uniqueID ? elem.uniqueID : elem._prototypeUID;
    }

    span.stopObserving("test:somethingHappened", observer);

    var registry = Event.cache[uidForElement(span)];

    assert(!registry);
//    console.info(registry)
  });

  test("Observe And Stop Observing Are Chainable", function() {
    var span = $("span"), observer = Prototype.emptyFunction;

    assert.equal(span, span.observe("test:somethingHappened", observer));
    assert.equal(span, span.stopObserving("test:somethingHappened", observer));

    span.observe("test:somethingHappened", observer);
    assert.equal(span, span.stopObserving("test:somethingHappened"));

    assert.equal(span, span.stopObserving("test:somethingOtherHappened", observer));

    span.observe("test:somethingHappened", observer);
    assert.equal(span, span.stopObserving());
    assert.equal(span, span.stopObserving()); // assert it again, after there are no observers

    span.observe("test:somethingHappened", observer);
    assert.equal(span, span.observe("test:somethingHappened", observer)); // try to reuse the same observer
    span.stopObserving();
  });

  test("Document Loaded", function() {
    assert(!documentLoaded);
    assert(document.loaded);
  });
  
  test("Document Content Loaded Event Fires Before Window Load", function() {
    assert(eventResults.contentLoaded, "contentLoaded");
    assert(eventResults.contentLoaded.endOfDocument, "contentLoaded.endOfDocument");
    assert(!eventResults.contentLoaded.windowLoad, "!contentLoaded.windowLoad");
    assert(eventResults.windowLoad, "windowLoad");
    assert(eventResults.windowLoad.endOfDocument, "windowLoad.endOfDocument");
    assert(eventResults.windowLoad.contentLoaded, "windowLoad.contentLoaded");
  });
  
  test("Event Stopped", function() {
    var span = $("span"), event;

    span.observe("test:somethingHappened", Prototype.emptyFunction);
    event = span.fire("test:somethingHappened");
    assert(!event.stopped, "event.stopped should be false with an empty observer");
    span.stopObserving("test:somethingHappened");
    
    span.observe("test:somethingHappened", function(e) { e.stop() });
    event = span.fire("test:somethingHappened");
    assert(event.stopped, "event.stopped should be true for an observer that calls stop");
    span.stopObserving("test:somethingHappened");
  });
  
  test("Non-Bubbling Custom Event", function() {
    var span = $('span'), outer = $('outer'), event;
    
    var outerRespondedToEvent = false;
    outer.observe("test:bubbleEvent", function(e) { outerRespondedToEvent = true });
    span.fire("test:bubbleEvent", {}, false);
    assert(!outerRespondedToEvent,'parent element should not respond to non-bubbling event fired on child');
  });

  test("Event Find Element", function() {
    var span = $("span"), event;
    event = span.fire("test:somethingHappened");
    assertElementsMatch([event.findElement()], 'span#span');
    assertElementsMatch([event.findElement('span')], 'span#span');
    assertElementsMatch([event.findElement('p')], 'p#inner');
    assert.equal(null, event.findElement('div.does_not_exist'));
    assertElementsMatch([event.findElement('.does_not_exist, span')], 'span#span');
  });
  
  test("Event ID Duplication", function() {
    $('eventcontainer').down().observe("test:somethingHappened", Prototype.emptyFunction);
    $('eventcontainer').innerHTML += $('eventcontainer').innerHTML;
    assert.isUndefined($('eventcontainer').down(1)._prototypeEventID);
  });
});

document.observe("dom:loaded", function(event) {

  eventResults.contentLoaded = {
    endOfDocument: eventResults.endOfDocument,
    windowLoad:    eventResults.windowLoad
  };
});

Event.observe(window, "load", function(event) {
  eventResults.windowLoad = {
    endOfDocument: eventResults.endOfDocument,
    contentLoaded: eventResults.contentLoaded
  };
});
