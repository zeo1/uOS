import { each } from '../util'

export default function(l) {
  let notionMap = {
    desktop: `
m f
t k today
u f config user::
d f config default::`,
    global_imap: `
f4 kmap desktop
esc blur`,
    global_nmap: `f4 kmap desktop`,
    note_nmap: `,
i focus
n focus #name
t focus #tags
esc open_last`,
    note_imap: ``,
    finder_imap: `
up select_up
dn select_dn
ent open
tab create`,
    finder_nmap: `i focus
esc open_today`,
    kanban_nmap: `
ent open_note
a add
r rm
s mv_lft
d mv_rit
t mv_rit
w mv_up
e mv_dn
i focus
up focus_up
dn focus_dn
lft focus_lft
rit focus_rit
esc open_last
x last_day
c next_day`,
    kanban_imap: `
up focus_up 1
dn focus_dn 1
mup focus_lft 1
mdn focus_rit 1
esc blur
ent open_note`
  }

  each(notionMap, (notion, name) => {
    let tags = 'config default keymap'
    let cur = l.findOne({ tags, name })
    cur ? l.update({ ...cur, notion }) : l.insert({ tags, name, notion })
  })
  each(notionMap, (notion, name) => {
    let tags = 'config user keymap'
    let cur = l.findOne({ tags, name })
    if (!cur) l.insert({ tags, name, notion: '' })
  })

  console.log('init local data with default configs')
}
