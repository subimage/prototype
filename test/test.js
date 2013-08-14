var sys = require('sys')
var exec = require('child_process').exec;
var open = require("open");
var env_to_test = [];

if(process.env.BROWSERS !== undefined)
{
	env_to_test = process.env.BROWSERS.split(',');
}

if(env_to_test.length == 0 || env_to_test.indexOf('phantomjs') !== -1)
{
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
}

if(env_to_test.length > 0)
{
	describe("Running Tests in Browsers",function(){
		if(env_to_test.indexOf('default') !== -1)
		{
			it("Default Browser",function(){
				open('file://'+process.cwd()+'/test/index.html')
			});
		}
		if(env_to_test.indexOf('chrome') !== -1)
		{
			it("Google Chrome",function(){
				open('file://'+process.cwd()+'/test/index.html',"Google Chrome")
			});
		}
		if(env_to_test.indexOf('safari') !== -1)
		{
			it("Safari",function(){
				open('file://'+process.cwd()+'/test/index.html',"Safari")
			});
		}
	});
}
