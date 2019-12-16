# Colander

Given a declarative resolver and a JSON payload, return a new payload whose shape is identical to the structure of the resolver:
```js
const { colander, c } = require('colanderjs');
const { truncate } = require('./utils/truncate');

// c((parent, root) => child, resolvers) locates child from parent
// and resolves child to shape of resolver.
// colander(extractFromPayload?, resolvers)(json) is a top-level version of c.
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

APIs often return a payload you need to traverse prior to parsing. You can pass this "extractor" function as the first argument to the top-level `colander`, which also sets `root` to the result of the extraction:

```js
const parseAuthors = colander(payload => payload.response.authors, [{
  name: c('fullName'),
  group: c('memberOf')
  ...
}]);
```