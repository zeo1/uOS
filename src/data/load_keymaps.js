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

export default function(l) {
  let arr = l.find({ tags: { $contains: 'setting keymap' } })
  let keymaps = {}
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
  console.log(keymaps)
  return keymaps
}
