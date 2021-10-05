/* Initialize Elements */

new Vue({
  store,
  router,
  el: '#app',
  components: {
    'tabs': tabbed.tabs,
    'tab': tabbed.tab,
    'querysearcher': querysearcher,
    'multiselect': window.VueMultiselect.default,
    'vizreviewer': vizreviewer
  },
  data: {
    visualization: {
      id: null
    },
    category: null,
    query: undefined,
    aggregations: {
      options: [],
      settings: {
        columns: [],
        apply: {},
        groupby: []
      }
    },
    review: {
      datawrapper: null,
      download: false,
      downloading: 0
    },
    save: {
      name: null,
      description: null
    }
  },
  computed: {
    columns() {
      return this.aggregations.settings.columns
    },
    build() {
      let obj = {
        category: this.category,
        aggregations: this.aggregations.settings,
        name: this.save.name,
        description: this.save.description,
        datawrapper: this.review.datawrapper
      }
      if (!_.isEmpty(this.visualization.id)) {
        obj.id = this.visualization.id
      }
      if (!_.isNil(this.query)) {
        obj.query = this.query.selected.id
      }
      return obj
    },
    buildable() {
      return _.intersection(store.state.workflow.valid, [1,2,3]).length == 3
    }
  },
  methods: {
    updateQuery(payload) {
      this.query = payload
    },
    updateDatawrapper(payload) {
      this.review.datawrapper = payload
    },
    downloadingData(payload) {
      if (payload == false) {
        this.review.download = false
        this.review.downloading = 0
      } else {
        this.review.downloading = payload
      }
    },
    submit() {
      let endpoint = '/api/visualization/create/'
      if (this.$route.query.action == 'edit') {
        endpoint = '/api/visualization/edit/'
      }
      this.$store.dispatch('workflow/submit', {endpoint: endpoint, payload: this.build})
      // send to datawrapper
      DATAWRAPPER(this.build.datawrapper, this.save.name, this.save.description)
    }
  },
  watch: {
    columns() {
      var self = this
      _.forEach(_.keys(this.aggregations.settings.apply), function(c) {
        if (!_.includes(self.aggregations.settings.columns, c)) {
          // delete the aggregation setting if it's no longer to be aggregated
          delete self.aggregations.settings.apply[c]
        }
      })
      _.forEach(this.aggregations.settings.columns, function(c) {
        if (!_.includes(_.keys(self.aggregations.settings.apply), c)) {
          // set up the aggregation setting if it's just been added
          Vue.set(self.aggregations.settings.apply, c, self.aggregations.options[c][0])
        }
        // remove from groupby
        self.aggregations.settings.groupby = _.difference(self.aggregations.settings.groupby, [c])
      })
    },
    build: {
      deep: true,
      handler() {
        store.commit('workflow/reset')
        store.commit('workflow/clear')
        // validate
        if (!_.isNull(this.build.category)) {
          store.commit('workflow/valid', 1)
        }
        if (!_.isNil(this.query)) {
          store.commit('workflow/valid', 2)
        }
        if (_.isEmpty(this.aggregations.settings.columns) || !_.isEmpty(this.aggregations.settings.groupby)) {
          store.commit('workflow/valid', 3)
        }
        if (this.build.category != 'network' && !_.isNull(this.review.datawrapper)) {
          store.commit('workflow/valid', 4)
        }
        if (!_.isEmpty(this.save.name)) {
          store.commit('workflow/complete')
        }
      }
    },
    query: {
      deep: true,
      handler() {
        var self = this
        if (!_.isNil(this.query)) {
          // get potential aggregations
          axios.post('/api/query/results/table/', {query: this.query.selected, pagination: {skip: 0, limit: 100}})
          .then(function(response) {
            axios.post('/api/visualization/aggregations/options/', response.data)
            .then(function(res) {
              self.aggregations.options = res.data
            })
            .catch(function(err) {
              console.error(err)
            })
          })
          .catch(function(error) {
            console.error(error)
          })
        }
      }
    },
    aggregations: {
      deep: true,
      handler() {
        this.review.datawrapper = null
      }
    }
  },
  created() {
    var self = this
    // get id for edit or clone workflow
    if (_.includes(['edit', 'clone'], this.$route.query.action) && !_.isNil(this.$route.query.id)) {
      this.visualization.id = this.$route.query.id
    }
    // load data for edit or clone workflow
    if (!_.isNil(this.$route.query.id)) {
      axios.post('/api/visualization/meta/', {id: this.$route.query.id})
      .then(function(response) {
        self.category = response.data.category
        self.query = {
          filters: {
            visibility: 'all',
            term: null
          },
          selected: {
            id: response.data.query
          }
        }
        _.forEach(_.keys(response.data.aggregations.apply), function(c) {
          Vue.set(self.aggregations.settings.apply, c, response.data.aggregations.apply.c)
        })
        self.aggregations.settings = response.data.aggregations
        self.save.name = response.data.name
        self.save.description = response.data.description
      })
      .catch(function(error) {
        console.error(error)
      })
    }
  }
})
