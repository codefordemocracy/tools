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
      dates: DATERANGES.dates.open,
      numerical: {
        amount: {
          min: null,
          max: null
        }
      }
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
    descriptor() {
      var self = this
      let obj = {
        recipe: _.get(this.recipe.selected, 'configurables'),
        lists: {}
      }
      _.forEach(_.keys(this.lists.config), function(s) {
        if (!_.isNil(self.lists.config[s])) {
          obj.lists[s] = self.lists.config[s].selected.name
        }
      })
      return obj
    },
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
        if (!_.isNil(self.lists.config[s])) {
          obj.lists[s] = self.lists.config[s].selected.id
        }
      })
      if (this.recipe.selected.output == 'contribution') {
        if (!_.isEmpty(this.filters.numerical.amount.min) || !_.isEmpty(this.filters.numerical.amount.max)) {
          obj.filters = {
            amount: {}
          }
          if (!_.isEmpty(this.filters.numerical.amount.min)) {
            obj.filters.amount.min = this.filters.numerical.amount.min
          }
          if (!_.isEmpty(this.filters.numerical.amount.max)) {
            obj.filters.amount.max = this.filters.numerical.amount.max
          }
        }
      }
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
          if (!_.isEmpty(this.build.lists) && !_.isEmpty(this.build.subtypes) && _.keys(this.build.lists).length == this.build.subtypes.length) {
            store.commit('workflow/valid', 2)
            if (!_.isNull(this.filters.dates.min)) {
              store.commit('workflow/valid', 3)
              store.commit('workflow/valid', 4)
              if (!_.isEmpty(this.build.visibility) && !_.isEmpty(this.build.name)) {
                store.commit('workflow/complete')
              }
            }
          }
        }
      }
    },
    descriptor: {
      deep: true,
      handler() {
        var self = this
        let name = this.descriptor.recipe.replace(/<\/?[^>]+(>|$)/g, 'XXXXX')
        _.forEach(_.keys(this.descriptor.lists), function(s) {
          if (!_.isNil(self.descriptor.lists[s])) {
            name = name.replace('XXXXXXXXXX', self.descriptor.lists[s])
          }
        })
        name = _.upperFirst(name)
        this.save.name = name
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
    if (_.includes(['edit', 'clone'], this.$route.query.action) && !_.isNil(this.$route.query.id)) {
      this.query.id = this.$route.query.id
    }
    // load data for edit or clone workflow
    if (!_.isNil(this.$route.query.id)) {
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
        if (!_.isNil(response.data.filters)) {
          if (!_.isNil(response.data.filters.amount)) {
            self.filters.numerical.amount = response.data.filters.amount
          }
        }
      })
      .catch(function(error) {
        console.error(error)
      })
    }
  }
})
