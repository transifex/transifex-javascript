/* globals describe, it */

const { expect } = require('chai');
const { mergePayload } = require('../../src/api/merge');

describe('mergePayload', () => {
  it('merges json', async () => {
    let parent = {};
    let child = {
      key1: {
        string: 'foo',
      },
    };
    expect(mergePayload(parent, child)).to.deep.equal({
      key1: {
        string: 'foo',
      },
    });

    // -----

    parent = {
      key1: {
        string: 'foo',
      },
    };
    child = {
      key1: {
        string: 'foo2',
      },
    };
    expect(mergePayload(parent, child)).to.deep.equal({
      key1: {
        string: 'foo',
      },
    });

    // -----

    parent = {
      key1: {
        string: 'foo',
      },
    };
    child = {
      key1: {
        string: 'foo',
        meta: {
          tags: ['t1', 't2'],
          developer_comment: 'comment',
        },
      },
    };
    expect(mergePayload(parent, child)).to.deep.equal({
      key1: {
        string: 'foo',
        meta: {
          tags: ['t1', 't2'],
          developer_comment: 'comment',
        },
      },
    });

    // -----

    parent = {
      key1: {
        string: 'foo1',
        meta: {
          developer_comment: 'parent_comment1',
          character_limit: 10,
          tags: ['t1', 't2'],
          occurrences: ['o1', 'o2'],
        },
      },
      key2: {
        string: 'foo2',
        meta: {
          developer_comment: 'parent_comment2',
          character_limit: 10,
          tags: ['t1_2', 't2_2'],
          occurrences: ['o1_2', 'o2_2'],
        },
      },
      key3: {
        string: 'foo3',
        meta: {
          developer_comment: 'parent_comment3',
          character_limit: 5,
          tags: ['t1_3', 't2_3'],
          occurrences: ['o1_3', 'o2_3'],
        },
      },
    };
    child = {
      key1: {
        string: 'foo1',
        meta: {
          developer_comment: 'child_comment1',
          character_limit: 1,
          tags: ['t2', 't3'],
          occurrences: ['o3', 'o4'],
        },
      },
      key2: {
        string: 'foo2',
        meta: {
          developer_comment: 'child_comment2',
          character_limit: 20,
          tags: ['t2_2', 't2_2'],
          occurrences: ['o1_2', 'o2_2'],
        },
      },
    };
    expect(mergePayload(parent, child)).to.deep.equal({
      key1: {
        string: 'foo1',
        meta: {
          developer_comment: 'child_comment1',
          character_limit: 1,
          tags: ['t1', 't2', 't3'],
          occurrences: ['o1', 'o2', 'o3', 'o4'],
        },
      },
      key2: {
        string: 'foo2',
        meta: {
          developer_comment: 'child_comment2',
          character_limit: 20,
          tags: ['t1_2', 't2_2'],
          occurrences: ['o1_2', 'o2_2'],
        },
      },
      key3: {
        string: 'foo3',
        meta: {
          developer_comment: 'parent_comment3',
          character_limit: 5,
          tags: ['t1_3', 't2_3'],
          occurrences: ['o1_3', 'o2_3'],
        },
      },
    });
  });
});
