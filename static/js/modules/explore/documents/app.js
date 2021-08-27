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

/* Initialize Components */

new Vue({
  store,
  el: '#main',
  components: {
    'datepicker': vuejsDatepicker,
    'typeahead': typeahead,
    'plot': plot
  },
  data: {
    disabledDates: DATERANGES.disabledDates.documents,
    documents: 'articles',
    group: 'questionable',
    dates: DATERANGES.dates.documents,
    term: null
  },
  computed: {
    button() {
      if (this.$store.state.explore.loading) {
        return "Loading..."
      }
      else if (this.$store.state.explore.first) {
        return "Update"
      }
      else {
        return "Search"
      }
    },
    plot() {
      return {
        data: [
          {
            x: _.map(store.state.explore.histogram, 'key_as_string'),
            y: _.map(store.state.explore.histogram, 'doc_count'),
            type: "bar",
            marker: {
              color: '#e5e5e5'
            }
          }
        ],
        layout: {
          height: 225,
          xaxis: {
            linecolor: '#e5e5e5',
            showgrid: false,
            showticklabels: false,
            fixedrange: true
          },
          yaxis: {
            zeroline: false,
            showgrid: false,
            showticklabels: false,
            fixedrange: true
          },
          margin: {
            l: 25,
            r: 25,
            t: 20,
            b: 30
          }
        },
        config: {
          displayModeBar: false,
          responsive: true
        },
      }
    }
  },
  watch: {
    documents: function (val) {
      if (val == 'articles') {
        this.group = 'questionable'
      } else if (val == 'tweets') {
        this.group = 'dem'
      } else if (val == 'ads') {
        this.group = 'facebook'
      }
    }
  },
  methods: {
    search(page) {
      // update settings
      store.commit('explore/results', [])
      store.commit('explore/loading', true)
      store.commit('explore/loaded', false)
      store.commit('explore/error', false)
      store.commit('explore/search', {
        documents: this.documents,
        group: this.group,
        term: this.term,
        dates: {
          min: moment(this.dates.min, 'YYYY-MM-DD').format('YYYY-MM-DD'),
          max: moment(this.dates.max, 'YYYY-MM-DD').format('YYYY-MM-DD')
        },
        skip: page*10,
        limit: 10
      })
      store.commit('explore/page', page)
      // get documents data
      axios.post('/api/browse/documents/', this.$store.state.explore.search)
      .then(function(response) {
        store.commit('explore/results', response.data)
        store.commit('explore/loading', false)
        store.commit('explore/loaded', true)
      })
      .catch(function(error) {
        console.error(error)
        store.commit('explore/error', true)
        store.commit('explore/loading', false)
        store.commit('explore/loaded', true)
      })
      // get histogram data
      if (page == 0) {
        store.commit('explore/histogram', [])
        axios.post('/api/browse/histogram/', this.$store.state.explore.search)
        .then(function(response) {
          store.commit('explore/histogram', response.data)
        })
        .catch(function(error) {
          console.error(error)
          store.commit('explore/error', true)
        })
      }
    }
  }
})
