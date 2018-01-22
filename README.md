
Pseudo Cheerio
==============

:pseudo-class support for the Cheerio NodeJS module.

### Usage

```
const cheerio = require('cheerio');
const pcheerio = require('pseudo-cheerio');

const $ = cheerio.load(html);
pcheerio.find($, '#main table:first tbody tr');
```

This is the same as:

```
$('#main table').first().find('tbody tr');
```


### Supported Pseudo Elements

*   :first
*   :last
*   :eq(N)
*   :closest(SELECTOR) - NOTE: does not support whitespace in SELECTOR currently


### API

#### .find( $, selector, context, extra_pseudos )

Return the result of `selector` searching the given `$` content within the optional `context`. Support the `extra_pseudos` if they are specified.

*   $ - loaded cheerio content
*   selector - string - a cheerio selector, but may have supported pseudo-classes
*   context - cheerio context - optional context
*   extra_pseudos - plain object { name: func } - optional overrides to the pseudo-cheerio.PSEUDOS object


#### .extract( content, config ) (EXPERIMENTAL)

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
