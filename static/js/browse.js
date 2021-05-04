/* Data Store */

const store = new Vuex.Store({
  state: {
    search: {},
    histogram: [],
    results: [],
    page: 0,
    first: false,
    loaded: false,
    loading: false,
    error: false
  },
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
})

/* Initialize Components */

new Vue({
  el: '#main',
  store,
  components: {
    'datepicker': vuejsDatepicker,
    'typeahead': typeahead,
    'plot': plot
  },
  data: {
    disabledDates: DATERANGES.dates.elastic,
    documents: 'articles',
    group: 'questionable',
    dates: DATERANGES.dates.elastic,
    term: null
  },
  computed: {
    button() {
      if (this.$store.state.loading) {
        return "Loading..."
      }
      else if (this.$store.state.first) {
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
            x: _.map(store.state.histogram, 'key_as_string'),
            y: _.map(store.state.histogram, 'doc_count'),
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
      store.commit('results', [])
      store.commit('loading', true)
      store.commit('loaded', false)
      store.commit('error', false)
      store.commit('search', {
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
      store.commit('page', page)
      // get documents data
      axios.post('/api/browse/documents/', this.$store.state.search)
      .then(function(response) {
        store.commit('results', response.data)
        store.commit('loading', false)
        store.commit('loaded', true)
      })
      .catch(function(error) {
        console.error(error)
        store.commit('error', true)
        store.commit('loading', false)
        store.commit('loaded', true)
      })
      // get histogram data
      if (page == 0) {
        store.commit('histogram', [])
        axios.post('/api/browse/histogram/', this.$store.state.search)
        .then(function(response) {
          store.commit('histogram', response.data)
        })
        .catch(function(error) {
          console.error(error)
          store.commit('error', true)
        })
      }
    }
  }
})
