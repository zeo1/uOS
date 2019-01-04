import loki from 'lokijs'
import load_keymaps from './load_keymaps'
import reset from './reset'
let callback, db, local, keymaps
function onload_db(f) {
  callback = f
}
export { db, onload_db, local, keymaps }

let lokiIndexedAdapter = new loki().getIndexedAdapter()
db = new loki('indexed.db', {
  autoload: true,
  autoloadCallback: load_local,
  autosave: true,
  autosaveInterval: 1000,
  adapter: new lokiIndexedAdapter('b')
})

function load_local() {
  local = db.getCollection('text')
  if (local === null || !local.data.length) {
    local = db.addCollection('text')
    reset(local)
  }
  keymaps = load_keymaps(local)
  if (callback) callback(local)
  window.local = local
}
