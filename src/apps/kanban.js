import { render } from 'react-dom'
import { Board } from 'react-trello'
import { h } from '../view'
import { $, dur_inc_sec } from '../util'
import { local } from '../data/local'

let lanes,
  kanban,
  iInterval,
  iLane = 0,
  iCard = 0
function open(id) {
  kanban = local.findOne({
    name: new Date().toJSON().slice(0, 10),
    tags: 'kanban'
  })
  if (!kanban) {
    kanban = {
      name: new Date().toJSON().slice(0, 10),
      tags: 'kanban',
      notion: [
        { title: 'Inbox', cards: [] },
        { title: 'Next', cards: [] },
        { title: 'Log', cards: [] },
        { title: 'Review', cards: [] }
      ]
    }
    local.insert(kanban)
  }
  if (kanban.iCard) {
    iLane = kanban.iLane
    iCard = kanban.iCard
  }
  lanes = kanban.notion.map(({ title, cards }) => {
    return {
      title,
      id: title,
      cards: cards.map(c => {
        let r = local.get(c)
        r.id = r.$loki + ''
        return r
      })
    }
  })
  view(kanban.iCard)
}
function close() {
  clearInterval(iInterval)
  kanban.iCard = iCard
  kanban.iLane = iLane
  local.update(kanban)
  debugger
}
let imap = {
  up: ['focus_up', 1],
  dn: ['focus_dn', 1],
  mup: ['focus_lft', 1],
  mdn: ['focus_rit', 1],
  esc: ['blur'],
  ent: ['open_note']
}
let nmap = {
  ent: ['open_note'],
  a: ['add'],
  r: ['rm'],
  s: ['mv_lft'],
  d: ['mv_rit'],
  t: ['mv_rit'],
  w: ['mv_up'],
  e: ['mv_dn'],
  i: ['focus'],
  up: ['focus_up'],
  dn: ['focus_dn'],
  lft: ['focus_lft'],
  rit: ['focus_rit']
}
let action = {
  open_note() {
    close()
    return [
      'open',
      'note',
      lanes[iLane].cards[iCard].$loki,
      ['kanban', kanban.name]
    ]
  },
  blur() {
    document.activeElement.blur()
    clearInterval(iInterval)
  },
  focus: focus_curent_card,
  add() {
    let c = local.insert({ name: '', timecost: '0:00', notion: '', tags: '' })
    c.id = c.$loki + ''
    c.laneId = lanes[iLane].id
    lanes[iLane].cards.unshift(c)
    action.save()
    iCard = 0
    view(1)
  },
  rm() {
    let cards = lanes[iLane].cards
    let c = cards[iCard]
    cards.splice(iCard, 1)
    if (iCard == cards.length) iCard--
    if (iCard < 0) iCard = 0
    if (!iCard.notion) local.remove(c)
  },
  focus_up(b) {
    if (iCard > 0) {
      iCard--
      if (b) focus_curent_card()
    }
  },
  focus_dn(b) {
    if (iCard + 1 < lanes[iLane].cards.length) {
      iCard++
      if (b) focus_curent_card()
    }
  },
  focus_lft(b) {
    if (iLane > 0) iLane--
    else iLane = lanes.length - 1
    let max = lanes[iLane].cards.length - 1
    if (iCard > max) iCard = max
    if (b) focus_curent_card()
  },
  focus_rit(b) {
    if (++iLane === lanes.length) iLane = 0
    let max = lanes[iLane].cards.length - 1
    if (iCard > max) iCard = max
    if (b) focus_curent_card()
  },
  mv_lft() {
    let cards = lanes[iLane].cards
    let c = cards[iCard]
    cards.splice(iCard, 1)
    if (--iLane < 0) iLane = lanes.length - 1
    c.laneId = lanes[iLane].id
    lanes[iLane].cards.unshift(c)
    iCard = 0
  },
  mv_rit() {
    let cards = lanes[iLane].cards
    let c = cards[iCard]
    cards.splice(iCard, 1)
    if (++iLane === lanes.length) iLane = 0
    c.laneId = lanes[iLane].id
    lanes[iLane].cards.unshift(c)
    iCard = 0
  },
  mv_up() {
    if (iCard > 0) {
      let A = lanes[iLane].cards
      A[iCard] = A.splice(iCard - 1, 1, A[iCard])[0]
      iCard--
    }
  },
  mv_dn() {
    if (iCard + 1 < lanes[iLane].cards.length) {
      let A = lanes[iLane].cards
      A[iCard] = A.splice(iCard + 1, 1, A[iCard])[0]
      iCard++
    }
  },
  save(data) {
    if (data) lanes = data.lanes
    kanban.notion = lanes.map((l, i) => ({
      cards: l.cards.map(c => c.$loki),
      title: l.title
    }))
  },
  startTimer() {
    clearInterval(iInterval)
    let card = lanes[iLane].cards[iCard]
    iInterval = setInterval(function() {
      $('#timecost' + card.$loki).value = card.timecost = dur_inc_sec(
        card.timecost
      )
      local.update(card)
    }, 1000)
  }
}
function focus_curent_card() {
  action.startTimer()
  $('#name' + lanes[iLane].cards[iCard].$loki).focus()
}

function view(focus) {
  if (!lanes) return
  render(
    h(
      Board,
      {
        onDataChange: action.save,
        data: { lanes },
        backgroundColor: 'transparent',
        width: 1290,
        margin: 'auto',
        draggable: true,
        customCardLayout: true
      },
      [CustomCard]
    ),
    $('#root')
  )
  if (focus) focus_curent_card()
  action.save()
  local.update(kanban)
}
function CustomCard(props) {
  function find_card() {
    let lane = lanes.find(l => l.id === props.laneId)
    return lane.cards[props.index]
  }
  function change(key) {
    return e => {
      let card = find_card()
      card[key] = $('#' + key + props.$loki).value
      local.update(card)
      view()
    }
  }
  function onClick() {
    iLane = lanes.findIndex(l => l.id === props.laneId)
    iCard = props.index
    action.startTimer()
    view()
  }
  function isSelect() {
    return props.index === iCard && props.laneId === lanes[iLane].id
  }
  let color = isSelect() ? 'red' : 'moon-gray'
  return h('div bg-near-black w-100', [
    'header flex justify-between',
    [
      'input pv1 outline-0 moon-gray b bg-transparent bn w-100',
      {
        id: 'name' + props.$loki,
        onFocus: onClick,
        onChange: change('name'),
        value: props.name
      }
    ],
    [
      'input pv1 outline-0 b bg-transparent bn w-20 tr ' + color,
      {
        id: 'timecost' + props.$loki,
        onChange: change('timecost'),
        onFocus() {
          clearInterval(iInterval)
        },
        value: props.timecost
      }
    ]
  ])
}

export default { imap, nmap, action, view, open }
