# ParseJS: Declarative JSON parsing

Given a declarative resolver and a JSON payload, return a new payload whose shape is identical to the structure of the resolver:
```js
const { parse, p } = require('parsejs');
const { truncate } = require('./utils/truncate');

// p((parent, root) => child, resolvers) locates child from parent
// and resolves child to shape of resolver.
// parse(extractFromPayload?, resolvers)(json) is a top-level version of p.
const parseWorksByAuthor = parse({
  author: p('user', {
    name: p('fullName'),
    pseudonym: p('username'),
    works: p('books', [{
      title: p('title'),
      summary: p(book => truncate(book.text, 1, 'sentence'))
    }])
  })
});

fetch('/api/books/tolkien')
  .then(data => data.json())
  .then(parseWorksByAuthor);

// returns:

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
The original payload `root` is passed as a second argument in case you need to refer to information elsewhere in the tree structure:

```js
const parseAuthors = parse({
  author: p(data => data.authors.find(a => a.username === 'Oxymore'), {
    name: p('fullName'),
    group: p((author, root) => root.groups.find(g => g.id === author.groupId), {
      name: p('name')
    })
  })
});

fetch('/api/authors')
  .then(data => data.json())
  .then(parseAuthors);

// returns:

// {
//   author: {
//     name: 'J. R. R. Tolkien',
//     group: {
//       name: 'Inklings'
//     }
//   }
// }
```

APIs often return a payload you need to traverse prior to parsing. You can pass this "extractor" function as the first argument to the top-level `parse`, which also sets `root` to the result of the extraction:

```js
const parseAuthors = parse(payload => payload.response.authors, [{
  name: p('fullName'),
  group: p('memberOf')
  ...
}]);
```