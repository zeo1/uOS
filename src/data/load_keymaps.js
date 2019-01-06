import { each, keys } from '../util'
import apps from '../apps'

function parse(notion) {
  let kmapArr = notion.trim().split('\n')
  let kmap = {}
  each(kmapArr, line => {
    if (line.split) {
      let arr = line.trim().split(' ')
      kmap[arr[0]] = arr.slice(1)
    }
  })
  return kmap
}

function load(l, str, keymaps) {
  let arr = l.find({ tags: { $contains: `config ${str} keymap` } })
  each(arr, a => {
    keymaps[a.name] = parse(a.notion)
  })
  each(keys(apps), key => {
    let app = apps[key]
    let nmap = keymaps[key + '_nmap']
    let imap = keymaps[key + '_imap']
    if (nmap) app.nmap = nmap
    if (imap) app.imap = imap
  })
}

export default function(l) {
  let keymaps = {}
  load(l, 'user', keymaps)
  load(l, 'default', keymaps)
  console.log(keymaps)
  return keymaps
}
