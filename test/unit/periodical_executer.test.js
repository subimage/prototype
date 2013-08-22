suite("PeriodicalExecuter",function(){
  test("PeriodicalExecuter.stop()",function(done) {
    var peEventCount = 0;
    function peEventFired(pe) {
      if (++peEventCount > 2) pe.stop();
    }

    // peEventFired will stop the PeriodicalExecuter after 3 callbacks
    new PeriodicalExecuter(peEventFired, 0.05);

    setTimeout(function() {
      assert.equal(3, peEventCount);
      done()
    },600);
  });

  test("OnTimer Event Method", function() {
    var testcase = this,
        pe = {
          onTimerEvent: PeriodicalExecuter.prototype.onTimerEvent,
          execute: function() {
            assert(pe.currentlyExecuting);
          }
        };

    pe.onTimerEvent();
    assert(!pe.currentlyExecuting);

    pe.execute = function() {
      assert(pe.currentlyExecuting);
      throw new Error()
    }
    assert.throws(pe.onTimerEvent.bind(pe));
    assert(!pe.currentlyExecuting);
  });
});