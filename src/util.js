import u from 'lodash'
import moment from 'moment'

let c = console.log,
  $ = document.querySelector.bind(document),
  isa = u.isArray,
  iso = u.isPlainObject,
  iss = u.isString,
  isf = u.isFunction,
  each = u.each

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

export { c, $, isa, iso, iss, isf, each, dur_inc_sec }
