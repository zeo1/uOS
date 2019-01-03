import { local, each } from '../util'

export default {
  keymap(notion) {
    // let kmapArr = local
    //   .findOne({ tags: { $contains: 'keymap' }, name })
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
}
