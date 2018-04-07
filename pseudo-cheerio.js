const cheerio = require('cheerio');

// ## Pseudos
//
// A mapping of pseudo-class selector names to functions to perform.
//
// The function signatures are (cheerio_query_result, optional_argument).
// If the argument matches an int it is auto-casted as an int, e.g.,
// `:eq(1)` -> maps to a fn named "eq" and gets called as `fn(query, 1)`
//
const PSEUDOS = {
  parent: (q, sel) => q.parent(sel),
  parents: (q, sel) => q.parents(sel),
  closest: (q, sel) => q.closest(sel),
  next: (q, sel) => q.next(sel),
  nextAll: (q, sel) => q.nextAll(sel),
  prev: (q, sel) => q.prev(sel),
  prevAll: (q, sel) => q.prevAll(sel),
  slice: (q, start, end) => q.slice(start, end),
  siblings: (q, sel) => q.siblings(sel),
  children: (q, sel) => q.children(sel),
  contents: q => q.contents(),
  filter: (q, sel) => q.filter(sel),
  not: (q, sel) => q.not(sel),
  has: (q, sel) => q.has(sel),
  first: q => q.first(),
  last: q => q.last(),
  eq: (q, i) => q.eq(i),
  add: (q, sel) => q.add(sel)
};

// ## Find
//
// $ - loaded cheerio object - the result of require('cheerio').load(<html>)
// query - string - a CSS selector for use with cheerio, e.g., `$(query)`,
//                  except it supports various pseudo elements, like `:first`
//                  and `:eq(1)`
// context - cheerio query result - OPTIONAL: if specified, search within the context
//                                  if you want to start a query with a pseudo-class
//                                  then you'll need a context that has been wrapped in $(),
//                                  e.g., see `rows.map` in `extract`
// extra_pseudos - plain object - OPTIONAL: additional rules to add to the `PSEUDO` object
//
// Returns the result of performing the query with the given loaded query object
//
function find($, query, context, extra_pseudos) {
  let sp = query.split(_R_PSEUDOS_SPLIT).map(x => (x || '').trim());

  // allow additional rules to be added in
  let pseudos = extra_pseudos
    ? Object.assign({}, PSEUDOS, extra_pseudos)
    : PSEUDOS;

  let updated_context = false;

  sp.forEach((selector, i) => {
    // skip blanks
    if (!selector) {
      return;
    }
    switch (i % 3) {
      case 0: // regular selector
        context = $(selector, context);
        updated_context = true;
        break;
      case 1: // pseudo-class selector
        if (context === null) {
          throw new Error(
            `Cannot put a pseudo ${selector} at the start of a query ${query}`
          );
        }

        let { name, args } = _parse_pseudo(selector);
        let fn = pseudos[name];
        if (fn === undefined) {
          throw new Error(`Unknown pseudo selector ${selector} in ${query}`);
        }

        // extra check to wrap context that is passed directly in, so we can make
        // sure it's a matched set and not just an element
        if (!updated_context) {
          context = $(context);
        }

				if (args) {
					context = fn(context, ...args);
				} else {
					context = fn(context, null);
				}

        updated_context = true;
        break;
      case 2: // pseudo-class arg (ignore)
        break;
    }
  });

  return context;
}

// ## Extract
//
// Return a list of plain objects from the given HTML content
// using the given config info.
//
// content - string - raw HTML
// config - plain object - of the form:
//
//    {
//      rows: [selector - String - e.g., '#s-date table:first tbody tr'],
//      fields: {
//        [name]: [selector - String - e.g., 'td:eq(0)'],
//        ...
//    }
//
function extract(content, config, extra_pseudos) {
  const $ = cheerio.load(content);

  let rows = find($, config.rows, undefined, extra_pseudos);

  // populate data for `repeat_if_blank`
  let previous_nonblank = {};
  let blank_repeaters = {};
  if (config.repeat_if_blank) {
    config.repeat_if_blank.forEach(name => {
      blank_repeaters[name] = true;
    });
  }

  let result = rows
    .map((i, row) => {
      let $row = $(row);
      let row_data = {};

      for (let name in config.fields) {
        let selector = config.fields[name];
        let query = find($, selector, row, extra_pseudos);
        let val = query.text().trim();

        if (blank_repeaters[name]) {
          if (val === '') {
            val = previous_nonblank[name] || '';
          } else {
            previous_nonblank[name] = val;
          }
        }

        row_data[name] = val;
      }

      // skip any blanks (if specified) - this map implementation filters out nulls
      if (
        config.skip_if_blank &&
        config.skip_if_blank.find(x => !row_data[x])
      ) {
        return null;
      }

      if (config.repeat_if_blank) {
        config.repeat_if_blank;
      }

      return row_data;
    })
    .get();

  return result;
}

// ## Helpers
//

// Regular expression to find any :foo or :foo(123) element
// splits repeat of form [0: non_match, 1: match_whole, 2: match_parens]
const _R_PSEUDOS_SPLIT = /(:[^ \(:]+(\([^\)]+\))?)/g;

// Regular expression to extract pseudo name and argument from
// the match at index 1 and 3, e.g.,
// ":eq(1)".match(...) -> [':eq(1)', 'eq', '(1)', '1']
//
const _R_PSEUDO = /:([^\(]+)(\(([^\)]+)\))?/;

const _is_int = x => (x ? /^\d+$/.test(x) : false);

// Parse a pseudo selector returning the name and optional args in an object
const _parse_pseudo = selector => {
  let match = selector.match(_R_PSEUDO);
  let args = (match[3] || '')
    .split(',')
    .filter(x => x.trim())
    .map(x => (_is_int(x) ? parseInt(x) : x));
  return match ? { name: match[1], args } : null;
};

//
// ## Exports
//

module.exports.PSEUDOS = PSEUDOS;
module.exports.find = find;
module.exports.extract = extract;
