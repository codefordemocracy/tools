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
    'datatable': datatable
  },
  data: {
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
    loaded: false,
    formatted: {
      count: null,
      columns: [],
      pages: []
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
        aggregations: this.aggregations.settings
      }
      if (!_.isUndefined(this.query)) {
        obj.query = this.query.selected.id
        // datawrapper
        if (obj.category != "network") {
          obj.datawrapper = {
            source_name: 'Code for Democracy',
            source_url: ROOTURL + '/view/query/?id=' + obj.query + '&mode=popup',
            data: '',
            title: this.save.name,
            description: this.save.description
          }
          if (obj.category == 'table') {
            obj.datawrapper.type = 'tables'
          } else if (obj.category == 'chart') {
            obj.datawrapper.type = 'd3-bars'
          } else if (obj.category == 'map') {
            obj.datawrapper.type = 'd3-maps-choropleth'
          }
          if (this.formatted.count > 0) {
            obj.datawrapper.data += _.join(this.formatted.columns, ';')
            _.forEach(this.formatted.pages, function(page) {
              _.forEach(page, function(row) {
                obj.datawrapper.data += '\n' + _.join(_.values(row), ';')
              })
            })
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
    updateQuery(payload) {
      this.query = payload
    },
    submit() {
      let endpoint = '/api/visualization/create/'
      if (this.$route.query.action == 'edit') {
        endpoint = '/api/visualization/edit/'
      }
      this.$store.dispatch('workflow/submit', {endpoint: endpoint, payload: this.build})
      // send to datawrapper
      var self = this
      if (!_.isUndefined(this.build.datawrapper)) {
        let form = document.createElement('form')
        form.setAttribute('method', 'post')
        form.setAttribute('target', '_blank')
        form.setAttribute('action', 'https://app.datawrapper.de/create/')
        _.forEach(_.keys(this.build.datawrapper), function(key) {
          let input = document.createElement('input')
          input.setAttribute('type', 'hidden')
          input.setAttribute('name', key)
          input.setAttribute('value', key === 'metadata' ? JSON.stringify(self.build.datawrapper[key]) : self.build.datawrapper[key])
          form.appendChild(input)
        })
        document.body.appendChild(form)
        form.submit()
        document.body.removeChild(form)
      }
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
        if (!_.isUndefined(this.query)) {
          store.commit('workflow/valid', 2)
        }
        if (_.isEmpty(this.aggregations.settings.columns) || !_.isEmpty(this.aggregations.settings.groupby)) {
          store.commit('workflow/valid', 3)
        }
        if (this.loaded) {
          store.commit('workflow/valid', 4)
        }
        if (!_.isEmpty(this.save.name) && !_.isEmpty(this.save.description)) {
          store.commit('workflow/complete')
        }
      }
    },
    query: {
      deep: true,
      handler() {
        var self = this
        if (!_.isUndefined(this.query)) {
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
        this.loaded = false
      }
    }
  },
  created() {
    var self = this
    this.$store.watch((state) => state.workflow.tab, (newVal, oldVal) => {
      if (self.buildable && newVal == 4 && !this.loaded) {
        // get formatted data
        axios.post('/api/visualization/aggregations/results/', {query: self.query.selected, aggregations: self.build.aggregations})
        .then(function(response) {
          self.formatted = response.data
          self.loaded = true
        })
        .catch(function(error) {
          console.error(error)
        })
      }
    })
  }
})
