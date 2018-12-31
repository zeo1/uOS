import { h } from '../view'
import { render } from 'react-dom'
import { $ } from '../util'

let CodeMirror = require('codemirror')
require('codemirror/lib/codemirror.css')
require('codemirror/mode/gfm/gfm')
require('codemirror/keymap/sublime')
require('codemirror/theme/base16-dark.css')
require('codemirror/addon/edit/continuelist')
require('codemirror/addon/edit/closebrackets.js')
require('codemirror/addon/selection/active-line.js')

let cm
function view() {
  render(
    h('div pa3 h-100', [
      'div shadow border-box h-100',
      { width: '37em', margin: 'auto' },
      ['textarea']
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
    indentWithTabs: false
  })
  cm.setOption('extraKeys', {
    Enter: CodeMirror.commands.newlineAndIndentContinueMarkdownList,
    Tab: CodeMirror.commands.indentMore,
    'Ctrl-L': toggleUnorderedList
  })
  cm.on('change', e => {
    // console.log(cm.getValue())
  })
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

export default { view }
