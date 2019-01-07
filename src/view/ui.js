import { isa, each, map, h, render, $, keymaps } from '../util'
import apps from '../apps'

render(
  h(
    'div h-100',
    ['div h-100 fixed top-0 left-0 o-80 z-1', { id: 'l' }],
    ['div h-100', { id: 'r' }]
  ),
  $('#root')
)

let app, lastOpen, currentOpen, kmap
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
    if (app && app.close) app.close()
    app = apps[name]
    if (app.open) app.open(...args)
  },
  kmap(name) {
    kmap = keymaps[name]
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
    let active = document.activeElement !== document.body
    if (!kmap) kmap = active ? app.imap : app.nmap
    if (!kmap) return console.log('no kmap')
    let command = kmap[abbr]
    if (!command)
      command = active ? keymaps.global_imap[abbr] : keymaps.global_nmap[abbr]
    kmap = null
    render(h('div'), $('#l'))
    if (!command || !isa(command)) return
    if (e) e.preventDefault()
    action.cmd(command)
  },
  cmd([name, ...args]) {
    let cmd = app.action[name] || action[name]
    if (!cmd) return console.log('no cmd: ', name)
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
    return ['open', 'kanban', date]
  }
}

export default function ui(name, ...args) {
  action[name](...args)
}
