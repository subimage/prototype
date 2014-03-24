var Fixtures = {
  js: {
    responseBody:   '$("content").update("<H2>Hello world!</H2>");', 
    'Content-Type': '           text/javascript     '
  },
  
  html: {
    responseBody: "Pack my box with <em>five dozen</em> liquor jugs! " +
      "Oh, how <strong>quickly</strong> daft jumping zebras vex..."
  },
  
  xml: {
    responseBody:   '<?xml version="1.0" encoding="UTF-8" ?><name attr="foo">bar</name>', 
    'Content-Type': 'application/xml'
  },
  
  json: {
    responseBody:   '{\n\r"test": 123}', 
    'Content-Type': 'application/json'
  },
  
  jsonWithoutContentType: {
    responseBody:   '{"test": 123}'
  },
  
  invalidJson: {
    responseBody:   '{});window.attacked = true;({}',
    'Content-Type': 'application/json'
  },
  
  headerJson: {
    'X-JSON': '{"test": "hello #éà"}'
  }
};
var responderCounter = 0;

// lowercase comparison because of MSIE which presents HTML tags in uppercase
var sentence = ("Pack my box with <em>five dozen</em> liquor jugs! " +
"Oh, how <strong>quickly</strong> daft jumping zebras vex...").toLowerCase();

var message = 'You must be running your tests from rake to test this feature.';


var extendDefault = function(options) {
  return Object.extend({
    asynchronous: false,
    method: 'get',
    onException: function(r, e) { throw e; }
  }, options);
};


suite("AJAX Interactions",function(){
  this.timeout(10000);
  setup(function() {
    $('content').update('');
    $('content2').update('');
  });
  
  teardown(function() {
    // hack to cleanup responders
    Ajax.Responders.responders = [Ajax.Responders.responders[0]];
  });
  
  suite("HTTP Basic Authentication", function() {
    // Mock access to XHR via Sinon.js
    var ajaxStub;
    var mockTransport = {
      open: sinon.stub()
    };
    setup(function(){
      ajaxStub = sinon.stub(Ajax, 'getTransport').returns(mockTransport);
    });
    teardown(function(){
      ajaxStub.restore();
    });

    test("Initializes with undefined username / password", function() {
      var req = new Ajax.Request(
        "ajaxtest_assets/empty.html", {}
      );
      assert.equal(undefined, req.options.username);
      assert.equal(undefined, req.options.password);
    });
    test("Calls transport.open with specified username / password", function() {
      var url = 'ajaxtest_assets/empty.html';
      var user = 'foo';
      var pass = 'bar';
      var opts = {
        username: user,
        password: pass,
        asynchronous: false,
        method: 'GET'
      }
      var req = new Ajax.Request(url, opts);
      assert.ok(
        mockTransport.open.calledWith(
          opts.method, url, opts.asynchronous, user, pass
        )
      );
      
    });
  });

  test("Synchronous Request", function() {
    assert.equal("", $("content").innerHTML);
    
    assert.equal(0, Ajax.activeRequestCount);
    new Ajax.Request("ajaxtest_assets/hello.js", {
      asynchronous: false,
      method: 'GET',
      evalJS: 'force'
    });
    assert.equal(0, Ajax.activeRequestCount);
    
    var h2 = $("content").firstChild;
    assert.equal("Hello world!", h2.innerHTML);
  });
  
  test("Asynchronous Request", function(done) {
    assert.equal("", $("content").innerHTML);
    
    new Ajax.Request("ajaxtest_assets/hello.js", {
      asynchronous: true,
      method: 'get',
      evalJS: 'force'
    });
    setTimeout(function() {
      var h2 = $("content").firstChild;
      assert.equal("Hello world!", h2.innerHTML);
      done();
    },1000);
  });
  
  test("Updater", function(done) {
    assert.equal("", $("content").innerHTML);
    
    new Ajax.Updater("content", "ajaxtest_assets/content.html", { method:'get' });
    
    setTimeout(function() {
      assert.equal(sentence, $("content").innerHTML.strip().toLowerCase());
      
      $('content').update('');
      assert.equal("", $("content").innerHTML);
       
      new Ajax.Updater({ success:"content", failure:"content2" },
        "ajaxtest_assets/content.html", { method:'get', parameters:{ pet:'monkey' } });
      
      new Ajax.Updater("", "ajaxtest_assets/content.html", { method:'get', parameters:"pet=monkey" });
      
      setTimeout(function() {
        assert.equal(sentence, $("content").innerHTML.strip().toLowerCase());
        assert.equal("", $("content2").innerHTML);
        done();
      },1000);
    },1000); 
  });
  
  test("Updater With Insertion",function(done) {
    $('content').update();
    new Ajax.Updater("content", "ajaxtest_assets/content.html", { method:'get', insertion: Insertion.Top });
    setTimeout(function() {
      assert.equal(sentence, $("content").innerHTML.strip().toLowerCase());
      $('content').update();
      new Ajax.Updater("content", "ajaxtest_assets/content.html", { method:'get', insertion: 'bottom' });      
      setTimeout(function() {
        assert.equal(sentence, $("content").innerHTML.strip().toLowerCase());
        
        $('content').update();
        new Ajax.Updater("content", "ajaxtest_assets/content.html", { method:'get', insertion: 'after' });      
        setTimeout(function() {
          assert.equal('five dozen', $("content").next().innerHTML.strip().toLowerCase());
          done();
        },1000);
      },1000);
    },1000);
  });
  
  test("Updater Options",function() {
    var options = {
      method: 'get',
      asynchronous: false,
      evalJS: 'force',
      onComplete: Prototype.emptyFunction
    }
    var request = new Ajax.Updater("content", "ajaxtest_assets/hello.js", options);
    request.options.onComplete = Prototype.emptyFunction;
    assert.strictEqual(Prototype.emptyFunction, options.onComplete);
  });
  
  test("Responders",function(done){
    // check for internal responder
    assert.equal(1, Ajax.Responders.responders.length);
    
    var dummyResponder = {
      onComplete: Prototype.emptyFunction
    };
    
    Ajax.Responders.register(dummyResponder);
    assert.equal(2, Ajax.Responders.responders.length);
    
    // don't add twice
    Ajax.Responders.register(dummyResponder);
    assert.equal(2, Ajax.Responders.responders.length);
    
    Ajax.Responders.unregister(dummyResponder);
    assert.equal(1, Ajax.Responders.responders.length);
    
    var responder = {
      onCreate:   function(req){ responderCounter++ },
      onLoading:  function(req){ responderCounter++ },
      onComplete: function(req){ responderCounter++ }
    };
    Ajax.Responders.register(responder);
    
    assert.equal(0, responderCounter);
    assert.equal(0, Ajax.activeRequestCount);
    new Ajax.Request("ajaxtest_assets/content.html", { method:'get', parameters:"pet=monkey" });
    assert.equal(1, responderCounter);
    assert.equal(1, Ajax.activeRequestCount);
    
    setTimeout(function() {
      assert.equal(3, responderCounter);
      assert.equal(0, Ajax.activeRequestCount);
      done();
    },1000);
  });
  
  test("Eval Response Should Be Called Before onComplete",function() {
    assert.equal("", $("content").innerHTML);
  
    assert.equal(0, Ajax.activeRequestCount);
    new Ajax.Request("ajaxtest_assets/hello.js", extendDefault({
      onComplete: function(response) { 
        assert.notEqual("", $("content").innerHTML)
      }
    }));
    assert.equal(0, Ajax.activeRequestCount);
  
    var h2 = $("content").firstChild;
    assert.equal("Hello world!", h2.innerHTML);
  });
  
  test("Content Type Set For Simulated Verbs",function(done) {
    new Ajax.Request('/inspect', extendDefault({
      method: 'put',
      contentType: 'application/bogus',
      onComplete: function(response) {
        assert.equal('application/bogus; charset=UTF-8', response.responseJSON.headers['content-type']);
        done();
      }
    }));
  });
  
  suite("Sending Data In Request Body", function() {
    // Mock access to XHR via Sinon.js
    var ajaxStub;
    var mockTransport = {
      open: sinon.stub(),
      send: sinon.stub(),
      setRequestHeader: sinon.stub()
    };
    var url = "/inspect";
    var opts = {
      asynchronous: false,
      postBody: JSON.stringify({ foo: 'bar'})
    };
    setup(function(){
      ajaxStub = sinon.stub(Ajax, 'getTransport').returns(mockTransport);
    });
    teardown(function(){
      ajaxStub.restore();
    });
    
    test("Should Work For PUT", function(){
      opts.method = 'put';
      var req = new Ajax.Request(url, opts);
      assert.equal(req.body, opts.postBody);
      assert.ok(
        mockTransport.send.calledWith(opts.postBody)
      );
    });

    test("Should Work For POST", function(){
      opts.method = 'post';
      var req = new Ajax.Request(url, opts);
      assert.equal(req.body, opts.postBody);
      assert.ok(
        mockTransport.send.calledWith(opts.postBody)
      );
    });

  });

  // Ensure that we're following the XMLHttpRequest draft specification,
  // supporting the methods outlined here:
  //
  // https://dvcs.w3.org/hg/xhr/raw-file/tip/Overview.html
  //
  // Additionally, this article outlines what old browsers support what
  // methods.
  // http://annevankesteren.nl/2007/10/http-method-support
  suite("HTTP Method Support", function(){
    // Mock access to XHR via Sinon.js
    var ajaxStub;
    var mockTransport = {
      open: sinon.stub(),
      send: sinon.stub(),
      setRequestHeader: sinon.stub()
    };
    var standardMethods = ['GET', 'HEAD', 'POST', 'PUT', 'DELETE'];
    var url = "/inspect";
    var opts = { asynchronous: false };
    setup(function(){
      ajaxStub = sinon.stub(Ajax, 'getTransport').returns(mockTransport);
    });
    teardown(function(){
      ajaxStub.restore();
    });

    // https://prototype.lighthouseapp.com/projects/8886/tickets/583-simulation-of-put-over-post-not-working-correctly
    test("Content-Type able to be set on all methods", function(){
      standardMethods.each(function(m){
        opts.method = m;
        opts.contentType = 'text/xml';
        var req = new Ajax.Request(url, opts);
        //console.log(mockTransport.setRequestHeader.lastCall);
        assert.ok(
          mockTransport.setRequestHeader.calledWith('Content-type', "text/xml; charset=UTF-8"),
          ("Content-type not set for method: "+m)
        );
      });
    });

    suite("Default, options.emulateHTTP = false", function(){
      test("Standard verbs not transformed, no header set", function(){
        standardMethods.each(function(m){
          opts.method = m;
          var req = new Ajax.Request(url, opts);
          assert.equal(
            req.method, m.toLowerCase(),
            ("Method "+m+" unexpectedly emulated via "+req.method)
          );
          assert.notOk(
            mockTransport.setRequestHeader.calledWith('X-Http-Method-Override')
          );
        });
      });
    });

    // For supporting the old way of faking all requests if browsers or
    // server can't handle "new" RESTful methods.
    suite("options.emulateHTTP = true", function(){
      setup(function(){
        opts.emulateHTTP = true;
      });
      test("Fakes everything but POST / GET requests", function(){
        var methods = ['OPTIONS', 'PUT', 'DELETE'];
        methods.each(function(m){
          opts.method = m;
          var req = new Ajax.Request(url, opts);
          assert.equal(
            'post', req.method,
            ("Method "+m+" unexpectedly not emulated via POST")
          );
          assert.ok(
            mockTransport.setRequestHeader.calledWith('X-Http-Method-Override', m.toLowerCase()),
            ("RequestHeader not set for: "+m)
          );
        });
      });
    });
  });

  test("onCreate Callback",function(done) {
    new Ajax.Request("ajaxtest_assets/content.html", extendDefault({
      onCreate: function(transport) { assert.equal(0, transport.readyState) },
      onComplete: function(transport) { assert.notEqual(0, transport.readyState); done()}
    }));
  });
  
  test("EvalJS", function(done) {
    $('content').update();
    new Ajax.Request("/response", extendDefault({
      parameters: Fixtures.js,
      onComplete: function(transport) { 
        var h2 = $("content").firstChild;
        assert.equal("Hello world!", h2.innerHTML);
      }
    }));
    
    $('content').update();
    new Ajax.Request("/response", extendDefault({
      evalJS: false,
      parameters: Fixtures.js,
      onComplete: function(transport) { 
        assert.equal("", $("content").innerHTML);
      }
    }));
    
    $('content').update();
    new Ajax.Request("ajaxtest_assets/hello.js", extendDefault({
      evalJS: 'force',
      onComplete: function(transport) { 
        var h2 = $("content").firstChild;
        assert.equal("Hello world!", h2.innerHTML);
        done();
      }
    }));
  });

  test("Callbacks", function(done) {
    var options = extendDefault({
      onCreate: function(transport) { assert.isInstanceOf(transport,Ajax.Response) },
      onComplete: function(transport) { assert.isInstanceOf(transport,Ajax.Response) ; done() }
    });
    
    Ajax.Request.Events.each(function(state){
      if(state == 'Complete')
        return;
      options['on' + state] = options.onCreate;
    });

    new Ajax.Request("ajaxtest_assets/content.html", options);
  });

  test("Response Text", function(done) {
    new Ajax.Request("ajaxtest_assets/empty.html", extendDefault({
      onComplete: function(transport) { assert.equal('', transport.responseText) }
    }));
    
    new Ajax.Request("ajaxtest_assets/content.html", extendDefault({
      onComplete: function(transport) { assert.equal(sentence, transport.responseText.toLowerCase()) ; done() }
    }));
  });
  
  test("ResponseXML", function(done) {
      new Ajax.Request("/response", extendDefault({
        parameters: Fixtures.xml,
        onComplete: function(transport) { 
          assert.equal('foo', transport.responseXML.getElementsByTagName('name')[0].getAttribute('attr'))
          done();
        }
      }));
  });
      
  test("ResponseJSON", function(done) {
    new Ajax.Request("/response", extendDefault({
      parameters: Fixtures.json,
      onComplete: function(transport) { assert.equal(123, transport.responseJSON.test) }
    }));
    
    new Ajax.Request("/response", extendDefault({
      parameters: {
        'Content-Length': 0,
        'Content-Type': 'application/json'
      },
      onComplete: function(transport) { assert.isNull(transport.responseJSON)}
    }));
    
    new Ajax.Request("/response", extendDefault({
      evalJSON: false,
      parameters: Fixtures.json,
      onComplete: function(transport) { assert.isNull(transport.responseJSON) }
    }));
  
    new Ajax.Request("/response", extendDefault({
      parameters: Fixtures.jsonWithoutContentType,
      onComplete: function(transport) { assert.isNull(transport.responseJSON) }
    }));
  
    new Ajax.Request("/response", extendDefault({
      sanitizeJSON: true,
      parameters: Fixtures.invalidJson,
      onException: function(request, error) {
        assert.equal('SyntaxError', error.name);
      }
    }));
    
    new Ajax.Request("ajaxtest_assets/data.json", extendDefault({
      evalJSON: 'force',
      onComplete: function(transport) { assert.equal(123, transport.responseJSON.test); done() }
    }));
  });
  
  test("HeaderJSON", function(done) {
    new Ajax.Request("/response", extendDefault({
      parameters: Fixtures.headerJson,
      onComplete: function(transport, json) {
        assert.equal('hello #éà', transport.headerJSON.test);
        assert.equal('hello #éà', json.test);
      }
    }));
  
    new Ajax.Request("/response", extendDefault({
      onComplete: function(transport, json) { 
        assert.isNull(transport.headerJSON)
        assert.isNull(json)
        done();
      }
    }));
  });
  
  test("GetHeader", function() {
   new Ajax.Request("/response", extendDefault({
      parameters: { 'X-TEST': 'some value' },
      onComplete: function(transport) {
        assert.equal('some value', transport.getHeader('X-Test'));
        assert.isNull(transport.getHeader('X-Inexistant'));
      }
    }));
  });
  
  test("Parameters Can Be A Hash", function() {
      new Ajax.Request("/response", extendDefault({
        parameters: $H({ "one": "two", "three": "four" }),
        onComplete: function(transport) {
          assert.equal("two", transport.getHeader("one"));
          assert.equal("four", transport.getHeader("three"));
          assert.isNull(transport.getHeader("toObject"));
        }
      }));
  });
  
  test("Parameters String Order Is Preserved", function(done) {
      new Ajax.Request("/inspect", extendDefault({
        parameters: "cool=1&bad=2&cool=3&bad=4",
        method: 'post',
        onComplete: function(transport) {
          var body_without_wart = transport.responseJSON.body.match(/((?:(?!&_=$).)*)/)[1];
          assert.equal(body_without_wart,"cool=1&bad=2&cool=3&bad=4");
          done();
        }
      }));
  });
  
  test("Is Same Origin Method", function(done) {
    var isSameOrigin = Ajax.Request.prototype.isSameOrigin;
    assert(isSameOrigin.call({ url: '/foo/bar.html' }), '/foo/bar.html');
    assert(isSameOrigin.call({ url: window.location.toString() }), window.location);
    assert(!isSameOrigin.call({ url: 'http://example.com' }), 'http://example.com');

      Ajax.Request.prototype.isSameOrigin = function() {
        return false
      };

      $("content").update('same origin policy');
      new Ajax.Request("/response", extendDefault({
        parameters: Fixtures.js,
        onComplete: function(transport) { 
          assert.equal("same origin policy", $("content").innerHTML);
        }
      }));

      new Ajax.Request("/response", extendDefault({
        parameters: Fixtures.invalidJson,
        onException: function(request, error) {
          assert.equal('SyntaxError', error.name);
        }
      }));

      new Ajax.Request("/response", extendDefault({
        parameters: { 'X-JSON': '{});window.attacked = true;({}' },
        onException: function(request, error) {
          assert.equal('SyntaxError', error.name);
          done();
        }
      }));

      Ajax.Request.prototype.isSameOrigin = isSameOrigin;
  });
});