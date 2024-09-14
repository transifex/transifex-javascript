/* eslint-disable no-param-reassign */
/* globals describe, it, beforeEach */

import { expect } from 'chai';
import { parseHTML } from 'linkedom';
import WsNativeDOM from '../src/WsNativeDOM';
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

function assertContainsSegments(wsdom, segments) {
  const strings = wsdom.getStringsJSON();
  for (let i = 0; i < segments.length; ++i) {
    const { segment } = segments[i];
    const key = wsdom._getKey(segment);
    expect(strings[key]).deep.contains({
      string: segment,
    });
  }
}

describe('WsNativeDOM', () => {
  it('pseudo translates', () => {
    const html = '<html><head></head><body><p>Hello world</p></body></html>';
    const pseudo = '<html lang="pseudo"><head></head><body><p>Ħḗḗŀŀǿǿ ẇǿǿřŀḓ</p></body></html>';
    const { document } = parseHTML(html);
    const wsdom = new WsNativeDOM();

    wsdom.attachDOM(document);
    wsdom.pseudoTranslate();
    expect(wsdom.document.documentElement.outerHTML).to.equal(pseudo);
  });

  it('translates locale', () => {
    const html = '<html><head></head><body><p>Hello world</p></body></html>';
    const translatedHTML = '<html lang="el"><head></head><body><p>Γειά σου κόσμε</p></body></html>';
    const translations = {
      'Hello world': 'Γειά σου κόσμε',
    };
    const { document } = parseHTML(html);
    const wsdom = new WsNativeDOM();

    wsdom.attachDOM(document);
    wsdom.toLanguage('el', (key) => translations[key]);
    expect(wsdom.document.documentElement.outerHTML).to.equal(translatedHTML);

    // revert to source
    wsdom.toSource();
    expect(wsdom.document.documentElement.outerHTML).to.equal(html);
  });

  it('exports tags', () => {
    const html = '<html><head></head><body><p ws-tags="tag1,tag2">Hello world</p></body></html>';
    const { document } = parseHTML(html);
    const wsdom = new WsNativeDOM();

    wsdom.attachDOM(document);
    expect(wsdom.getStringsJSON()).to.deep.equal({
      'Hello world': {
        string: 'Hello world',
        meta: {
          tags: ['tag1', 'tag2'],
        },
      },
    });

    expect(wsdom.getStringsJSON({ tags: ['tag2', 'tag3'] })).to.deep.equal({
      'Hello world': {
        string: 'Hello world',
        meta: {
          tags: ['tag1', 'tag2', 'tag3'],
        },
      },
    });

    expect(wsdom.getStringsJSON({ occurrences: ['o1'] })).to.deep.equal({
      'Hello world': {
        string: 'Hello world',
        meta: {
          tags: ['tag1', 'tag2'],
          occurrences: ['o1'],
        },
      },
    });
  });
});

describe('Strings', () => {
  let document;
  let wsdom;

  beforeEach(() => {
    const html = '<html><head></head><body></body></html>';
    document = parseHTML(html).document;
    wsdom = new WsNativeDOM({
      parseAttr: ['custom-attr'],
      ignoreTags: ['h3'],
      ignoreClass: ['skip-class'],
      enableTags: ['code'],
      variablesParser: (text, func) => text.replace(/s-href="([^"]*)"/g, (match) => func(match)),
    });
  });

  it('to be detected', () => {
    injectSegments(document, validSegments);
    wsdom.attachDOM(document);
    assertContainsSegments(wsdom, validSegments);
  });

  it('shadow dom to be detected', () => {
    injectSegments(document, shadowDomHostSegments);
    injectShadowDomSegments(document, shadowDomSegments);
    wsdom.attachDOM(document);
    assertContainsSegments(wsdom, shadowDomSegments);
  });

  it('to be ignored', () => {
    injectSegments(document, skippedSegments);
    wsdom.attachDOM(document);

    const strings = wsdom.getStringsJSON();
    for (let i = 0; i < skippedSegments.length; ++i) {
      const { segment } = skippedSegments[i];
      const key = wsdom._getKey(segment);
      expect(strings).to.not.have.key(key);
    }
  });

  it('with variables to be detected', () => {
    injectSegments(document, variableSegments);
    wsdom.attachDOM(document);
    assertContainsSegments(wsdom, variableSegments);
  });

  it('with ws-content=exclude works', () => {
    injectSegments(document, nestedSegments);
    wsdom.attachDOM(document);

    const strings = wsdom.getStringsJSON();
    const { segment } = bindings.nestedExclusion;
    const key = wsdom._getKey(segment);
    expect(strings[key]).deep.contains({
      string: segment,
    });
  });

  it('with ws-content=block works', () => {
    injectSegments(document, nestedSegments);
    wsdom.attachDOM(document);

    const strings = wsdom.getStringsJSON();
    const { segment } = bindings.nestedBlock;
    const key = wsdom._getKey(segment);
    expect(strings[key]).deep.contains({
      string: segment,
    });
  });
});
