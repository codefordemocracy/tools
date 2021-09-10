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
    'vizdisplayer': vizdisplayer,
    'vizreviewer': vizreviewer
  },
  data: {
    loaded: false,
    visualization: {},
    query: null,
    datawrapper: null
  },
  computed: {
    ratio() {
      if (this.$route.query.mode == 'popup') {
        return 1
      }
    }
  },
  methods: {
    updateDatawrapper(payload) {
      this.datawrapper = payload
    }
  },
  created() {
    var self = this
    // load data for view workflow
    if (!_.isUndefined(this.$route.query.id)) {
      axios.post('/api/visualization/meta/', {id: this.$route.query.id})
      .then(function(response) {
        self.visualization = response.data
        axios.post('/api/query/meta/', {id: self.visualization.query})
        .then(function(res) {
          self.query = res.data
        })
        .catch(function(err) {
          console.error(err)
        })
        self.loaded = true
      })
      .catch(function(error) {
        console.error(error)
      })
    }
  }
})
