/* eslint-disable no-param-reassign */
import { decodeString } from './utils';

export function SET_TEXT({ item, text }) {
  item.node.nodeValue = `${item.head}${decodeString(text)}${item.tail}`;
}

export function GET_TEXT({ item }) {
  return item.node.nodeValue;
}

export function SET_FRAGMENT({ item, text, document }) {
  text = decodeString(text);

  for (let i = 0; i < item.block_args.length; ++i) {
    const arg = item.block_args[i];
    if (arg.type === 'VAR') {
      text = text.replace(`{var${i}}`, arg.html);
    }
  }

  // remove previous nodes
  let node = item.snodeBefore
    ? item.snodeBefore.nextSibling
    : item.snodeAfter.parentNode.firstChild;

  while (node && node !== item.snodeAfter) {
    const toDelete = node;
    node = node.nextSibling;
    toDelete.parentNode.removeChild(toDelete);
  }

  const tmp = document.createElement('div');
  tmp.innerHTML = `${item.head}${text}${item.tail}`;

  const frag = document.createDocumentFragment();
  let child;
  while (child = tmp.firstChild) { // eslint-disable-line
    frag.appendChild(child);
  }
  // add it to element
  (item.snodeBefore || item.snodeAfter).parentNode.insertBefore(
    frag, item.snodeAfter,
  );
}

export function GET_FRAGMENT({ item, document }) {
  let node = item.snodeBefore
    ? item.snodeBefore.nextSibling
    : item.snodeAfter.parentNode.firstChild;

  const tmp = document.createElement('div');
  while (node && node !== item.snodeAfter) {
    tmp.appendChild(node.cloneNode(true));
    node = node.nextSibling;
  }

  return tmp.innerHTML;
}

// block op
export function SET_BLOCK({ item, text }) {
  text = decodeString(text);

  for (let i = 0; i < item.block_args.length; ++i) {
    const arg = item.block_args[i];
    if (arg.type === 'VAR') {
      text = text.replace(`{var${i}}`, arg.html);
    }
  }

  item.node.innerHTML = `${item.head}${text}${item.tail}`;
}

export function GET_BLOCK({ item }) {
  return item.node.innerHTML;
}

// attribute op
export function SET_ATTR({ item, text }) {
  text = decodeString(text);
  item.node.setAttribute(item.attribute, `${item.head}${text}${item.tail}`);
}

export function GET_ATTR({ item }) {
  return item.node.getAttribute(item.attribute);
}
