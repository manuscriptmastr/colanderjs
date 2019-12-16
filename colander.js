if (!Object.hasOwnProperty('fromEntries')) { Object.fromEntries = require('object.fromentries') };

const mapValues = (transform, object) =>
  Object.fromEntries(Object.entries(object)
    .map(([key, value]) => [key, transform(value)]));

const get = (key) => (data) =>
  typeof data === 'object' && data !== null && data.hasOwnProperty(key)
    ? data[key]
    : null;

const toGetter = (extract) =>
  typeof extract === 'string'
    ? get(extract)
    : extract;

const toResolver = (valueOrFunc) =>
  typeof valueOrFunc === 'function'
    ? valueOrFunc
    : () => valueOrFunc;

const c = (extract, children) => (data, root) => {
  const newData = toGetter(extract)(data, root);
  return (newData === undefined || newData === null) ?
      null
  : children === undefined ?
      newData
  : Array.isArray(children) ?
      newData.map(d => c(d => d, children[0])(d, root))
  :
      mapValues(child => toResolver(child)(newData, root), children);
};

const colander = (...args) => (data) => {
  let extract;
  let resolvers;

  if (args.length === 2) {
    extract = args[0];
    resolvers = args[1];
  } else {
    extract = data => data;
    resolvers = args[0];
  }

  return c(extract, resolvers)(data, data);
};

module.exports = { colander, c };
