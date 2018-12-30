import { render } from 'react-dom'
import { Board } from 'react-trello'
import { h } from '../view'
import { $ } from '../util'
// delete localStorage.kanbanLanes
let iInterval,
  iLane = 0,
  iCard = 0,
  lanes = localStorage.kanbanLanes
    ? JSON.parse(localStorage.kanbanLanes)
    : ['Inbox', 'Next', 'Log', 'Reflect'].map((title, id) => ({
        id: id + '',
        title,
        cards: [{ id: id + '', name: 'card ' + id, timer: '0:00' }]
      }))
let imap = {
  up: ['focus_up', 1],
  dn: ['focus_dn', 1],
  mup: ['focus_lft', 1],
  mdn: ['focus_rit', 1],
  esc: ['blur']
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
  blur() {
    document.activeElement.blur()
    clearInterval(iInterval)
  },
  focus: focus_curent_card,
  add() {
    let id = Date.now() + ''
    lanes[iLane].cards.unshift({
      id,
      laneId: lanes[iLane].id,
      name: '',
      timer: '0:00'
    })
    view()
    iCard = 0
    focus_curent_card()
  },
  rm() {
    lanes[iLane].cards.splice(iCard, 1)
    if ((iCard = lanes[iLane].cards.length)) iCard--
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
    let card = lanes[iLane].cards[iCard]
    action.rm()
    if (--iLane < 0) iLane = lanes.length - 1
    card.laneId = lanes[iLane].id
    lanes[iLane].cards.unshift(card)
    iCard = 0
  },
  mv_rit() {
    let card = lanes[iLane].cards[iCard]
    action.rm()
    if (++iLane === lanes.length) iLane = 0
    card.laneId = lanes[iLane].id
    lanes[iLane].cards.unshift(card)
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
    localStorage.kanbanLanes = JSON.stringify(lanes)
  },
  startTimer() {
    let card = lanes[iLane].cards[iCard]
    let [min, sec] = card.timer.split(':')
    let time = min * 60 + sec * 1
    clearInterval(iInterval)
    if (isNaN(time) || time > 9960) return
    iInterval = setInterval(function() {
      time++
      let sec = ('0' + (time % 60)).slice(-2)
      let min = Math.floor(time / 60)
      $('#timer' + card.id).value = card.timer = min + ':' + sec
      action.save()
    }, 1000)
  }
}
function focus_curent_card() {
  action.startTimer()
  $('#name' + lanes[iLane].cards[iCard].id).focus()
}

function view() {
  action.save()
  render(
    h(
      Board,
      {
        onDataChange: action.save,
        data: { lanes },
        backgroundColor: 'transparent',
        width: 1280,
        margin: 'auto',
        draggable: true,
        customCardLayout: true
      },
      [CustomCard]
    ),
    $('#root')
  )
}
function CustomCard(props) {
  function find_card() {
    let lane = lanes.find(l => l.id === props.laneId)
    return lane.cards[props.index]
  }
  function change(key) {
    return e => {
      find_card()[key] = $('#' + key + props.id).value
      action.save()
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
  return h('div bg-near-black w-100', { onClick }, [
    'header flex justify-between',
    [
      'input pv1 outline-0 moon-gray b bg-transparent bn w-100',
      {
        id: 'name' + props.id,
        onFocus: onClick,
        onChange: change('name'),
        defaultValue: props.name
      }
    ],
    [
      'input pv1 outline-0 b bg-transparent bn w-20 tr ' + color,
      {
        id: 'timer' + props.id,
        onChange: change('timer'),
        onFocus() {
          clearInterval(iInterval)
        },
        defaultValue: props.timer
      }
    ]
  ])
}

export default { imap, nmap, action, view }
// import { load } from '/src/ui'
// load({ kmap,  action, view })
