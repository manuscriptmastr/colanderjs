# colanderjs

Declarative JSON parser.

Most payloads aren't exactly what you need for your application, but manual parser functions can be large, tricky to write, and brittle.

`colanderjs` is a declarative solution loosely inspired by [GraphQL](https://graphql.org/) that makes it trivial to reshape a JSON object into exactly what you need. The shape you define is the shape you get:

```js
import fetch from 'node-fetch';
import colander, { c } from 'colanderjs';
import truncate from './utils/truncate';

const parseWorksByAuthor = colander({
  author: c('user', {
    name: c('fullName'),
    pseudonym: c('username'),
    works: c('books', [{
      title: c('title'),
      summary: c(book => truncate(book.text, 1, 'sentence'))
    }])
  })
});

fetch('/api/books/tolkien')
  .then(data => data.json())
  .then(parseWorksByAuthor);
// {
//   author: {
//     name: 'J. R. R. Tolkien',
//     pseudonym: 'Oxymore',
//     works: [
//       {
//         title: 'The Hobbit',
//         summary: 'In a hole in the ground there lived a hobbit.'
//       },
//       ...
//     ]
//   }
// }
```

The original payload `root` is passed as a second argument to [`c`](https://github.com/manuscriptmastr/colanderjs#c) in case you need to refer back to information from original json:

```js
import fetch from 'node-fetch';
import colander, { c } from 'colanderjs';

const parseAuthors = colander({
  author: c(data => data.authors.find(a => a.username === 'Oxymore'), {
    name: c('fullName'),
    group: c((author, root) => root.groups.find(g => g.id === author.groupId), {
      name: c('name')
    })
  })
});

fetch('/api/authors')
  .then(data => data.json())
  .then(parseAuthors);
// {
//   author: {
//     name: 'J. R. R. Tolkien',
//     group: {
//       name: 'Inklings'
//     }
//   }
// }
```

APIs often return a payload you need to traverse prior to parsing. You can pass an extractor function as the first argument to the top-level [`colander`](https://github.com/manuscriptmastr/colanderjs#colander), which also sets `root` to the result of the extraction:

```js
const parseAuthors = colander(payload => payload.response.authors, [{
  name: c('fullName'),
  group: c('memberOf')
}]);
```

## API

### `colander`

Top-level alias for [`c`](https://github.com/manuscriptmastr/colanderjs#c).
```js
colander({ name: u => u.fullName, group: u => u.memberOf })({ fullName: 'Joshua Martin', memberOf: 'nerds' });
colander([{ name: u => u.fullName, group: u => u.memberOf }])([{ fullName: 'Joshua Martin', memberOf: 'nerds' }, { fullName: 'John Doe', memberOf: 'geeks' }]);
colander(payload => payload.user, { name: u => u.fullName, group: u => u.memberOf })({ fullName: 'Joshua Martin', memberOf: 'nerds' });
```

### `c`

```js
c('name')({ name: 'Joshua Martin' });
c('user', { name: u => u.name })({ user: { name: 'Joshua Martin', random: 'yeet' } });
c('users', [{ name: u => u.name }])({ users: [{ name: 'Joshua Martin' }, { name: 'John Doe' }] });
c((users, root) => users, [{ name: u => u.name }])([{ name: 'Joshua Martin' }, { name: 'John Doe' }]);
```

## CommonJS
```js
const { colander, c } = require('colanderjs');
```
