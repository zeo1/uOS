import u from 'lodash'
import { render } from 'react-dom'
import { h } from './view'
import { local, keymaps } from './data/local'
import moment from 'moment'

let c = console.log,
  $ = document.querySelector.bind(document),
  isa = u.isArray,
  iso = u.isPlainObject,
  iss = u.isString,
  isf = u.isFunction,
  isi = u.isInteger,
  each = u.each,
  map = u.map,
  keys = Object.keys

export {
  moment,
  h,
  render,
  local,
  keymaps,
  c,
  $,
  isa,
  iso,
  iss,
  isf,
  isi,
  each,
  map,
  keys,
  dur_inc_sec,
  dur_add_ms,
  fuzzy_search
}

function dur_from_ms(sTime) {
  let [min, sec] = sTime.split(':')
  return min * 60 + sec * 1
}
function dur_to_ms(iTime) {
  let sec = ('0' + (iTime % 60)).slice(-2)
  let min = Math.floor(iTime / 60)
  return min + ':' + sec
}
function dur_inc_sec(sTime, seconds) {
  let iTime = +sTime
  if (isNaN(iTime)) iTime = dur_from_ms(sTime)
  if (iTime > 60 * 999) return
  iTime += seconds || 1
  return dur_to_ms(iTime)
}
function dur_add_ms(a, b) {
  let iTime = dur_from_ms(a) + dur_from_ms(b)
  return dur_to_ms(iTime)
}
function fuzzy_search(s, str) {
  let i = 0,
    n = -1,
    l
  for (; (l = s[i++]); ) if (!~(n = str.indexOf(l, n + 1))) return false
  return true
}
