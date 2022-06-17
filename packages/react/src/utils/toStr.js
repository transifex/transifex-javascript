import React from 'react';

/* Convert a React component's children to a string. Each "tag" must be
  * converted to a numbered tag in the order they were encountered in and all
  * props must be stripped. The props must be preserved in the second return
  * value so that they can be reinserted again later.
  *
  *   element = <><one two="three">four<five six="seven" /></one></>;
  *   const [result, propsContainer] = toStr(element.props.children);
  *   console.log(result.join(''));
  *   // <<< '<1>four<2/></1>'
  *   console.log(propsContainer);
  *   // <<< [['one', {two: 'three'}], ['five', {six: 'seven'}]]
  *
  * The second argument and third return value are there because of how
  * recursion works. For high-level invocation you won't have to worry about
  * them.
  * */
export function toStr(children, counter = 0) {
  if (!children) { return [[], [], 0]; }
  let actualChildren = children;
  if (!Array.isArray(children)) {
    actualChildren = [children];
  }

  // Return values
  let result = [];
  let propsContainer = [];

  let actualCounter = counter;
  for (let i = 0; i < actualChildren.length; i += 1) {
    const child = actualChildren[i];
    if (React.isValidElement(child)) {
      actualCounter += 1;

      // Each entry in propsContainer matches one matched react element. So for
      // the element replaced with '<4>', the relevant props will be
      // `propsContainer[3]` (4 - 1)
      const props = [
        child.type,
        { ...child.props }, // Do this so that delete can work later
      ];
      delete props[1].children;
      propsContainer.push(props);

      if (child.props.children) {
        // child has children, recursively run 'toStr' on them
        const [newResult, newProps, newCounter] = toStr(
          child.props.children,
          actualCounter,
        );
        result.push(`<${actualCounter}>`); //  <4>
        result = result.concat(newResult); //  <4>...
        result.push(`</${actualCounter}>`); // <4>...</4>
        // Extend propsContainer with what was found during the recursion
        propsContainer = propsContainer.concat(newProps);
        // Take numbered tags that were found during the recursion into account
        actualCounter = newCounter;
      } else {
        // child has no children of its own, replace with something like '<4/>'
        result.push(`<${actualCounter}/>`);
      }
    } else {
      // Child is not a React element, append as-is
      /* eslint-disable no-lonely-if */
      if (typeof child === 'string' || child instanceof String) {
        const chunk = child.trim();
        if (chunk) { result.push(chunk); }
      } else {
        result.push(child);
      }
      /* eslint-enable */
    }
  }

  return [result, propsContainer, actualCounter];
}

/*  Convert a string that was generated from 'toStr', or its translation, back
  * to a React element, combining it with the props that were extracted during
  * 'toStr'.
  *
  *   toElement(
  *     'one<1>five<2/></1>',
  *     [['two', {three: 'four'}], ['six', {seven: 'eight'}]],
  *   );
  *   // The browser will render the equivalent of
  *   // one<two three="four">five<six seven="eight" /></two>
  * */
export function toElement(translation, propsContainer) {
  const regexp = /<(\d+)(\/?)>/; // Find opening or single tags
  const result = [];

  let lastEnd = 0; // Last position in 'translation' we have "consumed" so far
  let lastKey = 0;

  for (;;) {
    const match = regexp.exec(translation.substring(lastEnd));
    if (match === null) { break; } // We've reached the end

    // Copy until match
    const matchIndex = lastEnd + match.index;
    const chunk = translation.substring(lastEnd, matchIndex);
    if (chunk) { result.push(chunk); }

    const [openingTag, numberString, rightSlash] = match;
    const number = parseInt(numberString, 10);
    const [type, props] = propsContainer[number - 1]; // Find relevant props
    if (rightSlash) {
      // Single tag, copy props and don't include children in the React element
      result.push(React.createElement(type, { ...props, key: lastKey }));
      lastEnd += matchIndex + openingTag.length;
    } else {
      // Opening tag, find the closing tag which is guaranteed to be there and
      // to be unique
      const endingTag = `</${number}>`;
      const endingTagPos = translation.indexOf(endingTag);
      // Recursively convert contents to React elements
      const newResult = toElement(
        translation.substring(matchIndex + openingTag.length, endingTagPos),
        propsContainer,
      );
      // Copy props and include recursion result as children
      result.push(React.createElement(
        type,
        { ...props, key: lastKey },
        ...newResult,
      ));
      lastEnd = endingTagPos + endingTag.length;
    }
    lastKey += 1;
  }

  // Copy rest of 'translation'
  const chunk = translation.substring(lastEnd, translation.length);
  if (chunk) { result.push(chunk); }

  return result;
}
