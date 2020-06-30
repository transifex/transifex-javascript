import t from './t';
import ut from './ut';
import * as utils from './utils';
import * as config from './config';
import * as state from './state';
import * as events from './events';

const Transifex = {
  t,
  ut,
  ...config,
  ...state,
  ...utils,
  ...events,
}

export default Transifex;
