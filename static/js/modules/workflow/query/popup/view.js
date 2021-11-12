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
    copied: false,
    query: {},
    results: {
      count: -1,
      download: false,
      downloading: 0
    }
  },
  computed: {
    ratio() {
      if (_.includes(document.referrer, 'tools.codefordemocracy.org')) {
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
    },
    copy() {
      var self = this
      GENSHARELINK(this.$route)
      this.copied = true;
      _.delay(function() {
        self.copied = false;
      }, 3000)
    },
    loadObject() {
      var self = this
      axios.post('/api/query/meta/', this.$route.query)
      .then(function(response) {
        self.query = response.data
        if (!_.isEmpty(self.query) && !_.isNil(self.$route.query.freshness)) {
          self.query.freshness = _.replace(self.$route.query.freshness, ' ', '+')
        }
        if (!_.isUndefined(response.data.name) && _.startsWith(document.title, 'View Query | ')) {
          document.title = response.data.name + " | " + document.title
        }
        self.loaded = true
      })
      .catch(function(error) {
        console.error(error)
        self.error = true
      })
    }
  },
  created() {
    var self = this
    // load data for view workflow
    if (!_.isNil(this.$route.query.id)) {
      this.loadObject()
    }
    this.$store.watch((state) => store.state.auth.profile.email, (newValue, oldValue) => {
      if (_.isEmpty(self.query)) {
        self.loaded = false
        self.loadObject()
      }
    })
  }
})
