var sys = require('sys')
var exec = require('child_process').exec;
var fs = require("fs");
var open = require("open");
var assert = require("assert")

var env_to_test = [];
var wait_message = 'Waiting 20 seconds for Ajax/Form Tests to be completed';
var wait_time = 20000;


if(process.env.BROWSERS !== undefined)
{
	env_to_test = process.env.BROWSERS.split(',');
}

console.log('Starting test Webserver');

var webserver = require('./webserver.js');

if(env_to_test.length == 0 || env_to_test.indexOf('phantomjs') !== -1)
{
	describe("Running Tests through PhantomJS",function(){
		this.timeout(0)
		it("Base",function(done){
			exec('mocha-phantomjs ./test/index.html',function(error, stdout, stderr) {
				sys.puts(stdout);
				assert(!stdout.match(/failing/))
				done()
			});
		});
		it("Ajax",function(done){
			exec('mocha-phantomjs http://localhost:1337/test/ajaxtests.html',function(error,stdout,stderr){
				sys.puts(stdout);
				assert(!stdout.match(/failing/))
				done();
			})
		});
		it("DOM",function(done){
			exec('mocha-phantomjs ./test/domtests.html',function(error, stdout, stderr) {
				sys.puts(stdout)
				assert(!stdout.match(/failing/))
				done()
			});
		})
		it("Form",function(done){
			exec('mocha-phantomjs http://localhost:1337/test/formtests.html',function(error,stdout,stderr){
				sys.puts(stdout);
				assert(!stdout.match(/failing/))
				done();
			})
		});
		it("Selector",function(done){
			exec('mocha-phantomjs ./test/selectortests.html',function(error,stdout,stderr){
				sys.puts(stdout);
				assert(!stdout.match(/failing/))
				done();
			})
		});
		it("Layout",function(done){
			exec('mocha-phantomjs ./test/layouttests.html',function(error,stdout,stderr){
				sys.puts(stdout);
				assert(!stdout.match(/failing/))
				done();
			})
		});
	});
}

if(env_to_test.length > 0)
{
	describe("Running Tests in Browsers",function(){
		this.timeout(0);
		afterEach(function(done){
			setTimeout(function(){
				done();
			},500);
		});
		if(env_to_test.indexOf('default') !== -1)
		{
			it("Default Browser Base",function(){
				open('file://'+process.cwd()+'/test/index.html');
			});
			it("Default Browser Ajax",function(done){
				setup(function(done){
					setTimeout(function(){
						done()
					},500);
				});
				open('http://localhost:1337/test/ajaxtests.html',function(){
					console.log(wait_message);
					setTimeout(function(){
						done();
					},wait_time)
				});
			});
			it("Default Browser DOM",function(){
				open('file://'+process.cwd()+'/test/domtests.html');
			});
			it("Default Browser Form",function(done){
				setup(function(done){
					setTimeout(function(){
						done()
					},500);
				});
				open('http://localhost:1337/test/formtests.html',function(){
					console.log(wait_message);
					setTimeout(function(){
						done();
					},wait_time)
				});
			});
			it("Default Browser Selector",function(){
				open('file://'+process.cwd()+'/test/selectortests.html');
			});
			it("Default Browser Layout",function(){
				open('file://'+process.cwd()+'/test/layouttests.html');
			});
		}
		if(env_to_test.indexOf('chrome') !== -1)
		{
			it("Google Chrome Base",function(){
				open('file://'+process.cwd()+'/test/index.html',"Google Chrome");
			});
			it("Google Chrome Ajax",function(done){
				open('http://localhost:1337/test/ajaxtests.html',"Google Chrome",function(){
					console.log(wait_message);
					setTimeout(function(){
						done();
					},wait_time)
				});
			});
			it("Google Chrome DOM",function(){
				open('file://'+process.cwd()+'/test/domtests.html',"Google Chrome");
			});
			it("Google Chrome Form",function(done){
				open('http://localhost:1337/test/formtests.html',"Google Chrome",function(){
					console.log(wait_message);
					setTimeout(function(){
						done();
					},wait_time)
				});
			});
			it("Google Chrome Selector",function(){
				open('file://'+process.cwd()+'/test/selectortests.html',"Google Chrome");
			});
			it("Google Chrome Layout",function(){
				open('file://'+process.cwd()+'/test/layouttests.html',"Google Chrome");
			});
		}
		if(env_to_test.indexOf('safari') !== -1)
		{
			it("Safari Base",function(){
				open('file://'+process.cwd()+'/test/index.html',"Safari");
			});
			it("Safari Ajax",function(){
				open('http://localhost:1337/test/ajaxtests.html',"Safari",function(){
					console.log(wait_message);
					setTimeout(function(){
						done();
					},wait_time)
				});
			});
			it("Safari DOM",function(){
				open('file://'+process.cwd()+'/text/domtests.html',"Safari");
			});
			it("Safari Form",function(){
				open('http://localhost:1337/test/formtests.html',"Safari",function(){
					console.log(wait_message);
					setTimeout(function(){
						done();
					},wait_time)
				});
			});
			it("Safari Selector",function(){
				open('file://'+process.cwd()+'/text/selectortests.html',"Safari");
			});
			it("Safari Layout",function(){
				open('file://'+process.cwd()+'/text/layouttests.html',"Safari");
			});
		}
	});
}