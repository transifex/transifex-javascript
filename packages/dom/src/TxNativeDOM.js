/* eslint-disable prefer-destructuring */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-param-reassign */
import {
  BLOCK_NODES,
  IS_NOT_TEXTUAL_REGEX,
  PARSER_OPTIONS,
  SKIP_CLASS,
  SKIP_TAGS,
  SKIP_TAGS_CONTENT,
} from './constants';
import {
  GET_ATTR,
  GET_BLOCK,
  GET_FRAGMENT,
  GET_TEXT,
  SET_ATTR,
  SET_BLOCK,
  SET_FRAGMENT,
  SET_TEXT,
} from './operations';
import pseudo from './pseudo';
import {
  isString,
  mergeArrays,
  removeComments,
  stripWhitespace,
} from './utils';

export default class TxNativeDOM {
  /**
   * Creates an instance of TxNativeDOM.
   *
   * @param {*} [params={}]
   * @param {Function} params.variablesParser - custom variables parser
   *   function(text, func) { return text; }
   * @param {Array(String)} params.parseAttr - additional parse attributes
   *   ["attr1", "attr2", ...]
   * @param {Array(String)} params.ignoreTags - list of custom HTML tags to ignore
   * ..["span", "div", ...]
   * @param {Array(String)} params.ignoreClass - list of custom HTML class names to ignore
   * ..["o-foo", "u-bar", ...]
   * @param {Boolean} params.ignoreDatabind
   * @memberof TxNativeDOM
   */
  constructor(params = {}) {
    this.segments = {};
    this.skipTagsCustom = {
      ...SKIP_TAGS,
    };
    this.skipClassCustom = {
      ...SKIP_CLASS,
    };
    this.parseAttr = [];
    this.variablesParser = params.variablesParser;
    this.ignoreDatabind = !!params.ignoreDatabind;

    if (params.parseAttr) {
      params.parseAttr.forEach((attr) => {
        if (attr) {
          this.parseAttr.push(attr.toLowerCase());
        }
      });
    }
    if (params.ignoreTags) {
      params.ignoreTags.forEach((tag) => {
        if (tag) {
          this.skipTagsCustom[tag.toUpperCase()] = true;
        }
      });
    }
    if (params.ignoreClass) {
      params.ignoreClass.forEach((cls) => {
        if (cls) {
          this.skipClassCustom[cls.toLowerCase()] = true;
        }
      });
    }
  }

  /**
   * Attach a document. Optionally attach a root node
   * from the document.
   *
   * If not root node is defined, then attach both
   * document.head and document.body
   *
   * @param {*} document
   * @param {*} root (optional)
   * @memberof TxNativeDOM
   */
  attachDOM(document, root) {
    if (!document) {
      throw new Error('Missing document from attachDOM');
    }
    this.document = document;
    if (this.document.txSourceLocale === undefined) {
      const htmlTag = this.document.getElementsByTagName('html')[0];
      if (htmlTag && htmlTag.getAttribute('lang')) {
        this.document.txSourceLocale = htmlTag.getAttribute('lang');
      } else {
        this.document.txSourceLocale = '';
      }
    }
    if (root) {
      this._parseDOM({
        node: root,
        parentTags: [],
        options: PARSER_OPTIONS.DEFAULT,
      });
    } else {
      if (document.head) {
        this._parseDOM({
          node: document.head,
          parentTags: [],
          options: PARSER_OPTIONS.DEFAULT,
        });
      }
      if (document.body) {
        this._parseDOM({
          node: document.body,
          parentTags: [],
          options: PARSER_OPTIONS.DEFAULT,
        });
      }
    }
  }

  /**
   * Clear DOM from metadata
   *
   * @param {*} node
   * @memberof TxNativeDOM
   */
  detachDOM(node) {
    if (!node) return;

    if (node === this.document) {
      this.detachDOM(node.head);
      this.detachDOM(node.body);
      return;
    }

    // remove flags
    try {
      if (node.txbefore_detected) delete node.txbefore_detected;
      if (node.txafter_detected) delete node.txafter_detected;
      if (node.txblock_detected) delete node.txblock_detected;
      if (node.txtext_detected) delete node.txtext_detected;
      if (node.txattr_detected) delete node.txattr_detected;
      if (node.txsegment) delete node.txsegment;
    } catch (err) { /* pass */ }

    // proceed to children
    node = node.firstChild;
    while (node) {
      this.detachDOM(node);
      node = node.nextSibling;
    }
  }

  /**
   * Reset DOM to source language
   *
   * @memberof TxNativeDOM
   */
  toSource() {
    const document = this.document;
    Object.keys(this.segments).forEach((key) => {
      const s = this.segments[key];
      let j = s.elements.length;
      while (j--) {
        const item = s.elements[j];
        try {
          if (item.modified) {
            item.set({ item, text: s.sourceString, document });
            item.modified = false;
          }
        } catch (err) { /* pass */ }
      }
      delete s.translationString;
    });
    // update html lang if exists
    const htmlTag = this.document.getElementsByTagName('html')[0];
    if (htmlTag) {
      if (this.document.txSourceLocale) {
        htmlTag.setAttribute('lang', this.document.txSourceLocale);
      } else {
        htmlTag.removeAttribute('lang');
      }
    }
  }

  /**
   * Translate DOM to specific locale.
   * Takes as input a locale code and a
   * t function that returns the translation
   * for a specific key.
   *
   * For example
   * function t(key) {
   *   return "This is a translation";
   * }
   *
   * @param {String} locale
   * @param {Function} t
   * @memberof TxNativeDOM
   */
  toLanguage(locale, t) {
    // standard segments
    const document = this.document;
    Object.keys(this.segments).forEach((key) => {
      const s = this.segments[key];
      const text = t(key);
      let j = s.elements.length;
      while (j--) {
        const item = s.elements[j];
        try {
          if (text) {
            item.set({ item, text, document });
            item.modified = true;
          } else if (item.modified) {
            item.set({ item, text: s.sourceString, document });
            item.modified = false;
          }
        } catch (err) {
          s.elements.splice(j, 1);
        }
      }
      s.translationString = text || s.sourceString;
    });
    // update html lang if exists
    const htmlTag = this.document.getElementsByTagName('html')[0];
    if (htmlTag) {
      htmlTag.setAttribute('lang', locale.toLowerCase().replace('_', '-'));
    }
  }

  /**
   * Pseudo translate DOM
   *
   * @memberof TxNativeDOM
   */
  pseudoTranslate() {
    this.toLanguage('pseudo', pseudo);
  }

  /**
   * Get a JSON object with segmented strings:
   * {
   *   <key>: {
   *     string: <phrase>,
   *     meta: {
   *       tags: Array<String>,
   *       occurrences: Array<String>,
   *     },
   *   },
   * }
   *
   * @param {Object} params
   * @param {Array[String]} params.occurrences
   * @param {Array[String]} params.tags
   * @return {*} json
   * @memberof TxNativeDOM
   */
  getStringsJSON(params = {}) {
    const data = {};
    Object.keys(this.segments).forEach((key) => {
      const entry = {
        string: this.segments[key].sourceString,
        meta: {},
      };
      if (this.segments[key].tags.length) {
        entry.meta.tags = [...this.segments[key].tags];
      }
      if (params.tags) {
        entry.meta.tags = entry.meta.tags || [];
        params.tags.forEach((tag) => {
          if (entry.meta.tags.indexOf(tag) === -1) {
            entry.meta.tags.push(tag);
          }
        });
      }
      if (params.occurrences) {
        entry.meta.occurrences = [...params.occurrences];
      }
      data[key] = entry;
    });
    return data;
  }

  /**
   * Generate key from string
   *
   * @param {String} string
   * @return {String}
   * @memberof TxNativeDOM
   */
  _getKey(string) {
    return string;
  }

  /**
   * Check node is block element
   *
   * @param {*} node
   * @return {Boolean}
   * @memberof TxNativeDOM
   */
  _isBlockElement(node) {
    return node.nodeType === 1 && BLOCK_NODES[node.tagName] === true;
  }

  /**
   * Check node is text element
   *
   * @param {*} node
   * @return {Boolean}
   * @memberof TxNativeDOM
   */
  _isTextElement(node) {
    return node.nodeType === 3;
  }

  /**
   * Check node has React or Angular data bindings
   *
   * @param {*} node
   * @return {Boolean}
   * @memberof TxNativeDOM
   */
  _hasDataBinding(node) {
    return (
      node.nodeType === 1
      && node.className
      && `' ${node.className}`.indexOf(' ng-') !== -1
    ) || (
      node.nodeType === 8
      && node.nodeValue
      && node.nodeValue.indexOf('react-') !== -1
    );
  }

  /**
   * Check if tag should be ignored
   *
   * @param {String} tagName
   * @return {Boolean}
   * @memberof TxNativeDOM
   */
  _isSkipTag(tagName) {
    return tagName && this.skipTagsCustom[tagName];
  }

  /**
   * Check if tag should be ignored
   *
   * @param {String} tagName
   * @return {Boolean}
   * @memberof TxNativeDOM
   */
  _isSkipTagContent(tagName) {
    return tagName && SKIP_TAGS_CONTENT[tagName];
  }

  /**
   * Check if class name should be ignored
   *
   * @param {String} className
   * @return {Boolean}
   * @memberof TxNativeDOM
   */
  _isSkipClass(className) {
    if (!className || !isString(className)) return false;
    const clsArray = className.toLowerCase().match(/\S+/g);
    if (!clsArray) return false;
    let i = clsArray.length;
    while (i--) {
      if (this.skipClassCustom[clsArray[i]]) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if node has attributes that should make it to be ignored
   *
   * @param {*} node
   * @return {Boolean}
   * @memberof TxNativeDOM
   */
  _isSkipAttr(node) {
    if (!node.getAttribute) return false;
    let contentAttr = node.getAttribute('tx-content');
    if (contentAttr && contentAttr.length) {
      contentAttr = contentAttr.toLowerCase();
      if (/\bexclude\b/.test(contentAttr)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Parse DOM node
   *
   * @param {*} { node, parentTags, options }
   * @memberof TxNativeDOM
   */
  _parseDOM({ node, parentTags, options }) {
    if (!node || this._isSkipTag(node.tagName)) return;
    // raw TEXT node or end node
    if (node.nodeType === 3) {
      // grab its html
      if (PARSER_OPTIONS.isunset(options, PARSER_OPTIONS.DO_NOT_COLLECT)) {
        this._crawlText({ node, tags: parentTags, options });
      }
    } else if (node.nodeType === 1 && !this._isSkipClass(node.className)) {
      // ELEMENT node type
      let tags = parentTags;
      // check for user defined tags
      let tagAttr = node.getAttribute('tx-tags');
      if (tagAttr && tagAttr.length) {
        tags = parentTags.slice(0);
        // split by comma
        tagAttr = tagAttr.split(',');
        let i = tagAttr.length;
        while (i--) {
          const a = tagAttr[i].trim().toLowerCase();
          if (a && a.length && tags.indexOf(a) < 0) {
            tags.push(a);
          }
        }
      }
      // check for tx-content
      let contentAttr = node.getAttribute('tx-content');
      let isBlock = false;
      let _options = options;

      if (contentAttr && contentAttr.length) {
        contentAttr = contentAttr.toLowerCase();
        if (/\bexclude\b/.test(contentAttr)) {
          _options = PARSER_OPTIONS.set(_options, PARSER_OPTIONS.DO_NOT_COLLECT);
        } else if (/\binclude\b/.test(contentAttr)) {
          _options = PARSER_OPTIONS.unset(_options, PARSER_OPTIONS.DO_NOT_COLLECT);
        } else if (/\bblock\b/.test(contentAttr)) {
          _options = PARSER_OPTIONS.unset(_options, PARSER_OPTIONS.DO_NOT_COLLECT);
          isBlock = true;
        }
        if (/\bnotranslate_urls\b/.test(contentAttr)) {
          _options = PARSER_OPTIONS.set(_options, PARSER_OPTIONS.URLS_AS_VARS);
        } else if (/\btranslate_urls\b/.test(contentAttr)) {
          _options = PARSER_OPTIONS.unset(_options, PARSER_OPTIONS.URLS_AS_VARS);
        }
      }

      const _collect = PARSER_OPTIONS.isunset(_options, PARSER_OPTIONS.DO_NOT_COLLECT);
      if (_collect) this._parseAttr({ node, tags, options: _options });

      // check if all children are TEXT NODES.
      // In that case handle it as block.
      // This allows the use of <br> blocks inside text translations
      if (!isBlock && node.childNodes.length) {
        let allTextNodes = true;
        for (let j = node.childNodes.length - 1; j >= 0; --j) {
          if (node.childNodes[j].nodeType !== 3) {
            allTextNodes = false;
            break;
          }
        }
        if (allTextNodes) {
          isBlock = true;
        }
      }
      if (isBlock) {
        if (_collect) this._crawlBlock({ node, tags, options: _options });
      } else {
        let childnode = node.shadowRoot
          ? node.shadowRoot.firstChild
          : node.firstChild;
        while (childnode) {
          if (this._isBlockElement(childnode)) {
            this._parseDOM({ node: childnode, parentTags: tags, options: _options });
            childnode = childnode.nextSibling;
          } else {
            const nextnode = childnode.nextSibling;
            if (!nextnode || (nextnode && this._isBlockElement(nextnode))) {
              this._parseDOM({ node: childnode, parentTags: tags, options: _options });
              childnode = childnode.nextSibling;
            } else {
              // fragment
              const snodeBefore = childnode.previousSibling;
              let snodeAfter = null;
              let snode = childnode;
              let hasText = false;
              let hasDatabinding = false;
              while (snode) {
                if (this._isTextElement(snode)
                  && snode.nodeValue
                  && snode.nodeValue.trim().length
                ) {
                  hasText = true;
                } else if (
                  !this.ignoreDatabind
                  && this._hasDataBinding(snode)
                ) {
                  hasDatabinding = true;
                  break;
                } else if (this._isBlockElement(snode)) {
                  snodeAfter = snode;
                  break;
                }
                snode = snode.nextSibling;
              }
              if (!hasText || hasDatabinding) {
                // process normal
                while (childnode && childnode !== snodeAfter) {
                  this._parseDOM({ node: childnode, parentTags: tags, options: _options });
                  childnode = childnode.nextSibling;
                }
              } else if (snodeBefore || snodeAfter) {
                if (_collect) {
                  this._crawlFragment({
                    snodeBefore,
                    snodeAfter,
                    tags,
                    options: _options,
                  });
                }
                childnode = snodeAfter;
              } else {
                // full of inline elements
                if (_collect) this._crawlBlock({ node, tags, options: _options });
                childnode = null;
              }
            }
          }
        }
      }
    }
  }

  /**
   * Parse text node
   *
   * @param {*} { node, tags }
   * @memberof TxNativeDOM
   */
  _crawlText({ node, tags }) {
    if (node.txtext_detected === true) return;
    try { node.txtext_detected = true; } catch (err) { /* pass */ }
    const rawText = node.nodeValue;
    const text = stripWhitespace(rawText);
    // exclude empty elements
    if (text && text.length && !IS_NOT_TEXTUAL_REGEX.test(text)) {
      // generate a segment hash identifier
      const key = this._getKey(text);
      let segment = this.segments[key];
      if (!segment) {
        segment = {
          key, // key
          sourceString: text, // source string
          tags: [], // source tags
          elements: [], // list of DOM elements
        };
        this.segments[key] = segment;
      }
      if (tags.length) {
        mergeArrays(segment.tags, tags);
      }
      segment.elements.push({
        segment,
        node,
        pnode: node.parentNode,
        set: SET_TEXT,
        get: GET_TEXT,
        head: rawText.indexOf(' ') === 0 ? ' ' : '',
        tail: rawText.indexOf(' ', rawText.length - 1) >= 0 ? ' ' : '',
      });
      try {
        node.txsegment = segment;
      } catch (err) {
        // pass
      }
    }
  }

  /**
   * Parse block node
   *
   * @param {*} { node, tags, options }
   * @memberof TxNativeDOM
   */
  _crawlBlock({ node, tags, options }) {
    if (node.txblock_detected === true) return;
    try { node.txblock_detected = true; } catch (err) { /* pass */ }

    if (this._isSkipTagContent(node.tagName)) return;

    const rawText = node.innerHTML;
    let text = removeComments(rawText);
    text = stripWhitespace(text);
    if (!text || IS_NOT_TEXTUAL_REGEX.test(text)) return;
    // detect notranslate elements and mark them as variables
    const args = [];
    text = this._parseVariables({ text, args, options });
    // generate a segment hash identifier
    const key = this._getKey(text);
    let segment = this.segments[key];
    if (!segment) {
      segment = {
        key, // key
        sourceString: text, // source string
        tags: [], // source tagging
        elements: [], // list of DOM elements
      };
      this.segments[key] = segment;
    }
    if (tags.length) {
      mergeArrays(segment.tags, tags);
    }
    segment.elements.push({
      segment,
      node,
      pnode: node,
      set: SET_BLOCK,
      get: GET_BLOCK,
      block_args: args,
      head: rawText.indexOf(' ') === 0 ? ' ' : '',
      tail: rawText.indexOf(' ', rawText.length - 1) >= 0 ? ' ' : '',
    });
    try { node.txsegment = segment; } catch (err) { /* pass */ }
  }

  /**
   * Parse fragment node
   *
   * @param {*} {
   *     snodeBefore,
   *     snodeAfter,
   *     tags,
   *     options,
   *   }
   * @memberof TxNativeDOM
   */
  _crawlFragment({
    snodeBefore,
    snodeAfter,
    tags,
    options,
  }) {
    if ((!snodeBefore
      || (snodeBefore && snodeBefore.txbefore_detected === true))
      && (!snodeAfter
        || (snodeAfter && snodeAfter.txafter_detected === true))) return;
    try {
      if (snodeBefore) snodeBefore.txbefore_detected = true;
      if (snodeAfter) snodeAfter.txafter_detected = true;
    } catch (err) { /* pass */ }
    const node = this.document.createElement('div');
    let next = snodeBefore
      ? snodeBefore.nextSibling
      : snodeAfter.parentNode.firstChild;
    while (next && next !== snodeAfter) {
      node.appendChild(next.cloneNode(true));
      next = next.nextSibling;
    }
    const rawText = node.innerHTML;
    let text = removeComments(rawText);
    text = stripWhitespace(text);
    if (!text) return;
    // detect notranslate elements and mark them as variables
    const args = [];
    text = this._parseVariables({ text, args, options });
    // generate a segment hash identifier
    const key = this._getKey(text);
    let segment = this.segments[key];
    if (!segment) {
      segment = {
        key, // key
        sourceString: text, // source string
        tags: [], // source tagging
        elements: [], // list of DOM elements
      };
      this.segments[key] = segment;
    }
    if (tags.length) mergeArrays(segment.tags, tags);
    segment.elements.push({
      segment,
      pnode: (snodeBefore || snodeAfter).parentNode,
      snodeBefore,
      snodeAfter,
      set: SET_FRAGMENT,
      get: GET_FRAGMENT,
      block_args: args,
      head: rawText.indexOf(' ') === 0 ? ' ' : '',
      tail: rawText.indexOf(' ', rawText.length - 1) >= 0 ? ' ' : '',
    });
  }

  /**
   * Parse node attributes
   *
   * @param {*} { node, tags, options }
   * @memberof TxNativeDOM
   */
  _parseAttr({ node, tags, options }) {
    if (node.txattr_detected === true) return;
    try { node.txattr_detected = true; } catch (err) { /* pass */ }
    const attrs = this._detectI18nAttr({ node, options });
    for (let i = 0; i < attrs.length; ++i) {
      this._crawlAttr({
        node, attr: attrs[i], tags, options,
      });
    }
  }

  /**
   * Parse node attributes
   *
   * @param {*} { node, attr, tags }
   * @memberof TxNativeDOM
   */
  _crawlAttr({ node, attr, tags }) {
    const rawText = node.getAttribute(attr) || '';
    const text = stripWhitespace(rawText);
    if (text && text.length && !IS_NOT_TEXTUAL_REGEX.test(text)) {
      // generate a segment hash identifier
      const key = this._getKey(text);
      let segment = this.segments[key];
      if (!segment) {
        segment = {
          key, // key
          sourceString: text, // source string
          tags: [], // source tagging
          elements: [], // list of DOM elements
        };
        this.segments[key] = segment;
      }
      if (tags.length) {
        mergeArrays(segment.tags, tags);
      }
      segment.elements.push({
        segment,
        node,
        pnode: node.parentNode,
        set: SET_ATTR,
        get: GET_ATTR,
        attribute: attr,
        head: rawText.indexOf(' ') === 0 ? ' ' : '',
        tail: rawText.indexOf(' ', rawText.length - 1) >= 0 ? ' ' : '',
      });
      try { node.txsegment = segment; } catch (err) { /* pass */ }
    }
  }

  /**
   * Detect translatable i18n attributes
   *
   * @param {*} { node, options }
   * @return {Array}
   * @memberof TxNativeDOM
   */
  _detectI18nAttr({ node, options }) {
    const list = [];
    let i;
    let a;
    switch (node.tagName) {
      case 'A':
        list.push('title');
        if (PARSER_OPTIONS.isunset(options, PARSER_OPTIONS.URLS_AS_VARS)) {
          list.push('href');
        }
        break;
      case 'IMG':
        list.push('title');
        list.push('alt');
        if (PARSER_OPTIONS.isunset(options, PARSER_OPTIONS.URLS_AS_VARS)) {
          list.push('src');
          list.push('srcset');
        }
        break;
      case 'META': {
        let name = node.getAttribute('name');
        if (name) {
          name = name.toLowerCase();
          if (name === 'keywords'
              || name === 'description'
              || name === 'title'
              || name === 'twitter:title'
              || name === 'twitter:description'
          ) {
            list.push('content');
          }
        }
        let socialTags = node.getAttribute('property');
        if (socialTags) {
          socialTags = socialTags.toLowerCase();
          if (socialTags === 'og:title' || socialTags === 'og:description') {
            list.push('content');
          }
        }
        let googleplusTags = node.getAttribute('itemprop');
        if (googleplusTags) {
          googleplusTags = googleplusTags.toLowerCase();
          if (googleplusTags === 'name' || googleplusTags === 'description') {
            list.push('content');
          }
        }
        break;
      }
      case 'INPUT': {
        list.push('placeholder');
        let inputtype = node.getAttribute('type');
        if (inputtype) {
          inputtype = inputtype.toLowerCase();
          if (inputtype === 'button'
              || inputtype === 'reset'
              || inputtype === 'submit'
          ) {
            list.push('value');
          } else if (inputtype === 'image') {
            list.push('alt');
            if (PARSER_OPTIONS.isunset(options, PARSER_OPTIONS.URLS_AS_VARS)) {
              list.push('src');
            }
          }
        }
        break;
      }
      case 'TEXTAREA':
        list.push('placeholder');
        break;
      default:
        break;
    }
    // check for user defined attributes to be translated
    let customAttr = node.getAttribute('tx-attrs');
    if (customAttr && customAttr.length) {
      // split by comma
      customAttr = customAttr.split(',');
      i = customAttr.length;
      while (i--) {
        a = customAttr[i].trim().toLowerCase();
        if (a && list.indexOf(a) < 0) {
          list.push(a);
        }
      }
    }
    // parse globally defined attributes
    if (this.parseAttr.length) {
      for (i = 0; i < this.parseAttr.length; ++i) {
        a = this.parseAttr[i];
        if (list.indexOf(a) < 0) {
          list.push(a);
        }
      }
    }
    return list;
  }

  /**
   * Parse variables
   *
   * @param {*} { text, args, options }
   * @return {String}
   * @memberof TxNativeDOM
   */
  _parseVariables({ text, args, options }) {
    // parse custom variable expressions
    if (this.variablesParser) {
      text = this.variablesParser(text, (match) => {
        args.push({
          type: 'VAR',
          html: match,
        });
        return `{var${args.length - 1}}`;
      });
    }

    // Parse variables only if there are tags present
    if (/<[a-z][\s\S]*>/i.test(text)) {
      const node = this.document.createElement('div');
      node.innerHTML = text;
      this._parseArgs({ node: node.firstChild, args });
      // replace text with arguments
      for (let i = 0; i < args.length; ++i) {
        if (args[i].type === 'VAR') {
          text = text.replace(args[i].html, `{var${i}}`);
        }
      }
    }
    if (PARSER_OPTIONS.isset(options, PARSER_OPTIONS.URLS_AS_VARS)
      && /\s(src|href)/i.test(text)
    ) {
      let match;
      const regex = /(<a[^>]*href\s*=\s*)("[^"]*"|'[^']*')|(<img[^>]*src\s*=\s*)("[^"]*"|'[^']*')/ig; // eslint-disable-line
      let result = '';
      let lastIndex = 0;
      while (match = regex.exec(text)) { // eslint-disable-line
        result += text.substring(lastIndex, match.index);
        if (match[2]) {
          result += `${match[1]}${match[2][0]}{var${args.length}}${match[2][0]}`;
          args.push({
            type: 'VAR',
            html: match[2].substring(1, match[2].length - 1),
          });
        } else {
          result += `${match[3]}${match[4][0]}{var${args.length}}${match[4][0]}`;
          args.push({
            type: 'VAR',
            html: match[4].substring(1, match[4].length - 1),
          });
        }
        lastIndex = regex.lastIndex;
      }
      result += text.substring(lastIndex, text.length);
      text = result;
    }
    return text;
  }

  /**
   * Parse arguments
   *
   * @param {*} { node, args }
   * @memberof TxNativeDOM
   */
  _parseArgs({ node, args }) {
    if (node) do { // eslint-disable-line
      if (node.nodeType === 1) {
        if (this._isSkipTag(node.tagName)
          || this._isSkipClass(node.className)
          || this._isSkipAttr(node)
        ) {
          const outerhtml = node.outerHTML;
          if (outerhtml) {
            args.push({
              type: 'VAR',
              html: outerhtml,
            });
          }
        } else {
          this._parseArgs({ node: node.firstChild, args });
        }
      }
    }
    while (node = node.nextSibling); // eslint-disable-line
  }
}
