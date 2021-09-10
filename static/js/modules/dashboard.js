/* Initialize Store */

const store = new Vuex.Store({
  modules: {
    auth: authStore,
    waitlist: waitlistStore
  }
})

/* Initialize Elements */

new Vue({
  store,
  el: '#main',
  components: {
    'tabs': tabbed.tabs,
    'tab': tabbed.tab,
    'listpaginator': listpaginator,
    'querypaginator': querypaginator,
    'vizpaginator': vizpaginator,
    'alertpaginator': alertpaginator
  },
  data: {
    lists: false,
    queries: false,
    visualizations: false,
    alerts: false,
    filters: {
      list: {
        visibility: 'all',
        term: null
      },
      query: {
        visibility: 'all',
        term: null
      },
      visualization: {
        term: null
      },
      alert: {
        term: null
      }
    },
    confirm: {
      list: {
        modal: false,
        id: null,
        name: null
      },
      query: {
        modal: false,
        id: null,
        name: null
      },
      visualization: {
        modal: false,
        id: null,
        name: null
      },
      alert: {
        modal: false,
        id: null,
        name: null
      }
    }
  },
  methods: {
    filter(elements, term, visibility='all') {
      let opts = this[elements]
      if (visibility != 'all') {
        opts = _.filter(opts, {visibility: this.filters.list.visibility})
      }
      if (!_.isEmpty(term)) {
        opts = _.filter(opts, function(x) {
          return _.includes(_.lowerCase(x.name), _.lowerCase(term))
        })
      }
      return opts
    },
    toggleList(list) {
      var self = this
      axios.post('/api/list/toggle/', {id: list.id})
      .then(function(response) {
        self.lists = response.data
      })
      .catch(function(error) {
        console.error(error)
      })
    },
    confirmList(list) {
      this.confirm.list.modal = true
      this.confirm.list.id = list.id
      this.confirm.list.name = list.name
    },
    deleteList() {
      var self = this
      axios.post('/api/list/delete/', {id: this.confirm.list.id})
      .then(function(response) {
        self.lists = response.data
      })
      .catch(function(error) {
        console.error(error)
      })
    },
    toggleQuery(query) {
      var self = this
      axios.post('/api/query/toggle/', {id: query.id})
      .then(function(response) {
        self.queries = response.data
      })
      .catch(function(error) {
        console.error(error)
      })
    },
    confirmQuery(query) {
      this.confirm.query.modal = true
      this.confirm.query.id = query.id
      this.confirm.query.name = query.name
    },
    deleteQuery() {
      var self = this
      axios.post('/api/query/delete/', {id: this.confirm.query.id})
      .then(function(response) {
        self.queries = response.data
      })
      .catch(function(error) {
        console.error(error)
      })
    },
    confirmVisualization(viz) {
      this.confirm.visualization.modal = true
      this.confirm.visualization.id = viz.id
      this.confirm.visualization.name = viz.name
    },
    deleteVisualization() {
      var self = this
      axios.post('/api/visualization/delete/', {id: this.confirm.visualization.id})
      .then(function(response) {
        self.visualizations = response.data
      })
      .catch(function(error) {
        console.error(error)
      })
    },
    confirmAlert(alert) {
      this.confirm.alert.modal = true
      this.confirm.alert.id = alert.id
      this.confirm.alert.name = alert.name
    },
    deleteAlert() {
      var self = this
      axios.post('/api/alert/delete/', {id: this.confirm.alert.id})
      .then(function(response) {
        self.alerts = response.data
      })
      .catch(function(error) {
        console.error(error)
      })
    }
  },
  created() {
    var self = this
    // get lists
    axios.get('/api/user/active/lists/')
    .then(function(response) {
      self.lists = response.data
    })
    .catch(function(error) {
      console.error(error)
    })
    // get queries
    axios.get('/api/user/active/queries/')
    .then(function(response) {
      self.queries = response.data
    })
    .catch(function(error) {
      console.error(error)
    })
    // get visualizations
    axios.get('/api/user/active/visualizations/')
    .then(function(response) {
      self.visualizations = response.data
    })
    .catch(function(error) {
      console.error(error)
    })
    // get alerts
    axios.get('/api/user/active/alerts/')
    .then(function(response) {
      self.alerts = response.data
    })
    .catch(function(error) {
      console.error(error)
    })
  }
})
