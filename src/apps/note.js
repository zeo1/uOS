import { render } from 'react-dom'
import { h } from '../view'
import { $, dur_inc_sec } from '../util'
import { local } from '../data/local'
import CodeMirror from 'codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/gfm/gfm'
import 'codemirror/keymap/sublime'
import 'codemirror/theme/base16-dark.css'
import 'codemirror/addon/edit/continuelist'
import 'codemirror/addon/edit/closebrackets.js'
import 'codemirror/addon/selection/active-line.js'

let cancelEscOnce = 0
let action = {
  focus() {
    cm.focus()
  },
  blur() {
    document.activeElement.blur()
    cancelEscOnce = 1
    clearInterval(iInterval)
  },
  open_last() {
    if (cancelEscOnce === 1) cancelEscOnce = 0
    else {
      clearInterval(iInterval)
      return ['open', 'lastApp']
    }
  }
}
export default {
  view,
  open,
  action,
  nmap: {
    i: ['focus'],
    esc: ['open_last']
  },
  imap: {
    esc: ['blur']
  }
}

let card, cm, iInterval

function startTimer() {
  console.log('timer:', card.name)
  clearInterval(iInterval)
  iInterval = setInterval(function() {
    $('#timecost').innerText = card.timecost = dur_inc_sec(card.timecost)
    console.log('timer update')
    local.update(card)
  }, 1000)
}
function view() {}
function open(id) {
  console.log('open', card)
  let card2 = local.findOne({ $loki: id })
  card = local.get(id)
  console.log(card.name, card2.name)
  function onChange() {
    card.name = $('#name').value
    console.log('load update')
    local.update(card)
  }
  render(
    h('div pa3 h-100', [
      'div shadow border-box h-100 relative flex flex-column',
      { width: '37em', margin: 'auto' },
      [
        'div flex',
        {},
        [
          'input bg-transparent white b pa2 w-100',
          { id: 'name', onChange, defaultValue: card.name }
        ],
        ['div red pa2', { id: 'timecost' }, card.timecost]
      ],
      ['textarea', { defaultValue: card.notion }]
    ]),
    document.getElementById('root')
  )
  cm = CodeMirror.fromTextArea($('textarea'), {
    mode: 'gfm',
    keyMap: 'sublime',
    theme: 'base16-dark',
    lineWrapping: true,
    autoCloseBrackets: true,
    styleActiveLine: true,
    indentWithTabs: false,
    autofocus: true
  })
  cm.setOption('extraKeys', {
    Enter: CodeMirror.commands.newlineAndIndentContinueMarkdownList,
    Tab: CodeMirror.commands.indentMore,
    Esc: action.blur,
    'Cmd-U': toggleUnorderedList
  })
  if (card.cursor) cm.setCursor(card.cursor)
  cm.on('change', e => {
    card.notion = cm.getValue()
    card.cursor = cm.getCursor()
    console.log('on change update')
    local.update(card)
  })
  cm.on('focus', startTimer)
}

function toggleUnorderedList() {
  let start = cm.getCursor('from')
  let end = cm.getCursor('to')
  let regexp = /^(\s{0,})((\+|\*|\-)\s?)/
  let isList, match
  for (let i = start.line; i <= end.line; i++) {
    let line = cm.getLine(i)
    // Is this an ordered list ?
    if ((match = /^(\s?)(([0-9]+\.)\s+)/.exec(line))) {
      cm.replaceRange('', { line: i, ch: 0 }, { line: i, ch: match[0].length })
      line = line.substr(match[0].length)
    }
    // Is unodered list ?
    if (!match) isList = regexp.test(line)
    if (isList) {
      if ((match = regexp.exec(line))) {
        cm.replaceRange(
          '',
          { line: i, ch: 0 },
          { line: i, ch: match[0].length }
        )
      }
    } else {
      cm.replaceRange(
        '- ' + line.trim(),
        { line: i, ch: 0 },
        { line: i, ch: line.length }
      )
    }
  }
}