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
    copied: false,
    list: {},
    review: {
      count: -1,
      download: false,
      downloading: 0
    }
  },
  computed: {
    ratio() {
      if (_.includes(document.referrer, 'codefordemocracy.org') || _.includes(document.referrer, '127.0.0.1')) {
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
    copy() {
      var self = this
      GENSHARELINK(this.$route)
      this.copied = true;
      _.delay(function() {
        self.copied = false;
      }, 3000)
    }
  },
  created() {
    var self = this
    // load data for view workflow
    if (!_.isNil(this.$route.query.id)) {
      axios.post('/api/list/meta/', this.$route.query)
      .then(function(response) {
        self.list = response.data
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
