import { ui } from './view'
import { onload_db, keymaps } from './data/local'

onload_db(l => {
  ui('open', 'kanban', new Date().toJSON().slice(0, 10))
  // ui('open', 'query', 't')
})
