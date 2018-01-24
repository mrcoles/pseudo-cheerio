
Pseudo Cheerio
==============

:pseudo-class support for the Cheerio NodeJS module.

[![Build Status](https://travis-ci.org/mrcoles/pseudo-cheerio.svg?branch=master)](https://travis-ci.org/mrcoles/pseudo-cheerio)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

## Supported Pseudo Class Selectors

These all map to the equivalent [Cheerio traversing function](https://github.com/cheeriojs/cheerio#traversing):

*   `:parent([selector])`
*   `:parents([selector])`
*   `:closest([selector])`
*   `:next([selector])`
*   `:nextAll([selector])`
*   `:prev([selector])`
*   `:prevAll([selector])`
*   `:slice( start, [end] )`
*   `:siblings([selector])`
*   `:children([selector])`
*   `:contents`
*   `:filter([selector])`
*   `:not(selector)`
*   `:has(selector)`
*   `:first`
*   `:last`
*   `:eq(i)`
*   `:add(selector)`


## Usage

Importing:

```javascript
const cheerio = require('cheerio');
const pcheerio = require('pseudo-cheerio');

const $ = cheerio.load(html);
```

Querying:

```javascript
pcheerio.find($, '#main table:first tbody tr');
pcheerio.find($, 'table tr:slice(1, 5)');
```

This is the same as:

```javascript
$('#main table').first().find('tbody tr');
$('table tr').slice(1, 5);
```

## API

### .find( $, selector, context, extra_pseudos )

Return the result of `selector` searching the given `$` content within the optional `context`. Support the `extra_pseudos` if they are specified.

*   $ - loaded cheerio content
*   selector - string - a cheerio selector, but may have supported pseudo-classes
*   context - cheerio context - optional context
*   extra_pseudos - plain object { name: func } - optional overrides to the pseudo-cheerio.PSEUDOS object


### .extract( content, config ) (EXPERIMENTAL)

Return an array of data extracted from the HTML string `content` based on the specified `config`.

The `config` parameter looks like:

```
{
  rows: [selector - String - e.g., '#s-date table:first tbody tr'],
  fields: {
    [name]: [selector - String - e.g., 'td:eq(0)'],
    ...
}
```

NOTE: this function creates the dependency on `cheerio`. It might make sense to remove this so a specific cheerio dep can be decoupled from this project?


## Misc

There’s an existing package that does basically the same thing called [cheerio-advanced-selectors](https://www.npmjs.com/package/cheerio-advanced-selectors).
