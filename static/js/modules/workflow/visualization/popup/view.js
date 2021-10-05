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
    error: false,
    visualization: {},
    query: null,
    review: {
      datawrapper: null,
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
    updateDatawrapper(payload) {
      this.review.datawrapper = payload
    },
    downloadingData(payload) {
      if (payload == false) {
        this.review.download = false
        this.review.downloading = 0
      } else {
        this.review.downloading = payload
      }
    }
  },
  created() {
    var self = this
    // load data for view workflow
    if (!_.isNil(this.$route.query.id)) {
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
        self.error = true
      })
    }
  }
})
