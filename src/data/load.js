import loki from 'lokijs'

let callback, db
export default function(f) {
  callback = f
  let lokiIndexedAdapter = new loki().getIndexedAdapter()
  db = new loki('indexed.db', {
    autoload: true,
    autoloadCallback: load_local,
    autosave: true,
    autosaveInterval: 1000,
    adapter: new lokiIndexedAdapter('b')
  })
}
function load_local() {
  let local = db.getCollection('text')
  if (local === null) {
    console.log('create db with initData')
    local = db.addCollection('text')
    local.insert(initData)
  }
  if (callback) callback(local, db)
  // state.load('popup', Keymap, 'desktop')
  // ui.global_kmap = get_kmap('global')
  window.local = local
}

let initData = [
  {
    name: 'desktop',
    tags: 'setting keymap',
    notion: ['m viewer meta', 't viewer task', 'k viewer setting']
  },
  {
    name: 'global',
    tags: 'setting keymap',
    notion: ['ac1 popkey desktop']
  },
  {
    name: 'edtior nmap',
    tags: 'setting keymap',
    notion: [
      'i set_lane idea',
      'd set_lane design',
      't set_lane todo',
      'b set_lane beta',
      's set_lane stable',
      'p set_lane problem',
      'a set_lane archive'
    ]
  },
  {
    name: 'editor nmap',
    tags: 'setting keymap',
    notion: ['ret add_dn', 'tab form name', 'esc switch_status']
  },
  {
    name: 'viewer imap',
    tags: 'setting keymap',
    notion: ['ret open', 'tab create']
  }
]
