import { Board } from 'react-trello'
import {
  isi,
  iss,
  local,
  render,
  h,
  $,
  dur_inc_sec,
  dur_add_str,
  moment,
  keymaps
} from '../util'
let lanes,
  kanban,
  iInterval,
  iLane = 0,
  iCard = 0,
  lastApp,
  date
function open(date, last) {
  if (iss(date)) {
    kanban = local.findOne({
      name: date,
      tags: 'kanban'
    })
    if (!kanban) {
      kanban = {
        name: date,
        tags: 'kanban',
        notion: [
          { title: 'Energy', cards: [] },
          { title: 'Think', cards: [] },
          { title: 'Do', cards: [] },
          { title: 'Grow', cards: [] }
        ]
      }
      local.insert(kanban)
    }
  } else if (isi(date)) {
    kanban = local.findOne({ $loki: date })
  } else return console.log('date is not string or id: ', date)

  if (last) lastApp = last
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
}
let action = {
  next_day() {
    let next = moment(kanban.name)
      .add(1, 'd')
      .format('Y-MM-DD')
    return ['open', 'kanban', next]
  },
  last_day() {
    let last = moment(kanban.name)
      .subtract(1, 'd')
      .format('Y-MM-DD')
    return ['open', 'kanban', last]
  },
  open_last() {
    return ['open', ...lastApp]
  },
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
  startTimer(id) {
    id = id || 'timecost'
    clearInterval(iInterval)
    let card = lanes[iLane].cards[iCard]
    iInterval = setInterval(function() {
      $('#' + id + card.$loki).value = card.timecost = dur_inc_sec(
        card.timecost
      )
      local.update(card)
      view()
    }, 1000)
  }
}
function focus_curent_card() {
  action.startTimer()
  $('#name' + lanes[iLane].cards[iCard].$loki).focus()
}

function view(focus) {
  if (!lanes) return
  function onIdleChange() {
    kanban.timeidle = $('#timeidle').value
    local.update(kanban)
    view()
  }
  let totolTime = lanes.reduce(
    (a, l) =>
      dur_add_str(
        a,
        l.cards.reduce((a, c) => dur_add_str(c.timecost, a), '0:0')
      ),
    '0:0'
  )
  render(
    h(
      'div flex flex-column justify-between h-100',
      [
        Board,
        {
          onDataChange: action.save,
          data: { lanes },
          backgroundColor: 'transparent',
          width: '100%',
          margin: 'auto',
          cardDraggable: true,
          customLaneHeader: h(CustomHead),
          customCardLayout: true
        },
        [CustomCard]
      ],
      [
        'div flex center',
        ['div gray b ma2', moment(kanban.name).format('Y-MM-DD ddd')],
        ['div ma2 moon-gray', totolTime]
      ]
    ),
    $('#r')
  )
  if (focus) focus_curent_card()
  action.save()
  local.update(kanban)
}
function CustomHead(p) {
  let totol = p.cards.reduce((a, c) => dur_add_str(c.timecost, a), '0:0')
  let width = window.innerWidth / 4 - 42
  if (width < 250) width = 250
  return h('div b flex justify-between', { width }, p.id, ['div', totol])
}
function CustomCard(props) {
  let width = window.innerWidth / 4 - 42
  if (width < 250) width = 250
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
  return h('div bg-near-black', { width }, [
    'header flex',
    [
      'input w-100 pv1 outline-0 moon-gray b bg-transparent bn',
      {
        id: 'name' + props.$loki,
        onFocus: onClick,
        onChange: change('name'),
        value: props.name
      }
    ],
    [
      'input pv1 outline-0 b bg-transparent bn tr ' + color,
      {
        width: 64,
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

export default { action, view, open }
