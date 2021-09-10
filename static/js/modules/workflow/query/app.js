/* Initialize Elements */

new Vue({
  store,
  router,
  el: '#app',
  components: {
    'tabs': tabbed.tabs,
    'tab': tabbed.tab,
    'toggle': toggle,
    'configuration': configuration,
    'listsearcher': listsearcher,
    'datepicker': vuejsDatepicker,
    'resultstable': resultstable,
    'resultshistogram': resultshistogram
  },
  data: {
    query: {
      id: null
    },
    recipe: {
      featured: {},
      prefill: false,
      selected: {
        template: null
      }
    },
    lists: {
      slot: 0,
      config: {}
    },
    filters: {
      disabledDates: DATERANGES.disabledDates.datasets,
      dates: DATERANGES.dates.datasets
    },
    results: {
      count: -1,
      download: false,
      downloading: 0
    },
    save: {
      visibility: 'hidden',
      name: null,
      description: null
    }
  },
  computed: {
    build() {
      let obj = {
        template: this.recipe.selected.template,
        subtypes: this.recipe.selected.subtypes,
        output: this.recipe.selected.output,
        lists: {},
        dates: this.filters.dates,
        visibility: this.save.visibility,
        name: this.save.name,
        description: this.save.description
      }
      var self = this
      if (!_.isEmpty(this.query.id)) {
        obj.id = this.query.id
      }
      _.forEach(_.keys(this.lists.config), function(s) {
        if (!_.isUndefined(self.lists.config[s])) {
          obj.lists[s] = self.lists.config[s].selected.id
        }
      })
      return obj
    },
    buildable() {
      return _.intersection(store.state.workflow.valid, [1,2,3]).length == 3
    }
  },
  methods: {
    makeRecipes(tag) {
      return _.filter(RECIPES, function(r) {
        return _.includes(r.tags, tag)
      })
    },
    resetLists() {
      let obj = {}
      for (let i = 0; i < this.recipe.selected.subtypes.length; i++) {
        obj[this.getSequence(i)] = undefined
      }
      this.lists.config = obj
    },
    updateLists(payload) {
      this.lists.config[this.getSequence(this.lists.slot)] = payload
    },
    getSequence(index) {
      return ['a', 'b', 'c', 'd', 'e', 'f'][index]
    },
    downloadingResults(payload) {
      if (payload == false) {
        this.results.download = false
        this.results.downloading = 0
      } else {
        this.results.downloading = payload
      }
    },
    countResults(payload) {
      this.results.count = payload
    },
    submit() {
      let endpoint = '/api/query/create/'
      if (this.$route.query.action == 'edit') {
        endpoint = '/api/query/edit/'
      }
      this.$store.dispatch('workflow/submit', {endpoint: endpoint, payload: this.build})
    }
  },
  watch: {
    build: {
      deep: true,
      handler() {
        store.commit('workflow/reset')
        store.commit('workflow/clear')
        // validate steps
        if (!_.isNull(this.build.template)) {
          store.commit('workflow/valid', 1)
        }
        if (!_.isEmpty(this.build.lists) && !_.isEmpty(this.build.subtypes) && _.keys(this.build.lists).length == this.build.subtypes.length) {
          store.commit('workflow/valid', 2)
          store.commit('workflow/valid', 3)
          store.commit('workflow/valid', 4)
        }
        if (!_.isEmpty(this.build.visibility) && !_.isEmpty(this.build.name) && !_.isEmpty(this.build.description)) {
          store.commit('workflow/complete')
        }
      }
    }
  },
  created() {
    var self = this
    // get featured public lists
    axios.post('/api/lists/', {featured: true})
    .then(function(response) {
      let subtype = _.uniq(_.map(response.data, 'subtype'))
      let mapped = {}
      _.forEach(subtype, function(t) {
        mapped[t] = _.filter(response.data, {subtype: t})
      })
      self.recipe.featured = mapped
    })
    .catch(function(error) {
      console.error(error)
    })
    // get id for edit or clone workflow
    if (_.includes(['edit', 'clone'], this.$route.query.action) && !_.isUndefined(this.$route.query.id)) {
      this.query.id = this.$route.query.id
    }
    // load data for edit or clone workflow
    if (!_.isUndefined(this.$route.query.id)) {
      axios.post('/api/query/meta/', {id: this.$route.query.id})
      .then(function(response) {
        self.recipe.selected = _.filter(RECIPES, function(r) {
          return r.template == response.data.template
        })[0]
        self.resetLists()
        _.forEach(_.keys(response.data.lists), function(k) {
          self.lists.config[k] = {
            filters: {
              visibility: 'all',
              term: null
            },
            selected: {
              id: response.data.lists[k]
            }
          }
        })
        self.filters.dates = response.data.dates
        self.save.visibility = response.data.visibility
        self.save.name = response.data.name
        self.save.description = response.data.description
      })
      .catch(function(error) {
        console.error(error)
      })
    }
  }
})
