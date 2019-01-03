import { each } from '../util'
import ui from './ui'

let modAbbr = { acms: 'H', cms: 'A', ams: 'C', acs: 'M', acm: 'S' }
let keyAbbr = {
  bsp: 8,
  tab: 9,
  ent: 13,
  esc: 27,
  spc: 32,
  lft: 37,
  up: 38,
  rit: 39,
  dn: 40,
  del: 46,
  hom: 36,
  end: 35,
  pup: 33,
  pdn: 34
}
each(keyAbbr, (val, key) => (keyAbbr[val] = key))

function event2abbr(e) {
  let abbr = ''
  if (e.altKey) abbr += 'a'
  if (e.ctrlKey) abbr += 'c'
  if (e.metaKey) abbr += 'm'
  if (e.shiftKey) abbr += 's'
  return (modAbbr[abbr] || abbr) + (keyAbbr[e.which] || e.key.toLowerCase())
}

onkeydown = e => {
  let abbr = event2abbr(e)
  console.log(abbr)
  ui('key', abbr, e)
}
