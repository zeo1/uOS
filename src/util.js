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
  dur_add_str,
  fuzzy_search
}

function dur_from_str(sTime) {
  let arr = sTime.split(':')
  let sec = arr.pop()
  let min = arr.pop() || 0
  let hour = arr.pop() || 0
  return hour * 3600 + min * 60 + sec * 1
}
function dur_to_str(iTime) {
  let hour = Math.floor(iTime / 3600)
  let min = Math.floor((iTime - hour * 3600) / 60)
  let sec = ('0' + (iTime % 60)).slice(-2)
  if (hour) {
    min = ('0' + min).slice(-2)
    hour += ':'
  }
  return hour + min + ':' + sec
}
function dur_inc_sec(sTime, seconds) {
  let iTime = +sTime
  if (isNaN(iTime)) iTime = dur_from_str(sTime)
  iTime += seconds || 1
  return dur_to_str(iTime)
}
function dur_add_str(a, b) {
  let iTime = dur_from_str(a) + dur_from_str(b)
  return dur_to_str(iTime)
}
function fuzzy_search(s, str) {
  let i = 0,
    n = -1,
    l
  for (; (l = s[i++]); ) if (!~(n = str.indexOf(l, n + 1))) return false
  return true
}
