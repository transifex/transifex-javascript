/* eslint-disable no-underscore-dangle */
import React, { Fragment } from 'react';
import { t } from '@wordsmith/native';

/*  Wrapper of `t`-function that can accept React elements as properties. This
  * works by going through the properties looking for React elements and
  * replacing them with placeholder text that looks like
  * "__wsnative__X__wsnative__" where `X` will help us identify the element in
  * order to put it back later. The source template and the modified props are
  * then passed to the regular `t` function. The translation will come back
  * with the "__wsnative__X__wsnative__" embedded, as if they were regular
  * string properties. At this point we replace these with the React elements
  * that were extracted from the original properties. The final result will be
  * an array of React elements, each within its unique `key` property and, if
  * there are more than one, will be returned as `<>{result}</>`. */

function translateWithElements(_str, props, ws) {
  let _t = t;

  if (ws) {
    // backwards compatible check, in case ws is a provider context
    if (ws.instance && ws.instance.t) {
      _t = ws.instance.t;
    } else if (ws.t) {
      _t = ws.t;
    }
  }

  const actualProps = {};
  const reactElements = [];
  if (props) {
    Object.entries(props).forEach(([key, value]) => {
      if (React.isValidElement(value)) {
        actualProps[key] = `__wsnative__${reactElements.length}__wsnative__`;
        reactElements.push(value);
      } else {
        actualProps[key] = value;
      }
    });
  }
  const translation = _t(_str, actualProps);
  const result = [];
  let lastEnd = 0;
  let lastKey = 0;
  const regexp = RegExp('__wsnative__(\\d+)__wsnative__', 'g');
  let match = regexp.exec(translation);
  while (match !== null) {
    const chunk = translation.slice(lastEnd, match.index);
    if (chunk) {
      result.push(<Fragment key={lastKey}>{chunk}</Fragment>);
      lastKey += 1;
    }
    result.push(
      React.cloneElement(
        reactElements[parseInt(match[1], 10)], { key: lastKey },
      ),
    );
    lastKey += 1;
    lastEnd = match.index + match[0].length;
    match = regexp.exec(translation);
  }
  const chunk = translation.slice(lastEnd);
  if (chunk) {
    result.push(<Fragment key={lastKey}>{chunk}</Fragment>);
  }

  if (result.length === 0) { return ''; }
  if (result.length === 1) { return result[0].props.children; }
  return <Fragment>{result}</Fragment>;
}

export default translateWithElements;
