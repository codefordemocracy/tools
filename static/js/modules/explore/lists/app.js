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
    'listsearcher': listsearcher
  },
  data: {
    type: 'organization',
    subtype: 'committee',
    list: null
  },
  computed: {
    types() {
      return ['person', 'organization', 'job', 'topic']
    },
    subtypes() {
      if (this.type == 'person') {
        return ['candidate', 'donor']
      } else if (this.type == 'organization') {
        return ['committee', 'employer']
      }
      return [this.type]
    },
    ratio() {
      if (_.includes(document.referrer, 'tools.codefordemocracy.org')) {
        return 1
      }
    }
  },
  methods: {
    sync(payload) {
      this.list = payload.selected
    }
  },
  watch: {
    type() {
      this.subtype = this.subtypes[0]
    }
  }
})
