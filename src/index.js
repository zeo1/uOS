import { ui } from './view'
import { onload_db } from './data/local'

onload_db(e => {
  ui('open', 'kanban', new Date().toJSON().slice(0, 10))
  // ui('open', 'query', 't')
})
