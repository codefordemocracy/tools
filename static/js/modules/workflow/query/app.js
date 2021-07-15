/* Initialize Elements */

new Vue({
  el: '#app',
  components: {
    'tabs': tabbed.tabs,
    'tab': tabbed.tab,
    'toggle': toggle,
    'configuration': configuration,
    'listsearcher': listsearcher
  },
  data: {
    preloaded: [],
    showExamples: false,
    recipe: {
      template: null
    }
  },
  methods: {
    recipes(type) {
      return _.filter(RECIPES, function(r) {
        return _.includes(r.tags, type)
      })
    }
  },
  watch: {
    recipe: {
      deep: true,
      handler() {
        store.commit('workflow/reset')
        store.commit('workflow/clear')
        // validate and preview
        if (!_.isNull(this.recipe.template)) {
          store.commit('workflow/valid', 1)
        }
      }
    }
  },
  created() {
    var self = this
    // get public lists
    axios.post('/api/lists/preloaded/', {featured: true})
    .then(function(response) {
      let types = _.uniq(_.map(response.data, 'type'))
      let mapped = {}
      _.forEach(types, function(t) {
        mapped[t] = _.filter(response.data, {type: t})
      })
      self.preloaded = mapped
    })
    .catch(function(error) {
      console.error(error)
    })
  }
})
