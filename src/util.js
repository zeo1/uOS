import u from 'lodash'

let c = console.log,
  $ = document.querySelector.bind(document),
  isa = u.isArray,
  iso = u.isPlainObject,
  iss = u.isString,
  isf = u.isFunction,
  each = u.each

export { c, $, isa, iso, iss, isf, each }
