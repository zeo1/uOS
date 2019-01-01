import { each } from 'lodash'
import { isa } from './util'
import apps from './apps'

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
  action.key(abbr, e)
}

let app, lastApp
let action = {
  open(name, ...args) {
    if (name === 'lastApp') {
      let a = app
      app = lastApp
      lastApp = a
    } else {
      if (app) lastApp = app
      app = apps[name]
    }
    if (app.open) app.open(...args)
    app.view()
  },
  key(abbr, e) {
    let kmap = document.activeElement === document.body ? app.nmap : app.imap
    if (!kmap) return
    let command = kmap[abbr]
    if (!command || !isa(command)) return
    if (e) e.preventDefault()
    action.cmd(command)
  },
  cmd([name, ...args]) {
    let cmd = app.action[name] || action[name]
    if (!cmd) return
    let r = cmd(...args)
    if (isa(r)) ui(...r)
    else app.view()
  }
}

export default function ui(name, ...args) {
  action[name](...args)
}
