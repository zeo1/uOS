import { render } from 'react-dom'
import { Board } from 'react-trello'
import { ui, h } from '../view'
import { $ } from '../util'
import load from '../data/load'

let lanes,
  local,
  kanban,
  iInterval,
  iLane = 0,
  iCard = 0
function open(id) {
  load(l => {
    local = l
    kanban = l.findOne({
      name: new Date().toJSON().slice(0, 10),
      tags: 'kanban'
    })
    if (kanban.iCard) {
      iLane = kanban.iLane
      iCard = kanban.iCard
    }
    lanes = kanban.notion.map(({ title, cards }) => {
      return {
        title,
        id: title,
        cards: cards.map(c => {
          let r = l.get(c)
          r.id = r.$loki + ''
          return r
        })
      }
    })
    view()
  })
}
function close() {
  kanban.iCard = iCard
  kanban.iLane = iLane
  local.update(kanban)
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
    ui('open', 'note', lanes[iLane].cards[iCard].$loki)
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
    let card = lanes[iLane].cards[iCard]
    if (card.timecost) {
      let [min, sec] = card.timecost.split(':')
      var time = min * 60 + sec * 1
    } else {
      var time = 0
    }
    clearInterval(iInterval)
    if (isNaN(time) || time > 60 * 999) return
    iInterval = setInterval(function() {
      time++
      let sec = ('0' + (time % 60)).slice(-2)
      let min = Math.floor(time / 60)
      $('#timecost' + card.$loki).value = card.timecost = min + ':' + sec
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
        defaultValue: props.name
      }
    ],
    [
      'input pv1 outline-0 b bg-transparent bn w-20 tr ' + color,
      {
        id: 'timecost' + props.$loki,
        onChange: change('timecost'),
        onFocus() {
          console.log('focus')
          clearInterval(iInterval)
        },
        defaultValue: props.timecost
      }
    ]
  ])
}

export default { imap, nmap, action, view, open }
