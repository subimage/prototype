var sys = require('sys')
var exec = require('child_process').exec;


console.log('Running Tests through PhantomJS')
describe("Running Tests through PhantomJS",function(){
	it("",function(done){
		function puts(error, stdout, stderr) {
			sys.puts(stdout)
			done()
		}
		exec('/usr/local/bin/mocha-phantomjs ./test/index.html',puts);
	});
});


