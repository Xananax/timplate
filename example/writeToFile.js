var	timplate = require('../lib');

eval('var t = function(locals){'+
	'var func = function(){'+timplate('hello {{world}}').functionString+'};'+
	'var context = {escape: timplate.escape, line: 1, buffer : {ret:\'\'}, locals: timplate.extend({},timplate.globals,locals)};'+
	'return func.call(context)'+
	'};')
;

console.log(t({world:'blah'})) //outputs "hello blah"