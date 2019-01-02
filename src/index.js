import { ui } from './view'
import { onload_db } from './data/local'

onload_db(e => {
  ui('open', 'kanban')
  // ui('open', 'query', 't')
})
