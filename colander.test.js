import test from 'ava';
import colander, { c } from './colander.js';

test('colander(resolvers) updates property name', t => {
  t.deepEqual(
    colander(
      { handle: c('username') }
    )({ username: 'manuscriptmaster' }),
    { handle: 'manuscriptmaster' }
  );
});

test('colander(resolvers) accepts children resolvers', t => {
  t.deepEqual(
    colander(
      { project: c('board', { identifier: c('id') }) }
    )({ board: { id: 123 } }),
    { project: { identifier: 123 } }
  );
});

test('colander(resolvers) accepts deeply-nested resolvers', t => {
  t.deepEqual(
    colander(
      { project: c('board', { author: c('user', { identifier: c('id') }) }) }
    )({ board: { user: { id: 123 } } }),
    { project: { author: { identifier: 123 } } }
  );
});

test('colander(resolvers) accepts array resolver', t => {
  t.deepEqual(
    colander(
      { stories: c('issues', [{ identifier: c('id') }]) }
    )({ issues: [{ id: 123 }, { id: 456 }] }),
    { stories: [{ identifier: 123 }, { identifier: 456 }] }
  );
});

test('colander(resolvers) does not interfere with hardcoded values', t => {
  t.deepEqual(
    colander(
      { stories: c('issues', [{ identifier: c('id'), hardcoded: 'hello' }]) }
    )({ issues: [{ id: 123 }, { id: 456 }] }),
    { stories: [{ identifier: 123, hardcoded: 'hello' }, { identifier: 456, hardcoded: 'hello' }] }
  );
});

test('colander(resolvers) resolves properties set to functions', t => {
  t.deepEqual(
    colander(
      { stories: p => p.issues }
    )({ issues: [{ id: 123, name: 'Fix' }, { id: 456, name: 'Me' }] }),
    { stories: [{ id: 123, name: 'Fix' }, { id: 456, name: 'Me' }] }
  );
});

test('colander(resolvers) accepts top-level array resolver', t => {
  t.deepEqual(
    colander(
      [{ identifier: c('id') }]
    )([{ id: 123 }, { id: 456 }]),
    [{ identifier: 123 }, { identifier: 456 }]
  );
});

test('colander(extractFromPayload, resolvers) accepts initial extract argument', t => {
  t.deepEqual(
    colander((issues) => issues[0], {
      id: c('id')
    })([{ id: 456 }, { id: 789 }]),
    { id: 456 }
  );
  t.deepEqual(
    colander((issues) => issues.filter(issue => issue.boardId === 123), [{
      id: c('id')
    }])([{ id: 456, boardId: 123 }, { id: 789, boardId: 123 }, { id: 321, boardId: 432 }]),
    [{ id: 456 }, { id: 789 }]
  );
});

test('colander(resolvers) passes root argument to child resolvers', t => {
  t.deepEqual(
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
});

test('c(propName, resolvers) returns null when extracted property is undefined', t => {
  t.deepEqual(
    colander(
      { username: c('uname') }
    )({ username: 'manuscriptmaster' }),
    { username: null }
  );
});

test('c(propName, resolvers) returns null when extracted property is undefined and ignores child resolvers', t => {
  t.deepEqual(
    colander({
      user: c('user', {
        id: c('id')
      })
    })({ currentUser: { id: 123 } }),
    { user: null }
  );
});

test('c(extract, resolvers) returns null when extracted property is undefined', t => {
  t.deepEqual(
    colander({ user: c(p => p.user) })({ currentUser: { id: 123 } }),
    { user: null }
  );
});

test('c(extract, resolvers) returns null when extracted property is undefined and ignores child resolvers', t => {
  t.deepEqual(
    colander({
      user: c(p => p.user, {
        id: c('id')
      })
    })({ currentUser: { id: 123 } }),
    { user: null }
  );
});
