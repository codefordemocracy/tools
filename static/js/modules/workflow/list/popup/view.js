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
    'listdisplayer': listdisplayer,
    'listreviewer': listreviewer
  },
  data: {
    loaded: false,
    error: false,
    list: {},
    review: {
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
    downloadingEntities(payload) {
      if (payload == false) {
        this.review.download = false
        this.review.downloading = 0
      } else {
        this.review.downloading = payload
      }
    },
    countEntities(payload) {
      this.review.count = payload
    },
  },
  created() {
    var self = this
    // load data for view workflow
    if (!_.isUndefined(this.$route.query.id)) {
      axios.post('/api/list/meta/', {id: this.$route.query.id})
      .then(function(response) {
        self.list = response.data
        self.loaded = true
      })
      .catch(function(error) {
        console.error(error)
        self.error = true
      })
    }
  }
})
