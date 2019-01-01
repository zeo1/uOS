import './styles.css'

import { createElement } from 'react'
import { iss, isa, iso, c, each } from '../util'

export default function h(tag, props, ...children) {
  if (iso(tag)) {
    children.unshift(props)
    props = tag
    tag = props.tag || 'div'
  }
  if (!iso(props) || props._owner) {
    children.unshift(props)
    props = {}
  }
  props.className = props.class || ''
  if (iss(tag)) {
    props.className += tag.substr(tag.indexOf(' ') + 1)
    tag = tag.replace(/ .*/, '')
  }
  each(children, (child, i) => {
    if (isa(child)) children[i] = h(...child)
  })
  return createElement(tag, (props.style = props), ...children)
}
