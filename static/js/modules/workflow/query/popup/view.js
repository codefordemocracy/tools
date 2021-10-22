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
    'querydisplayer': querydisplayer,
    'configuration': configuration,
    'resultstable': resultstable,
    'resultshistogram': resultshistogram
  },
  data: {
    loaded: false,
    error: false,
    query: {},
    results: {
      count: -1,
      download: false,
      downloading: 0
    }
  },
  computed: {
    ratio() {
      if (this.$route.query.mode == 'popup') {
        return 1
      }
    }
  },
  methods: {
    downloadingResults(payload) {
      if (payload == false) {
        this.results.download = false
        this.results.downloading = 0
      } else {
        this.results.downloading = payload
      }
    },
    countResults(payload) {
      this.results.count = payload
    }
  },
  created() {
    var self = this
    // load data for view workflow
    if (!_.isNil(this.$route.query.id)) {
      axios.post('/api/query/meta/', {id: this.$route.query.id})
      .then(function(response) {
        self.query = response.data
        if (!_.isEmpty(self.query) && !_.isNil(self.$route.query.freshness)) {
          self.query.freshness = self.$route.query.freshness
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
