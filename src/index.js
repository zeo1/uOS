import { ui } from './view'
import { onload_db, keymaps } from './data/local'

onload_db(l => {
  ui('k', 'today')
})
