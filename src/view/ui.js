import { isa, each, map, h, render, $, parse } from '../util'
import apps from '../apps'

render(
  h('div h-100', ['div h-100 fl', { id: 'l' }], ['div h-100', { id: 'r' }]),
  $('#root')
)

let sKeymap = `
m q keymap::
t d today
k q kanban::
q q
b q b
`

let app,
  lastOpen,
  currentOpen,
  kmap,
  global_kmap = parse.keymap(sKeymap)

let action = {
  open(name, ...args) {
    if (name !== 'lastApp') {
      lastOpen = currentOpen
      currentOpen = [name, args]
    } else {
      var [name, args] = lastOpen
      let a = currentOpen
      currentOpen = lastOpen
      lastOpen = a
    }
    app = apps[name]
    if (app.open) app.open(...args)
  },
  kmap(km) {
    kmap = km
    render(
      h('div flex flex-column justify-center h-100', [
        'table pa2 bg-dark-gray',
        [
          'tbody',
          { fontFamily: 'monaco' },
          ...map(kmap, (val, key) => [
            'tr',
            ['td red pa1 tr', key],
            [
              'td pa1 mw5 nowrap overflow-hidden',
              { title: val.join(' ') },
              val.join(' ')
            ]
          ])
        ]
      ]),
      $('#l')
    )
  },
  key(abbr, e) {
    if (!kmap)
      kmap = document.activeElement === document.body ? app.nmap : app.imap
    if (!kmap) return console.log('no kmap')
    let command = kmap[abbr] || global_kmap[abbr]
    if (!command || !isa(command)) return
    if (e) e.preventDefault()
    action.cmd(command)
  },
  cmd([name, ...args]) {
    let cmd = app.action[name] || action[name]
    if (!cmd) return console.log('no cmd: ', name)
    kmap = 0
    render(h('div'), $('#l'))
    let r = cmd(...args)
    if (isa(r)) ui(...r)
    else r = app.view()
    if (r && r.props && r._store) render(r, $('#r'))
  },
  q(query) {
    return ['open', 'query', query || '']
  },
  d(date) {
    if (date === 'today') date = new Date().toJSON().slice(0, 10)
    return ['open', kanban, date]
  }
}

export default function ui(name, ...args) {
  action[name](...args)
}
