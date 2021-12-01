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
  router,
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
    tab: 'lists',
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
        active: 'all',
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
    filter(elements, term, f='all') {
      let opts = this[elements]
      if (f != 'all') {
        if (elements == 'alerts') {
          opts = _.filter(opts, {active: f})
        } else {
          opts = _.filter(opts, {visibility: f})
        }
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
        if (_.get(response.data, 'id')) {
          _.forEach(self.lists, function(obj) {
            if (obj.id == list.id) {
              if (obj.visibility == 'public') {
                obj.visibility = 'hidden'
              } else {
                obj.visibility = 'public'
              }
            }
          })
        }
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
        if (_.get(response.data, 'id')) {
          self.lists = _.filter(self.lists, function(obj) {
            return obj.id != self.confirm.list.id
          })
        }
      })
      .catch(function(error) {
        console.error(error)
      })
    },
    toggleQuery(query) {
      var self = this
      axios.post('/api/query/toggle/', {id: query.id})
      .then(function(response) {
        if (_.get(response.data, 'id')) {
          _.forEach(self.queries, function(obj) {
            if (obj.id == query.id) {
              if (obj.visibility == 'public') {
                obj.visibility = 'hidden'
              } else {
                obj.visibility = 'public'
              }
            }
          })
        }
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
        if (_.get(response.data, 'id')) {
          self.queries = _.filter(self.queries, function(obj) {
            return obj.id != self.confirm.query.id
          })
        }
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
        if (_.get(response.data, 'id')) {
          self.visualizations = _.filter(self.visualizations, function(obj) {
            return obj.id != self.confirm.visualization.id
          })
        }
      })
      .catch(function(error) {
        console.error(error)
      })
    },
    toggleAlertProceed(alert) {
      var self = this
      axios.post('/api/alert/toggle/', {id: alert.id})
      .then(function(response) {
        if (_.get(response.data, 'id')) {
          _.forEach(self.alerts, function(obj) {
            if (obj.id == alert.id) {
              obj.active = !obj.active
            }
          })
        }
      })
      .catch(function(error) {
        console.error(error)
      })
    },
    toggleAlert(alert) {
      var self = this
      if (alert.active == false) {
        axios.get('/api/user/active/alerts/count/active/')
        .then(function(response) {
          if (response.data >= MAX_ACTIVE_ALERTS) {
            self.$store.commit('auth/limit', true)
          } else {
            self.toggleAlertProceed(alert)
          }
        })
        .catch(function(error) {
          console.error(error)
        })
      } else {
        this.toggleAlertProceed(alert)
      }
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
        if (_.get(response.data, 'id')) {
          self.alerts = _.filter(self.alerts, function(obj) {
            return obj.id != self.confirm.alert.id
          })
        }
      })
      .catch(function(error) {
        console.error(error)
      })
    },
    loadObjects() {
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
  },
  created() {
    var self = this
    this.$store.watch((state) => store.state.auth.profile.email, (newValue, oldValue) => {
      self.lists = false
      self.queries = false
      self.visualizations = false
      self.alerts = false
      if (!_.isUndefined(newValue)) {
        self.loadObjects()
      }
    })
    if (_.includes(['lists', 'queries', 'visualizations', 'alerts'], this.$route.query.tab)) {
      this.tab = this.$route.query.tab
    }
  }
})
