const assert = require('assert');
const eq = assert.deepStrictEqual;
const { colander, c } = require('./colander');

// with key different from payload key
eq(
  colander(
    { handle: c('username') }
  )({ username: 'manuscriptmaster' }),
  { handle: 'manuscriptmaster' }
);

// with children resolvers
eq(
  colander(
    { project: c('board', { identifier: c('id') }) }
  )({ board: { id: 123 } }),
  { project: { identifier: 123 } }
);

// with deeply-nested resolvers
eq(
  colander(
    { project: c('board', { author: c('user', { identifier: c('id') }) }) }
  )({ board: { user: { id: 123 } } }),
  { project: { author: { identifier: 123 } } }
);

// with array
eq(
  colander(
    { stories: c('issues', [{ identifier: c('id') }]) }
  )({ issues: [{ id: 123 }, { id: 456 }] }),
  { stories: [{ identifier: 123 }, { identifier: 456 }] }
);

// with hardcoded property
eq(
  colander(
    { stories: c('issues', [{ identifier: c('id'), hardcoded: 'hello' }]) }
  )({ issues: [{ id: 123 }, { id: 456 }] }),
  { stories: [{ identifier: 123, hardcoded: 'hello' }, { identifier: 456, hardcoded: 'hello' }] }
);

// with plain function
eq(
  colander(
    { stories: p => p.issues }
  )({ issues: [{ id: 123, name: 'Fix' }, { id: 456, name: 'Me' }] }),
  { stories: [{ id: 123, name: 'Fix' }, { id: 456, name: 'Me' }] }
);

// with top-level array
eq(
  colander(
    [{ identifier: c('id') }]
  )([{ id: 123 }, { id: 456 }]),
  [{ identifier: 123 }, { identifier: 456 }]
);

// with top-level array and extract
eq(
  colander((issues) => issues.filter(issue => issue.boardId === 123), [{
    id: c('id')
  }])([{ id: 456, boardId: 123 }, { id: 789, boardId: 123 }, { id: 321, boardId: 432 }]),
  [{ id: 456 }, { id: 789 }]
);

// with top-level object and extract
eq(
  colander((issues) => issues[0], {
    id: c('id')
  })([{ id: 456 }, { id: 789 }]),
  { id: 456 }
);

// with root parameter
eq(
  colander({
    project: c('project', {
      issues: c('issues', [{
        id: c('id'),
        board: c((issue, root) => root.boards.find(board => board.id === issue.boardId), {
          id: c('id')
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
  colander(
    { username: c('uname') }
  )({ username: 'manuscriptmaster' }),
  { username: null }
);

// when property does not exist or is undefined, set to null and ignore children resolvers
eq(
  colander({
    user: c('user', {
      id: c('id')
    })
  })({ currentUser: { id: 123 } }),
  { user: null }
);

// when plain function returns undefined or null, set to null
eq(
  colander({ user: c(p => p.user) })({ currentUser: { id: 123 } }),
  { user: null }
);

// when plain function returns undefined or null, set to null and ignore children resolvers
eq(
  colander({
    user: c(p => p.user, {
      id: c('id')
    })
  })({ currentUser: { id: 123 } }),
  { user: null }
);