import { render } from 'react-dom'
import { h } from '../view'
import { $, dur_inc_sec } from '../util'
import { local, update_keymaps } from '../data/local'
import CodeMirror from 'codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/gfm/gfm'
import 'codemirror/keymap/sublime'
import 'codemirror/theme/base16-dark.css'
import 'codemirror/addon/edit/continuelist'
import 'codemirror/addon/edit/closebrackets.js'
import 'codemirror/addon/selection/active-line.js'

let cancelEscOnce = 0
let card, cm, iInterval, lastApp
let action = {
  focus(id) {
    if (id) $(id).focus()
    else cm.focus()
  },
  blur() {
    let el = document.activeElement
    el.blur()
    clearInterval(iInterval)
    if (el.nodeName === 'TEXTAREA') {
      cancelEscOnce = 1
      card.cursor = cm.getCursor()
      local.update(card)
    }
  },
  open_last() {
    if (cancelEscOnce === 1) cancelEscOnce = 0
    else return ['open', ...lastApp]
  },
  toggleUnorderedList
}
export default {
  view,
  open,
  action,
  close() {
    clearInterval(iInterval)
    cm.toTextArea()
  }
}
function startTimer() {
  clearInterval(iInterval)
  iInterval = setInterval(function() {
    $('#timecost').innerText = card.timecost = dur_inc_sec(card.timecost)
    local.update(card)
  }, 1000)
}
function view() {
  function change(key) {
    return e => {
      card[key] = $('#' + key).value
      view()
      local.update(card)
    }
  }
  render(
    h('div pa3 h-100', [
      'div shadow border-box h-100 relative flex flex-column',
      { width: '37em', margin: 'auto' },
      [
        'div flex',
        [
          'input white b pa3 w-100',
          { id: 'name', onChange: change('name'), value: card.name }
        ],
        ['div red pa2', { id: 'timecost' }, card.timecost]
      ],
      ['textarea', { defaultValue: card.notion }],
      [
        'input white b pa3 w-100',
        { id: 'tags', value: card.tags, onChange: change('tags') }
      ]
    ]),
    document.getElementById('r')
  )
}
function open(id, last) {
  lastApp = last
  card = local.get(id)
  console.log(card)
  view()
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
    Esc: action.blur
  })
  if (card.cursor) cm.setCursor(card.cursor)
  cm.on('change', e => {
    card.notion = cm.getValue()
    card.cursor = cm.getCursor()
    local.update(card)
    if (card.tags.indexOf('setting keymap') >= 0) {
      update_keymaps()
    }
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
