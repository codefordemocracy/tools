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
    'listpaginator': listpaginator,
    'querypaginator': querypaginator
  },
  data: {
    user: {}
  },
  computed: {
    ratio() {
      if (this.$route.query.mode == 'popup') {
        return 1
      }
    }
  },
  created() {
    var self = this
    let username = document.title.substring(1).split(" | ")[0]
    axios.post('/api/user/public/', {username: username})
    .then(function(response) {
      self.user = response.data
    })
    .catch(function(error) {
      console.error(error)
    })
  }
})
