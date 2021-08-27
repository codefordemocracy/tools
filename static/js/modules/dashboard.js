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
    'querypaginator': querypaginator
  },
  data: {
    lists: null,
    queries: null,
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
      }
    }
  },
  methods: {
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
  }
})
