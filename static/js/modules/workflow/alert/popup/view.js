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
    'alertdisplayer': alertdisplayer
  },
  data: {
    loaded: false,
    error: false,
    alert: {}
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
      axios.post('/api/alert/meta/', {id: this.$route.query.id})
      .then(function(response) {
        self.alert = response.data
        self.loaded = true
      })
      .catch(function(error) {
        console.error(error)
        self.error = true
      })
    }
  }
})
