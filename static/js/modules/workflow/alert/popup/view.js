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
      if (_.includes(document.referrer, 'tools.codefordemocracy.org')) {
        return 1
      }
    }
  },
  created() {
    var self = this
    // load data for view workflow
    if (!_.isNil(this.$route.query.id)) {
      axios.post('/api/alert/meta/', {id: this.$route.query.id})
      .then(function(response) {
        self.alert = response.data
        if (!_.isUndefined(response.data.name)) {
          document.title = response.data.name + " | " + document.title
        }
        self.loaded = true
      })
      .catch(function(error) {
        console.error(error)
        self.error = true
      })
    }
  }
})
