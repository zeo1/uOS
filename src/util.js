import u from 'lodash'

let $ = document.querySelector.bind(document),
  c = console.log,
  isa = u.isArray,
  iso = u.isPlainObject,
  iss = u.isString,
  isf = u.isFunction

export { $, iso, isa, iss, isf, c }
