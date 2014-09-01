var http = require('http')
,	data = {
		world:'World!'
	,	worlds:false
	,	people:['John','Jane','Ali']
	,	eq:true
	,	rabbits:2
	,	matters:false
	,	whatAreYouSayingHelloTo:"world"
	,	notADangerousString:'&'
	}
,	timplate = require('../lib')
;


http.createServer(function (req, res) {
	var templateString = require('fs').readFileSync(__dirname+'/template.html',{encoding:'utf8'})
	,	template = timplate(templateString)
	,	content = template(data)
	;
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.end(content);
}).listen(1337, '127.0.0.1');


var template = timplate(require('fs').readFileSync(__dirname+'/../README.md',{encoding:'utf8'}))(data);

console.log(template);
console.log('Server running at http://127.0.0.1:1337/');