/* Data Store */

const store = new Vuex.Store({
  state: {
    tab: 'query',
    splash: false,
    embed: true,
    loading: false,
    loaded: false,
    waiting: false,
    error: false,
    results: null,
    query: {
      source: 'uuid',
      nodes: '',
      edges: '',
      json: '',
      string: ''
    },
    table: {
      cols: [],
      fcol: null,
      fvals: [],
      scol: null,
      sdir: 'asc',
      pag: 'yes',
      rows: 20
    },
    chart: {
      type: 'bar',
      x: null,
      y: null,
      agg: null,
      fcol: null,
      fvals: []
    },
    map: {
      unit: 'state',
      state: null,
      geo: null,
      col: null,
      agg: 'average'
    },
    definitions: {
      multi: ['cols', 'fvals'],
      int: ['rows', 'kcore']
    },
    output: {
      table: {},
      chart: {},
      map: {}
    }
  },
  getters: {
    querystring: (state) => {
      let settings = {}
      settings.tab = state.tab
      settings.flow = state.query.flow
      settings.source = state.query.source
      if (settings.source == 'uuid') {
        settings.nodes = state.query.nodes
        settings.edges = state.query.edges
      } else if (settings.source == 'config') {
        settings.string = state.query.string
      } else if (settings.source == 'json') {
        settings.json = state.query.json
      }
      if (state.tab == 'table') {
        settings.cols = state.table.cols
        settings.fcol = state.table.fcol
        if (!_.isNil(settings.fcol)) {
          settings.fvals = state.table.fvals
        }
        settings.scol = state.table.scol
        if (!_.isNil(settings.scol)) {
          settings.sdir = state.table.sdir
        }
        settings.pag = state.table.pag
        if (settings.pag == 'yes') {
          settings.rows = state.table.rows
        }
      } else if (state.tab == 'chart') {
        settings.type = state.chart.type
        settings.x = state.chart.x
        if (settings.type != 'hist') {
          settings.y = state.chart.y
        }
        settings.agg = state.chart.agg
        settings.fcol = state.chart.fcol
        if (!_.isNil(settings.fcol)) {
          settings.fvals = state.chart.fvals
        }
      } else if (state.tab == 'map') {
        settings.unit = state.map.unit
        if (settings.unit == 'zip') {
          settings.state = state.map.state
        }
        settings.geo = state.map.geo
        settings.col = state.map.col
        settings.agg = state.map.agg
      }
      let qs = ''
      _.forOwn(settings, function(v, k) {
        if (!_.isNil(v)) {
          qs += '&' + k + '=' + encodeURIComponent(v)
        }
      });
      return qs.replace('&','?')
    },
    sharelink: (state, getters) => {
      return ROOTURL + '/inspect/' + getters.querystring
    },
    embedcode: (state, getters) => {
      return '<iframe src="' + getters.sharelink + '&embed=true" width="100%" height="500" frameborder="0"></iframe>'
    }
  },
  mutations: {
    tab (state, payload) {
      state.tab = payload
    },
    embed (state, payload) {
      state.embed = payload
    },
    loading (state, payload) {
      state.loading = payload
    },
    loaded (state, payload) {
      state.loaded = payload
    },
    waiting (state, payload) {
      state.waiting = payload
    },
    error (state, payload) {
      state.error = payload
    },
    splash (state, payload) {
      state.splash = payload
    },
    config (state, payload) {
      // mark as loaded if no querystring or only tab
      if (_.isEmpty(payload) || _.isEqual(_.keys(payload), ['tab'])) {
        state.loaded = true
      } else {
        state.loading = true
      }
      // set query settings
      if (_.includes([undefined, 'query', 'table', 'chart', 'map'], payload.tab)) {
        _.forOwn(state.query, function(value, key) {
          if (!_.isNil(payload[key])) {
            state.query[key] = decodeURIComponent(payload[key])
          }
        });
      }
      // set viz settings
      if (_.includes(['table', 'chart', 'map'], payload.tab)) {
        state.tab = payload.tab
        _.forOwn(state[payload.tab], function(value, key) {
          if (!_.isNil(payload[key])) {
            state[payload.tab][key] = decodeURIComponent(payload[key])
            if (_.includes(state.definitions.multi, key)) {
              state[payload.tab][key] = state[payload.tab][key].split(',')
            }
            if (_.includes(state.definitions.int, key)) {
              state[payload.tab][key] = parseInt(state[payload.tab][key])
            }
          }
        });
      }
      // get query data and load viz
      if (!state.loaded) {
        axios.post('/api/inspect/', state.query)
        .then(function(response) {
          if (!_.isEmpty(response.data)) {
            state.results = response.data
            if (_.includes(['table', 'chart', 'map'], state.tab)) {
              let config = state[payload.tab]
              config.height = document.getElementById('plot').clientHeight*0.75
              axios.post('/render/' + state.tab + '/', {
                config: config,
                results: state.results
              })
              .then(function(response) {
                state.output[state.tab] = response.data
              })
              .catch(function(error) {
                console.error(error)
              })
            }
          }
        })
        .catch(function(error) {
          console.error(error)
        })
      }
    },
    submit (state, payload) {
      store.commit('waiting', true)
      store.commit('error', false)
      if (state.tab == 'query') {
        // get query data
        axios.post('/api/inspect/', payload)
        .then(function(response) {
          state.results = response.data
          state.query = payload
          store.commit('waiting', false)
          store.commit('error', false)
        })
        .catch(function(error) {
          console.error(error)
          store.commit('waiting', false)
          store.commit('error', true)
        })
      } else if (_.includes(['table', 'chart', 'map'], state.tab)) {
        // get chart object
        payload.height = document.getElementById('plot').clientHeight*0.75
        axios.post('/render/' + state.tab + '/', {
          config: payload,
          results: state.results
        })
        .then(function(response) {
          state.output[state.tab] = response.data
          state[state.tab] = payload
          store.commit('waiting', false)
          store.commit('error', false)
        })
        .catch(function(error) {
          console.error(error)
          store.commit('waiting', false)
          store.commit('error', true)
        })
      }
    }
  }
})

/* Initialize Components */

new Vue({
  el: '#sidebar-icons',
  store,
  components: {
    'multiselect': window.VueMultiselect.default,
    'typeahead': typeahead
  },
  data: {
    settings: {
      query: {},
      table: {},
      chart: {},
      map: {}
    },
    options: SIDEBAR_OPTIONS
  },
  computed: {
    tableFcol() {
      return this.settings.table.fcol
    },
    chartFcol() {
      return this.settings.chart.fcol
    },
    chartY() {
      return this.settings.chart.y
    },
    mapCol() {
      return this.settings.map.col
    }
  },
  watch: {
    tableFcol() {
      if (!_.isNil(this.tableFcol)) {
        var self = this
        axios.post('/calc/values/', {
          column: this.tableFcol.value,
          results: this.$store.state.results
        })
        .then(function(response) {
          self.options.table.fvals = response.data
        })
        .catch(function(error) {
          console.error(error)
        })
      }
    },
    chartFcol() {
      if (!_.isNil(this.chartFcol)) {
        var self = this
        axios.post('/calc/values/', {
          column: this.chartFcol.value,
          results: this.$store.state.results
        })
        .then(function(response) {
          self.options.chart.fvals = response.data
        })
        .catch(function(error) {
          console.error(error)
        })
      }
    },
    chartY() {
      if (!_.isNil(this.chartY)) {
        var self = this
        axios.post('/calc/aggs/', {
          column: this.chartY.value,
          results: this.$store.state.results
        })
        .then(function(response) {
          self.options.chart.agg = response.data
          if (!_.includes(self.options.chart.agg, self.settings.chart.agg)) {
            self.settings.chart.agg = null
          }
        })
        .catch(function(error) {
          console.error(error)
        })
      }
    },
    mapCol() {
      if (!_.isNil(this.mapCol)) {
        var self = this
        axios.post('/calc/aggs/', {
          column: this.mapCol.value,
          results: this.$store.state.results
        })
        .then(function(response) {
          self.options.map.agg = response.data
          if (!_.includes(self.options.map.agg, self.settings.map.agg)) {
            self.settings.map.agg = null
          }
        })
        .catch(function(error) {
          console.error(error)
        })
      }
    }
  },
  mounted() {
    this.$store.watch((state) => state.loaded, () => {
      // grab defaults from store
      var self = this
      _.forOwn(this.settings, function(setting, tab) {
        self.settings[tab] = _.cloneDeep(self.$store.state[tab])
        _.forOwn(self.options[tab], function(v, k) {
          if (!_.isNil(self.settings[tab][k])) {
            if (_.includes(self.$store.state.definitions.multi, k)) {
              _.forOwn(self.settings[tab][k], function(val, prop) {
                self.settings[tab][k][prop] = _.filter(self.options[tab][k], {value: val})[0]
              })
            } else {
              self.settings[tab][k] = _.filter(self.options[tab][k], {value: self.settings[tab][k]})[0]
            }
          }
        });
      });
    })
    this.$store.watch((state) => state.results, () => {
      var self = this
      axios.post('/calc/columns/', this.$store.state.results)
      .then(function(response) {
        // populate columns
        self.options.table.cols = response.data
        self.options.table.fcol = response.data
        self.options.table.scol = response.data
        self.options.chart.x = response.data
        self.options.chart.y = response.data
        self.options.chart.fcol = response.data
        self.options.map.geo = response.data
        self.options.map.col = response.data
        // mark as loaded
        self.$store.commit('loaded', true)
      })
      .catch(function(error) {
        console.error(error)
      })
    })
  },
  methods: {
    format(k) {
      let setting = _.cloneDeep(this.settings[this.$store.state.tab][k])
      // only transmit the value
      if (_.isArray(setting)) {
        setting = _.map(setting, 'value')
      } else if (!_.isNil(setting) && _.isObject(setting)) {
        setting = setting.value
      }
      // property format as single value or array
      if (_.isArray(setting) && !_.includes(this.$store.state.definitions.multi, k)) {
        setting = setting[0]
      }
      return setting
    },
    submit() {
      var self = this
      let settings = _.cloneDeep(this.settings[this.$store.state.tab])
      _.forOwn(self.options[self.$store.state.tab], function(v, k) {
        settings[k] = self.format(k)
      });
      store.commit('submit', settings)
    },
  }
})

new Vue({
  el: '#main-sidebar-icons',
  store,
  components: {
    'datatable': datatable,
    'plot': plot
  },
  data: {
    shareclick: false,
    embedclick: false
  },
  methods: {
    copy(payload, clickcallback) {
      // copy text
      let el = document.createElement('textarea');
      el.value = payload;
      el.setAttribute('readonly', '');
      el.style.position = 'absolute';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      // set button text
      var self = this
      self[clickcallback] = true;
      _.delay(function() {
        self[clickcallback] = false;
      }, 5000)
    }
  }
})

/* Initialize Modals */

new Vue({
  el: '#splash',
  store,
  components: {
    modal
  },
  methods: {
    cancel() {
      store.commit('splash', false)
    }
  }
})

/* Handle Routing */

const router = new VueRouter({
  mode: 'history',
  routes: []
})

new Vue({
  router,
  store,
  el: '#router',
  mounted() {
    // configure settings
    store.commit('config', this.$route.query)
    if (this.$route.query.embed != 'true') {
      store.commit('embed', false)
      if (this.$store.state.tab == 'query') {
        store.commit('splash', true)
      }
    }
  }
});

/* Loading Screen */
new Vue({
  store,
  el: '#loading'
});
