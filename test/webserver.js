var fs = require("fs");
var http = require('http');
var query = require('url').parse

module.exports = http.createServer(function (req, res) {
	var requestbody = '';
    req.on('data', function (data) {
        requestbody += data;
    });
    req.on('end', function () {
		var parsedreq = query(req.url,true);
		if(parsedreq.pathname == '/inspect')
		{
			var response = JSON.stringify(
			{
				'headers' : req.headers,
				'method' : req.method,
				'body' : requestbody
			});
			res.writeHead(200,{'Content-Type':'application/json'});
			res.end(response);
			return;
		}
		else if(parsedreq.pathname == '/response')
		{
			var headers = {};
			for (header in parsedreq.query)
			{
				if(header != 'responseBody')
				{
					headers[header] = parsedreq.query[header];
				}
			}
			res.writeHead(200,headers)
			if(parsedreq.query.responseBody !== undefined)
			{
				res.end(parsedreq.query.responseBody);
			}
			else
			{
				res.end();
			}
			return;
		}
		else
		{
			parsedreq.pathname = './'+parsedreq.pathname;
		}
		if(fs.existsSync(parsedreq.pathname))
		{
			fs.readFile(parsedreq.pathname,function(err, file)
			{
				if(err)
				{
					res.writeHead(500, {"Content-Type": "text/plain"});
					res.end(err + "\n");
					return;
				}
				if(parsedreq.pathname.match(/\.html/))
				{
					res.writeHead(200,{'Content-Type':'text/html'});
				}
				else if(parsedreq.pathname.match(/\.json/))
				{
					res.writeHead(200,{'Content-Type':'application/json'});
				}
				else if(parsedreq.pathname.match(/\.js/))
				{
					res.writeHead(200,{'Content-Type':'text/javascript'});
				}
				else if(parsedreq.pathname.match(/\.css/))
				{
					res.writeHead(200,{'Content-Type':'text/css'});
				}
				res.end(file);
			});
		}
		else
		{
			res.writeHead(404,{'Content-Type':'text/plain'});
			res.end('Not Found');
			return;
		}
	});
}).listen(1337, '127.0.0.1');