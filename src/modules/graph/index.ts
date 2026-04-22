import PersonGraph from './components/PersonGraph.vue'
import { persons, links } from '../../data/mockData'

export default {
  components: { PersonGraph },
  setup() {
    return { persons, links }
  }
}