/* Initialize Store */

const exploreStore = {
  namespaced: true,
  state: () => ({
    search: {},
    histogram: [],
    results: [],
    page: 0,
    first: false,
    loaded: false,
    loading: false,
    error: false
  }),
  mutations: {
    search (state, payload) {
      state.search = payload
    },
    histogram (state, payload) {
      state.histogram = payload
    },
    results (state, payload) {
      state.results = payload
      if (!_.isEmpty(payload)) {
        state.first = true
      }
    },
    page (state, payload) {
      state.page = payload
    },
    loaded (state, payload) {
      state.loaded = payload
    },
    loading (state, payload) {
      state.loading = payload
    },
    error (state, payload) {
      state.error = payload
    }
  }
}

const store = new Vuex.Store({
  modules: {
    auth: authStore,
    waitlist: waitlistStore,
    explore: exploreStore
  }
})

/* Initialize Elements */

new Vue({
  store,
  el: '#topbar',
  data: {
    open: false
  },
  created() {
    var self = this
    axios.get('/api/user/active/')
    .then(function(response) {
      self.$store.commit('auth/profile', response.data)
    })
    .catch(function(error) {
      console.error(error)
    })
  }
})
