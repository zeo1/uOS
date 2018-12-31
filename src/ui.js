import { each } from 'lodash'
import { isa } from './util'

let modAbbr = { acms: 'H', cms: 'A', ams: 'C', acs: 'M', acm: 'S' }
let keyAbbr = {
  bsp: 8,
  tab: 9,
  ret: 13,
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
  let kmap = document.activeElement === document.body ? app.nmap : app.imap
  if (!kmap || !app.action) return
  let command = kmap[abbr]
  if (!command || !isa(command)) return
  e.preventDefault()
  app.action[command[0]](...command.slice(1))
  app.view()
}

let app
export function load(component) {
  app = component
  app.view()
}
