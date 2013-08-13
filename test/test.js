var sys = require('sys')
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;

describe("Running Tests through PhantomJS",function(){
	this.timeout(0)
	it("Base",function(done){
		exec('mocha-phantomjs ./test/index.html',function(error, stdout, stderr) {
			sys.puts(stdout)
			done()
		});
	});
	it("DOM",function(done){
		exec('mocha-phantomjs ./test/domtests.html',function(error, stdout, stderr) {
			sys.puts(stdout)
			done()
		});
	})
});

describe("Running Tests in deafult browser",function(){
	it("",function(){
		spawn('open', ['file://'+process.cwd()+'test/index.html']);
	});
});

