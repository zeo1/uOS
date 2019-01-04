export default function(l) {
  l.clear()
  l.insert([
    {
      name: 'desktop',
      tags: 'setting keymap',
      notion: `m q 
t q today
k q setting::`
    },
    {
      name: 'global',
      tags: 'setting keymap',
      notion: `ac1 kmap desktop`
    },
    {
      name: 'note_nmap',
      tags: 'setting keymap',
      notion: `i focus
      esc open_last`
    },
    {
      name: 'note_imap',
      tags: 'setting keymap',
      notion: `esc blur`
    },
    {
      name: 'query_imap',
      tags: 'setting keymap',
      notion: `up select_up
dn select_dn
ent open
tab create`
    },
    {
      name: 'query_nmap',
      tags: 'setting keymap',
      notion: `i focus`
    },
    {
      name: 'kanban_nmap',
      tags: 'setting keymap',
      notion: `ent open_note
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
c next_day
    `
    },
    {
      name: 'kanban_imap',
      tags: 'setting keymap',
      notion: `up focus_up 1
dn focus_dn 1
mup focus_lft 1
mdn focus_rit 1
esc blur
ent open_note`
    }
  ])
  console.log('init local data with default settings')
}
