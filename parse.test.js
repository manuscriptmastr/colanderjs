const assert = require('assert');
const eq = assert.deepStrictEqual;
const { parse, p } = require('./parse');

// with key different from payload key
eq(
  parse(
    { handle: p('username') }
  )({ username: 'manuscriptmaster' }),
  { handle: 'manuscriptmaster' }
);

// with children resolvers
eq(
  parse(
    { project: p('board', { identifier: p('id') }) }
  )({ board: { id: 123 } }),
  { project: { identifier: 123 } }
);

// with deeply-nested resolvers
eq(
  parse(
    { project: p('board', { author: p('user', { identifier: p('id') }) }) }
  )({ board: { user: { id: 123 } } }),
  { project: { author: { identifier: 123 } } }
);

// with array
eq(
  parse(
    { stories: p('issues', [{ identifier: p('id') }]) }
  )({ issues: [{ id: 123 }, { id: 456 }] }),
  { stories: [{ identifier: 123 }, { identifier: 456 }] }
);

// with hardcoded property
eq(
  parse(
    { stories: p('issues', [{ identifier: p('id'), hardcoded: 'hello' }]) }
  )({ issues: [{ id: 123 }, { id: 456 }] }),
  { stories: [{ identifier: 123, hardcoded: 'hello' }, { identifier: 456, hardcoded: 'hello' }] }
);

// with plain function
eq(
  parse(
    { stories: p => p.issues }
  )({ issues: [{ id: 123, name: 'Fix' }, { id: 456, name: 'Me' }] }),
  { stories: [{ id: 123, name: 'Fix' }, { id: 456, name: 'Me' }] }
);

// with top-level array
eq(
  parse(
    [{ identifier: p('id') }]
  )([{ id: 123 }, { id: 456 }]),
  [{ identifier: 123 }, { identifier: 456 }]
);

// with top-level array and extract
eq(
  parse((issues) => issues.filter(issue => issue.boardId === 123), [{
    id: p('id')
  }])([{ id: 456, boardId: 123 }, { id: 789, boardId: 123 }, { id: 321, boardId: 432 }]),
  [{ id: 456 }, { id: 789 }]
);

// with top-level object and extract
eq(
  parse((issues) => issues[0], {
    id: p('id')
  })([{ id: 456 }, { id: 789 }]),
  { id: 456 }
);

// with root parameter
eq(
  parse({
    project: p('project', {
      issues: p('issues', [{
        id: p('id'),
        board: p((issue, root) => root.boards.find(board => board.id === issue.boardId), {
          id: p('id')
        })
      }])
    })
  })({
    project: {
      id: 123,
      issues: [
        { id: 456, boardId: 654 },
        { id: 789, boardId: 987 }
      ]
    },
    boards: [
      { id: 654 },
      { id: 987 }
    ]
  }),
  {
    project: {
      issues: [
        { id: 456, board: { id: 654 } },
        { id: 789, board: { id: 987 } }
      ]
    }
  }
);

// when property does not exist or is undefined, set to null
eq(
  parse(
    { username: p('uname') }
  )({ username: 'manuscriptmaster' }),
  { username: null }
);

// when property does not exist or is undefined, set to null and ignore children resolvers
eq(
  parse({
    user: p('user', {
      id: p('id')
    })
  })({ currentUser: { id: 123 } }),
  { user: null }
);

// when plain function returns undefined or null, set to null
eq(
  parse({ user: p(p => p.user) })({ currentUser: { id: 123 } }),
  { user: null }
);

// when plain function returns undefined or null, set to null and ignore children resolvers
eq(
  parse({
    user: p(p => p.user, {
      id: p('id')
    })
  })({ currentUser: { id: 123 } }),
  { user: null }
);