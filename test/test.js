'use strict';

const chai = require('chai');
const fs = require('fs');
const path = require('path');

const cheerio = require('cheerio');
const pcheerio = require('../pseudo-cheerio');

const expect = chai.expect;

const _dir = p => path.join(__dirname, p);

describe('.find(...)', () => {
  const html = fs.readFileSync(_dir('sample.html'), 'utf8');
  const $ = cheerio.load(html);

  describe('simple query', () => {
    let query = pcheerio.find($, '.section_1-p_1');

    it('should return "section 1 - p 1"', () => {
      expect(query.text().trim()).to.equal('section 1 - p 1');
    });

    it('should return 1 result', () => {
      expect(query.length).to.equal(1);
    });
  });

  describe(':first query', () => {
    let query = pcheerio.find($, 'section p:first');

    it('should return "section 1 - p 1"', () => {
      expect(query.text().trim()).to.equal('section 1 - p 1');
    });

    it('should return 1 result', () => {
      expect(query.length).to.equal(1);
    });
  });

  describe(':last query', () => {
    let query = pcheerio.find($, 'section p:last');

    it('should return "section 2 - p 1"', () => {
      expect(query.text().trim()).to.equal('section 2 - p 1');
    });

    it('should return 1 result', () => {
      expect(query.length).to.equal(1);
    });
  });

  describe(':eq(1) query', () => {
    let query = pcheerio.find($, 'section p:eq(1)');

    it('should return "section 1 - p 2"', () => {
      expect(query.text().trim()).to.equal('section 1 - p 2');
    });

    it('should return 1 result', () => {
      expect(query.length).to.equal(1);
    });
  });

  describe(':closest(...) query', () => {
    let query = pcheerio.find($, '.section_2-h3_1:closest(section) p');

    it('should return "section 2 - p 1"', () => {
      expect(query.text().trim()).to.equal('section 2 - p 1');
    });

    it('should return 1 result', () => {
      expect(query.length).to.equal(1);
    });
  });

  describe(':closest(...) unsupported whitespace query', () => {
    it('should throw an error', () => {
      let bad_find = () =>
        pcheerio.find($, '.section_2-h3_1:closest(#main section) p');
      expect(bad_find).to.throw();
    });
  });

  describe('extra_pseudo test', () => {
    let extra_pseudos = {
      foo: q => q.find('.section_1-p_1')
    };
    let query = pcheerio.find($, 'section:foo', undefined, extra_pseudos);
    it('should find section 1 - p 1', () => {
      expect(query.text().trim()).to.equal('section 1 - p 1');
    });
  });

  describe('start with pseudo-class element, must have valid context', () => {
    let $context = $('section');
    let query = pcheerio.find($, ':last h3', $context);
    it('should find the last h3', () => {
      expect(query.text().trim()).to.equals('section 2 - h3 1');
    });
  });
});

describe('.extract(...)', () => {
  const html = fs.readFileSync(_dir('sample.html'), 'utf8');

  describe('table extract', () => {
    let result = pcheerio.extract(html, {
      rows: 'table:first tr',
      fields: {
        col1: 'td:eq(0)',
        col2: 'td:eq(1)'
      }
    });

    it('should match data format', () => {
      expect(result).to.deep.equal([
        { col1: 'row 1 - col 1', col2: 'row 1 - col 2' },
        { col1: 'row 2 - col 1', col2: 'row 2 - col 2' }
      ]);
    });
  });

  describe('extra_pseudo extract', () => {
    let result = pcheerio.extract(
      html,
      {
        rows: 'table:trs',
        fields: {
          col1: 'td:eq(0)'
        }
      },
      { trs: q => q.find('tr') }
    );

    it('should work with custom extra_pseudos arg', () => {
      expect(result).to.deep.equal([
        { col1: 'row 1 - col 1' },
        { col1: 'row 2 - col 1' }
      ]);
    });
  });
});
