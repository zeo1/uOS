import { $, local, h, render, iss, fuzzy_search, keymaps } from '../util'
import marked from 'marked'
marked.setOptions({ gfm: true, breaks: true })

let action = {
  select_up() {
    if (s.select > 0) s.select--
  },
  select_dn() {
    if (s.select < s.list.length - 1) s.select++
  },
  open() {
    if (!s.list.length) return action.create()
    let card = s.list[s.select]
    let name = card.tags.indexOf('kanban') === -1 ? 'note' : 'kanban'
    return ['open', name, s.list[s.select].$loki, ['query', s.query]]
  },
  create() {
    let c = local.insert({
      name: s.nameQuery,
      tags: s.tagsQuery.join(' '),
      timecost: '0:00',
      notion: ''
    })
    return ['open', 'note', c.$loki, ['query', s.query]]
  },
  focus() {
    $('#query').focus()
  },
  blur() {
    $('#query').blur()
  },
  open_today() {
    return ['k', 'today']
  }
}
let s = { select: 0 }
function open(sQuery) {
  s.query = sQuery
  s.nameQuery = sQuery
  s.tagsQuery = []
  let i = sQuery.indexOf('::')
  if (i >= 0) {
    s.nameQuery = sQuery.slice(i + 2)
    s.tagsQuery = sQuery.slice(0, i).split(' ')
  }
  s.list = local
    .where(c => s.tagsQuery.every(tag => c.tags && c.tags.indexOf(tag) != -1))
    .filter(v => fuzzy_search(s.nameQuery, v.name))
  view()
  action.focus()
}
function view() {
  let preview = 'no item found with: ' + s.query
  if (s.list.length) {
    let n = local.get(s.list[s.select].$loki).notion
    preview = iss(n) ? marked(n) : `<pre>${JSON.stringify(n, null, 2)}</pre>`
  }
  function click(i) {
    return e => {
      s.select = i
      view()
    }
  }
  render(
    h('div pa3 h-100', [
      'div flex white center shadow h-100',
      { maxWidth: 999 },
      [
        'div flex-auto br bw-1 b--dark-gray white tr overflow-hidden',
        [
          'input pa3 bg-dark-gray w-100 white b',
          { value: s.query, id: 'query', onChange }
        ],
        ...s.list.map((card, i) => {
          let color = i === s.select ? ' blue' : ''
          return [
            'div pa2' + color,
            { onClick: click(i), paddingRight: 20 },
            card.name
          ]
        })
      ],
      ['div overflow-scroll pa3', { width: 700, id: 'preview' }]
    ]),
    $('#r')
  )
  $('#preview').innerHTML = preview
}
function onChange() {
  let query = $('#query').value
  open(query)
  view()
}

export default { open, view, action }
