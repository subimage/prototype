
var handler;

function handle(selector, callback) {
  if (!callback) {
    callback = selector;
    selector = false;
  }
  return new Event.Handler("container", "test:event", selector, callback);
}


suite("Event Handler",function() {

    test("Handlers Do Nothing If .start() Has Not Been Called",function() {
      var fired = false;
      handler = handle(function() { fired = true });

      $("container").fire("test:event");
      assert(!fired);
    });

    test("Handlers Are Fired When .start() Is Called",function() {
      var fired = false;
      handler = handle(function() { fired = true });

      handler.start();
      assert(!fired);
      $("container").fire("test:event");
      assert(fired);
    });

    test("Handlers Do Not Fire After Starting And Then Stopping",function() {
      var fired = 0;
      handler = handle(function() { fired++ });

      handler.start();
      assert.equal(0, fired);
      $("container").fire("test:event");
      assert.equal(1, fired);
      handler.stop();
      $("container").fire("test:event");
      assert.equal(1, fired);
    });

    test("Handlers Without Selectors Pass The Target Element To Callbacks", function() {
      var span = $("container").down("span");
      handler = handle(function(event, element) {
        assert.equal(span, element);
      });

      handler.start();
      span.fire("test:event");
    });

    test("Handlers With Selectors Pass The Matched Element To Callbacks",function() {
      var link = $("container").down("a"), span = link.down("span");
      handler = handle("a", function(event, element) {
        assert.equal(link, element);
      });

      handler.start();
      span.fire("test:event");
    });

    test("Handlers With Selectors Do Not Call The Callback If No Matching Element Is Found",function() {
      var paragraph = $("container").down("p", 1), fired = false;
      handler = handle("a", function(event, element) { fired = true });

      handler.start();
      paragraph.fire("test:event");
      assert(!fired);
    });

    test("Handler Callbacks Are Bound To The Original Element",function() {
      var span = $("container").down("span"), element;
      handler = handle(function() { element = this });

      handler.start();
      span.fire("test:event");
      assert.equal($("container"), element);
    });

    test("Calling .start() Multiple Times Does Not Install Multiple Observers",function() {
      var fired = 0;
      handler = handle(function() { fired++ });

      handler.start();
      handler.start();
      $("container").fire("test:event");
      assert.equal(1, fired);
    });

    teardown(function() {
      try {
        handler.stop();
      } catch (e) {
      } finally {
        delete handler;
      }
    });
});