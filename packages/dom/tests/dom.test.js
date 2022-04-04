/* eslint-disable no-param-reassign */
/* globals describe, it, beforeEach */

import { expect } from 'chai';
import { parseHTML } from 'linkedom';
import TxNativeDOM from '../src/TxNativeDOM';
import {
  bindings,
  nestedSegments,
  shadowDomHostSegments,
  shadowDomSegments,
  skippedSegments,
  validSegments,
  variableSegments,
} from './fixture';

function appendTo(where, html) {
  where.innerHTML += html;
}
function injectSegments(document, segments) {
  for (let i = 0; i < segments.length; ++i) {
    if (segments[i].body) appendTo(document.body, segments[i].body);
    if (segments[i].head) appendTo(document.head, segments[i].head);
  }
}

function injectShadowDomSegments(document, segments) {
  for (let i = 0; i < segments.length; ++i) {
    const layer = document.getElementById('shadow_dom_host_layer');
    const shadowRoot = layer.attachShadow({ mode: 'open' });
    shadowRoot.innerHTML = segments[i].body;
  }
}

function assertContainsSegments(txdom, segments) {
  const strings = txdom.getStringsJSON();
  for (let i = 0; i < segments.length; ++i) {
    const { segment } = segments[i];
    const key = txdom._getKey(segment);
    expect(strings[key]).deep.contains({
      string: segment,
    });
  }
}

describe('TxNativeDOM', () => {
  it('pseudo translates', () => {
    const html = '<html><head></head><body><p>Hello world</p></body></html>';
    const pseudo = '<html lang="pseudo"><head></head><body><p>Ħḗḗŀŀǿǿ ẇǿǿřŀḓ</p></body></html>';
    const { document } = parseHTML(html);
    const txdom = new TxNativeDOM();

    txdom.attachDOM(document);
    txdom.pseudoTranslate();
    expect(txdom.document.documentElement.outerHTML).to.equal(pseudo);
  });

  it('translates locale', () => {
    const html = '<html><head></head><body><p>Hello world</p></body></html>';
    const translatedHTML = '<html lang="el"><head></head><body><p>Γειά σου κόσμε</p></body></html>';
    const translations = {
      'Hello world': 'Γειά σου κόσμε',
    };
    const { document } = parseHTML(html);
    const txdom = new TxNativeDOM();

    txdom.attachDOM(document);
    txdom.toLanguage('el', (key) => translations[key]);
    expect(txdom.document.documentElement.outerHTML).to.equal(translatedHTML);

    // revert to source
    txdom.toSource();
    expect(txdom.document.documentElement.outerHTML).to.equal(html);
  });
});

describe('Strings', () => {
  let document;
  let txdom;

  beforeEach(() => {
    const html = '<html><head></head><body></body></html>';
    document = parseHTML(html).document;
    txdom = new TxNativeDOM({
      parseAttr: ['custom-attr'],
      ignoreTags: ['h3'],
      ignoreClass: ['skip-class'],
      enableTags: ['code'],
      variablesParser: (text, func) => text.replace(/s-href="([^"]*)"/g, (match) => func(match)),
    });
  });

  it('to be detected', () => {
    injectSegments(document, validSegments);
    txdom.attachDOM(document);
    assertContainsSegments(txdom, validSegments);
  });

  it('shadow dom to be detected', () => {
    injectSegments(document, shadowDomHostSegments);
    injectShadowDomSegments(document, shadowDomSegments);
    txdom.attachDOM(document);
    assertContainsSegments(txdom, shadowDomSegments);
  });

  it('to be ignored', () => {
    injectSegments(document, skippedSegments);
    txdom.attachDOM(document);

    const strings = txdom.getStringsJSON();
    for (let i = 0; i < skippedSegments.length; ++i) {
      const { segment } = skippedSegments[i];
      const key = txdom._getKey(segment);
      expect(strings).to.not.have.key(key);
    }
  });

  it('with variables to be detected', () => {
    injectSegments(document, variableSegments);
    txdom.attachDOM(document);
    assertContainsSegments(txdom, variableSegments);
  });

  it('with tx-content=exclude works', () => {
    injectSegments(document, nestedSegments);
    txdom.attachDOM(document);

    const strings = txdom.getStringsJSON();
    const { segment } = bindings.nestedExclusion;
    const key = txdom._getKey(segment);
    expect(strings[key]).deep.contains({
      string: segment,
    });
  });

  it('with tx-content=block works', () => {
    injectSegments(document, nestedSegments);
    txdom.attachDOM(document);

    const strings = txdom.getStringsJSON();
    const { segment } = bindings.nestedBlock;
    const key = txdom._getKey(segment);
    expect(strings[key]).deep.contains({
      string: segment,
    });
  });
});
