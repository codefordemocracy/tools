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
    'bookmarks': bookmarks,
    'listpaginator': listpaginator
  },
  data: {
    bookmarks: null,
    lists: null,
    confirm: {
      modal: false,
      id: null,
      name: null
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
    updateBookmarks(bookmarks) {
      this.bookmarks = bookmarks
    },
    confirmDelete(list) {
      console.log(list)
      this.confirm.modal = true
      this.confirm.id = list.id
      this.confirm.name = list.name
    },
    deleteList() {
      var self = this
      axios.post('/api/list/delete/', {id: this.confirm.id})
      .then(function(response) {
        self.lists = response.data
      })
      .catch(function(error) {
        console.error(error)
      })
    }
  },
  created() {
    var self = this
    // get bookmarks
    axios.get('/api/user/active/bookmarks/')
    .then(function(response) {
      self.bookmarks = response.data
    })
    .catch(function(error) {
      console.error(error)
    })
    // get lists
    axios.get('/api/user/active/lists/')
    .then(function(response) {
      self.lists = response.data
    })
    .catch(function(error) {
      console.error(error)
    })
  }
})
