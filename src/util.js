import u from 'lodash'
import { render } from 'react-dom'
import { h } from './view'
import { local } from './data/local'
import parse from './data/parse'
import moment from 'moment'

let c = console.log,
  $ = document.querySelector.bind(document),
  isa = u.isArray,
  iso = u.isPlainObject,
  iss = u.isString,
  isf = u.isFunction,
  isi = u.isInteger,
  each = u.each,
  map = u.map

export {
  moment,
  h,
  render,
  local,
  parse,
  c,
  $,
  isa,
  iso,
  iss,
  isf,
  isi,
  each,
  map,
  dur_inc_sec,
  fuzzy_search
}

function dur_inc_sec(sTime, seconds) {
  let iTime = +sTime
  if (isNaN(iTime)) {
    let [min, sec] = sTime.split(':')
    iTime = min * 60 + sec * 1
  }
  if (iTime > 60 * 999) return
  iTime += seconds || 1
  let sec = ('0' + (iTime % 60)).slice(-2)
  let min = Math.floor(iTime / 60)
  return min + ':' + sec
}
function fuzzy_search(s, str) {
  let i = 0,
    n = -1,
    l
  for (; (l = s[i++]); ) if (!~(n = str.indexOf(l, n + 1))) return false
  return true
}
