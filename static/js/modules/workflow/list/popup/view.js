/* Initialize Store */

const store = new Vuex.Store({
  modules: {
    auth: authStore,
    waitlist: waitlistStore
  }
})

/* Initialize Components */

new Vue({
  store,
  router,
  el: '#main',
  components: {
    'listdisplayer': listdisplayer
  },
  data: {
    list: {}
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
    // load data for view workflow
    if (!_.isUndefined(this.$route.query.id)) {
      axios.post('/api/list/meta/', {id: this.$route.query.id})
      .then(function(response) {
        self.list = UNSHIM(response.data)
      })
      .catch(function(error) {
        console.error(error)
      })
    }
  }
})
