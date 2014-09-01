#Timplate

Tiny and fast templating engine, with a code small enough that anyone can hack at it.
Works in all environments, browser, node, through globals, amd, or whatever.

### Whyyyyyyyyyy

Hold on, I know there is approximately a million templating engines. Most of them would probably beat this one in terms of features. But after I used a whole damn lot of them (a lot), I couldn't find any that satisfied my own personal brand of logic.
Furthermore, you do things because you can, for fun and profit.

## Main Usage

### Outputting a variable

just use a variable surrounded by opening and closing tags
```
	hello {{whatAreYouSayingHelloTo}}
	will render as (assuming whatAreYouSayingHelloTo = "world")
	hello world
```

If you want unescaped (raw) output, use "!"

```
	hello to you {{notADangerousString}} you
	will render as (assuming notADangerousString = "")
	hello to you &amp; you

	whereas
	hello to you {{!notADangerousString}} you
	will render as (assuming notADangerousString = "")
	hello to you & you
```

### Tokens
They are all explained below, but here they are, in summary

	* If: '?'
	* Else, If Else: '?:'
	* Iterator: '#'
	* End Loop, End If: '/'
	* Raw (unescaped) text: '!'
	* Log to console:'l'
	* Start Block:'>'
	* Print Block:'>>'

### IF/Else
equalities require only one "="
You are free to use more, but one is enough.
For example, the following paragraph

```
	you need {{?eq=true}}only one "="{{?:}}a lot of "="{{/?}}.
	renders as (assuming eq=true):
	you need only one "=".
```

By default, if is denoted by "?" and else/elseif by "?:".

```
	the number of rabbits is {{? rabbits=3}}three{{?:rabbits=2}}two{{?:}}one or zero{{/?}}.
	renders as (assuming rabbits=2):
	the number of rabbits is two.
```

If blocks end with "/", and you can append anything after the sign.

```
	this if block {{? matters=false}}doesn't matter{{?:}}matters{{/?}}
	renders the same as 
	this if block {{? matters=false}}doesn't matter{{?:}}matters{{/?matters}}
	renders the same as
	this if block {{? matters=false}}doesn't matter{{?:}}matters{{/something to remember me by}}
	renders as (assuming matters = false)
	this if block doesn't matter
```

### LOOPS/ITERATIONS

Iterate by using "#"

```
	I really like {{# p in people}}{{p}}, {{/#}}
	renders as (assuming people = ['John','Jane','Ali']):
	I really like John, Jane, Ali,
```

You can get the key by doing that:

```
	I really like{{# p,i in people}}{{?i=people.length-1}}and{{/if}} {{p}}{{?i!=people.length-1}}, {{/if}}{{/#}}
	renders as (assuming people = ['John','Jane','Ali']):
	I really like John, Jane, and Ali
```
There are some helper functions so you can do that:
```
	I really like {{# p,i in people}}{{?_last}} and{{?:_first}} my dear{{/if}} {{p}}{{?_middle}}, {{/if}}{{/#}}
	renders as (assuming people = ['John','Jane','Ali']):
	I really like my dear John, Jane, and Ali
```
(of course, _first, _last and _middle operators work on arrays only, and only when you use the "x,y" notation.)

Like for if/else blocks, loop closings take an optional string

### Blocks

```
	1 - also, you can render blocks
	{{> nameOfBlock}}
	2 - you can write whatever you want in a block
	{{/>}}
	3 - and blocks can be rendered later. you can also always append to them
	{{> nameOfBlock}}
	4 - As long as the same block name is specified, you can continue to add to it
	{{/>}}

	then output it:
	{{>> nameOfBlock}}

	--------------------------------
	will render as:

	1 - also, you can render blocks

	3 - and blocks can be rendered later. you can also always append to them

	then output it:

	2 - you can write whatever you want in a block

	4 - As long as the same block name is specified, you can continue to add to it

```

the syntax is simple, just ">" followed by some block name of your choosing.

### Others

You can log to console:
```
	{{l 'hello world'}} will render as console.log('hello world')
```

Variables that don't exist get silently removed

Hummm...I think that's it.

----------------

## Options

### Tags

Don't like the {{tags}}? You can change them by using timplate.tagStart(new_tag) and timplate.tagEnd(new_tag)

### Globals

Anything that you make available to the timplate.globals object will be available in all templates

### timplate.extend
Just a convenience function for when you don't have jquery.extend or zepto.extend at hand. No deep copy though

### Customizing template handling

The template returned has a property called "functionString". You can use that to whip up a different templates handling system, or to print them to a file to be used in the browser.
There's an example in 'example/writeToFile.js';

If you want to do your own handling, this is the template signature:

```js
	function(locals){
		var context = {escape: timplate.escape, line: 1, buffer : {ret:''}, locals: timplate.extend({},timplate.globals,locals)};
		return func.call(context);
	};
```

-----------

## Credit
Most of the original code comes from:
https://github.com/cho45/micro-template.js

## License
MIT