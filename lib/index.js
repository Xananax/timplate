(function (moduleName,root,factory){
    if (typeof define === 'function' && define.amd) {define([], factory);}
	else if (typeof exports === 'object'){module.exports = factory();}
    else {root[moduleName] = factory();}
}('timplate',this,function(){

	var tokens_strings = {
			If: '?'
		,	Else: '?:'
		,	ElseIf:'?:'
		,	EndLoop: '/'
		,	Escaped: ''
		,	Raw: '!'
		,	Iterator: '#'
		,	Log:'l'
		,	BlockStart:'>'
		,	BlockPrint:'>>'
		,	Expression:'-'
		}
	,	RegExpEscape = function(text) {
			return text.replace(/[\/-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
		}
	,	make_tokens = function(t1){
			var n,t2={},content='\\s?(.+?)\\s?';
			for(n in t1){t2[n] = RegExpEscape(t1[n]);}
			t2.IfEquals = t2.If+'\\s?([\\w\\d]+?)\\s?=\\s?(.+?)\\s?';
			t2.If = t2.If+content;
			t2.ElseIf = t2.ElseIf+content;
			t2.Raw = t2.Raw+t2.Escaped+content;
			t2.Escaped = t2.Escaped+content;
			t2.IteratorWithKeys = t2.Iterator+'\\s?(.*?)\\s?,\\s?(.+?) in (.+?)\\s?';
			t2.Iterator = t2.Iterator+'\\s?(.+?) in (.+?)\\s?';
			t2.Log = t2.Log+content;
			t2.BlockPrint = t2.BlockPrint+content;
			t2.BlockEnd = t2.EndLoop+t2.BlockStart;
			t2.BlockStart = t2.BlockStart+content;
			t2.EndLoop = t2.EndLoop+'\\s?(.*?)';
			t2.Expression = t2.Expression+content;
			t2.FilterEnd = t2.EndLoop+t2.Filter+content;
			t2.Filter = t2.Filter+content;
			for(n in t2){
				t2[n] = new RegExp('\\x11\\s?'+t2[n]+'\\s?\\x13','g');
			}
			return t2;
		}
	,	escapeHtmlMap  = { 
			'&' : '&amp;'
		,	'<' : '&lt;'
		,	'>' : '&gt;'
		,	'\x22' : '&#x22;'
		,	'\x27' : '&#x27;'
		}
	,	extend = function(){
			var arr = new Array(arguments.length), i = 0, l = arr.length,n,o2;
			for(i;i<l;i++){arr[i] = arguments[i];}
			var o1 = arr.shift();
			while(arr.length){
				o2 = arr.shift();
				for(n in o2){
					if(o2.hasOwnProperty(n)){o1[n] = o2[n];}
				}
			}
			return o1;
		}
	,	escapeHTMLRegexp = new RegExp('['+(function(m,s,n){for(n in m){s+=m[n];}return s;})(escapeHtmlMap,'')+']','g')
	,	escape = function(string){
			return (''+string).replace(/[&<>\'\"]/g, function(_){
				return escapeHtmlMap[_];
			});
		}
	,	makeFunction = function(string,tryCatch,sourceMap){
			var	line = 1
			,	funcString = (
						(template.variable ?  "var " + template.variable + " = this.locals;" : "with (this.locals) { ") +
						"var currentBuffer = 'ret'; this.buffer[currentBuffer] += '"  +
						(string
							.replace(template._tag_start, '\x11')
							.replace(template._tag_end, '\x13')
							//.replace(/'(?![^\x11\x13]+?\x13)([\w\s])/g, '\\x27$1')
							.replace(/\x11(([^\x11\x13]*?)'([^\x11\x13]*?))+\x13/g,'$2\\x15\\x16$3')
							.replace(/'/g,'\\x27')
							.replace(/\x15\x16/g,"'")
							.replace(/^\s*|\s*$/g, '')
							.replace(/\n/g, function () { return "';\nthis.line = " + (++line) + "; this.buffer[currentBuffer] += '\\n";})
							.replace(tokens.Else, "'; }else{ this.buffer[currentBuffer]+= '")
							.replace(tokens.ElseIf, "'; }else if($1){ this.buffer[currentBuffer]+= '")
							.replace(tokens.IfEquals, "'; if($1==$2){ this.buffer[currentBuffer]+= '")
							.replace(tokens.If, "'; if($1){ this.buffer[currentBuffer]+= '")
							/**/
							.replace(tokens.IteratorWithKeys, "'; var _isArray$3=($3 instanceof Array);for(var $2 in $3){var $1=$3[$2];if(_isArray$3){$2=parseInt($2);var _last=($2==$3.length-1),_first=($2==0), _middle=(!_first&&!_last);};this.buffer[currentBuffer]+= '")
							.replace(tokens.Iterator, "'; for(var $1 in $2){ $1=$2[$1];this.buffer[currentBuffer]+= '")
							.replace(tokens.BlockPrint,"'; if(this.buffer['$1']){this.buffer.ret+=this.buffer['$1'];}; this.buffer[currentBuffer] += '")
							.replace(tokens.BlockStart,"'; currentBuffer='$1';this.buffer['$1']=this.buffer['$1']||''; this.buffer[currentBuffer] += '")
							.replace(tokens.BlockEnd,"'; currentBuffer='ret'; this.buffer[currentBuffer] += '")
							.replace(tokens.EndLoop, "' }; this.buffer[currentBuffer] += '")
							.replace(tokens.Expression, "'; $1; this.buffer[currentBuffer] += '")
							.replace(tokens.Log, "'; console.log($1); this.buffer[currentBuffer] += '")
							.replace(tokens.Raw, "' + ((typeof $1 !=='undefined') ? ($1) : '') + '")
							.replace(tokens.Escaped, "' + ((typeof $1 !=='undefined') ? this.escape($1) : '') + '")
							/**/
						)+
						"'; " + (template.variable ? "" : "}") + "return this.buffer.ret;"
				)
				.replace(/this\.ret \+= '';/g, '')
			;
			if(tryCatch){
				funcString = "try { " +funcString+"} catch (e) { throw 'TemplateError: ' + e + ' (on ' + ' line ' + this.line + ')'; }";
			}
			if(sourceMap){
				funcString+="//@ sourceURL=" + string.replace(/\n/g,'') + "\n";
			}
			var	func = new Function(funcString);
			var returnedFunction = function(locals){
				var context = {escape: template.escape, line: 1, buffer : {ret:''}, locals: template.extend({},template.globals,locals)};
				return func.call(context);
			};
			returnedFunction.functionString = funcString;
			return returnedFunction;
		}
	,	template = function(string){
			return makeFunction(string,true,true);
		}
	,	tokens
	;
	template._tag_start = /\{\{/g;
	template._tag_end = /\}\}/g;
	template.globals = {};
	template.extend = extend;
	template.escape = escape;
	template.tagStart = function(tag){
		if(tag){template._tag_start = new RegExp(template.escape(tag),'g');}
		return template._tag_start;
	};
	template.tagEnd = function(tag){
		if(tag){template._tag_end = new RegExp(template.escape(tag),'g');}
		return template._tag_end;
	};
	template.make_tokens = function(){
		tokens = make_tokens(tokens_strings);
		return template;
	};
	template.tokens = tokens_strings;

	template.make_tokens();
	return template;

}));