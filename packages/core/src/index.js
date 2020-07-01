import * as t from './t';
import * as ut from './ut';
import * as utils from './utils';
import * as config from './config';
import * as state from './state';
import * as events from './events';

const allImports = {
  ...t,
  ...ut,
  ...config,
  ...state,
  ...utils,
  ...events,
}

export const Transifex = allImports;

export * from './t';
export * from './ut';
export * from './utils';
export * from './config';
export * from './state';
export * from './events';
