import map from 'ramda/src/map.js';

/**
 * @typedef {(Object | Array)} Resolvers
 * @typedef {(parent: any, root?: any) => any} Extractor
 */

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

/**
 * Returns data from `extract` and either returns or passes on to `resolvers`
 * @param {(string | Extractor)} extract
 * @param {Resolvers} resolvers
 * @example
 * c('username')({ username: 'manuscriptmaster' });
 * // => 'manuscriptmaster'
 * c(data => data.username)({ username: 'manuscriptmaster' });
 * // => 'manuscriptmaster'
 * c('user', { id: c('id'), username: c('name') })({ user: { id: 1, name: 'manuscriptmaster' } });
 * // => { id: 1, username: 'manuscriptmaster' }
 */
export const c = (extract, resolvers) => (data, root) => {
  const newData = toGetter(extract)(data, root);
  return (newData === undefined || newData === null) ?
      null
  : resolvers === undefined ?
      newData
  : Array.isArray(resolvers) ?
      newData.map(d => c(d => d, resolvers[0])(d, root))
  :
      map(child => toResolver(child)(newData, root), resolvers);
};

/**
 * Top-level alias of `c`
 * @param  {([Resolvers] | [Extractor, Resolvers])} args
 */
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

export default colander;
