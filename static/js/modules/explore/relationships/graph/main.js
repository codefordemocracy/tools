/* Initialize Store */

const exploreStore = {
  namespaced: true,
  state: () => ({
      step: 'intro',
      flow: null,
      advanced: false,
      loading: false,
      loaded: false,
      waiting: false,
      error: false,
      tab: 'details',
      elements: [],
      selected: [],
      lastaction: null,
      diff: {
          oldElementIds: [],
          newElementIds: [],
          idsToAdd: [],
          idsToRemove: [],
          elementsToAdd: [],
          elementsToRemove: []
      },
      filter: {},
      layout: 'cose',
      relayout: false,
      fit: false,
      png: false,
      json: false,
      viewkey: false,
      runphysics: false,
      expandnode: false,
      smartselect: false,
      uncovercontributors: false,
  }),
  getters: {
      type: (state) => {
          if (state.selected.length > 0) {
              groups = _.uniq(_.map(state.selected, 'group'))
              if (groups.length == 1) {
                  let type = groups[0].slice(0, -1)
                  type = type.charAt(0).toUpperCase() + type.substring(1);
                  if (state.selected.length > 1) {
                      type = type + 's'
                  }
                  return type;
              }
          }
          return 'Elements'
      },
      labels: (state) => {
          return _.uniq(_.map(state.selected, 'data.label'))
      },
      dataelements: (state) => {
          let eles = _.cloneDeep(state.elements)
          return _.map(eles, function(ele) {
              return ele.data
          })
      },
      flatelements: (state) => {
          let eles = _.cloneDeep(state.elements)
          return _.map(eles, function(ele) {
              return _.omit(_.merge(ele.data.properties, ele.data), 'properties')
          })
      },
      flatselected: (state) => {
          let eles = _.cloneDeep(state.selected)
          return _.map(eles, function(ele) {
              return _.omit(_.merge(ele.data.properties, ele.data), 'properties')
          })
      },
      graphstring: (state, getters) => {
          let nodes = _.compact(_.map(_.filter(getters.flatelements, { element: 'node' }), 'uuid'))
          let edges = _.compact(_.map(_.filter(getters.flatelements, { element: 'edge' }), 'uuid'))
          let graphstring = ""
          if (nodes.length > 0) {
              graphstring += "&nodes="
              graphstring += _.join(nodes, ',')
          }
          if (edges.length > 0) {
              graphstring += "&edges="
              graphstring += _.join(edges, ',')
          }
          return graphstring
      },
      hasedge: (state, getters) => {
          // checks if 2 nodes are connected by an edge
          if (state.selected.length == 2 && getters.type == 'Nodes') {
              let ids = _.map(state.selected, 'data.id')
              let connections = _.uniq(_.map(state.elements, function(ele) {
                  if (ele.data.source == ids[0]) { return ele.data.target } else if (ele.data.target == ids[0]) { return ele.data.source }
                  return false
              }))
              return _.includes(connections, ids[1])
          }
          return false
      },
      stats: (state, getters) => {
          // helper functions to create each stat
          let makehistogram = function(elements, key) {
              let c = {
                  label: key,
                  type: 'histogram',
                  statdata: {
                      labels: [],
                      values: []
                  }
              }
              _.forEach(elements, function(i) {
                  c.statdata.labels.push(i.value)
                  c.statdata.values.push(i.count)
              })
              return c
          }
          let makestackbar = function(elements, key) {
                  let total = _.sum(_.map(elements, 'count'))
                  let c = {
                      label: key,
                      type: 'stackbar',
                      statdata: {
                          pairs: []
                      }
                  }
                  _.forEach(elements, function(i) {
                      c.statdata.pairs.push({
                          label: i.value,
                          value: Math.round(i.count / total * 100)
                      })
                  })
                  return c
              }
              // helper function to transform keys and values
          let makevalues = function(elements) {
                  let keys = _.without(_.uniq(_.flatMap(elements, function(ele) { return _.keys(ele) })), 'element', 'id', 'source', 'target')
                  let values = _.map(keys, function(k) {
                      return {
                          key: k,
                          values: _.map(_.countBy(elements, k), function(count, value) {
                              return { value: value, count: count }
                          })
                      }
                  })
                  return values
              }
              // helper function to create the stats
          let makestats = function(elements) {
              let stats = []
              _.forEach(makevalues(elements), function(obj) {
                  let v = _.sortBy(_.filter(obj.values, function(o) { return (o.value != 'undefined' && !_.isEmpty(o.value)) }), 'value')
                  if ((v.length > 0 && v.length <= 8 && obj.key != 'datetime') || (obj.key == 'type' || obj.key == 'labels')) {
                      stats.push(makestackbar(v, obj.key))
                  } else if (obj.key == 'datetime' || (_.sum(_.map(v, 'value')) > 0 && _.max(_.map(v, 'count')) > 1)) {
                      stats.push(makehistogram(v, obj.key))
                  }
              })
              return stats
          }
          let nodes = _.filter(getters.flatelements, { element: 'node' })
          let edges = _.filter(getters.flatelements, { element: 'edge' })
          return [{
              label: 'nodes',
              count: _.size(nodes),
              stats: makestats(nodes)
          }, {
              label: 'edges',
              count: _.size(edges),
              stats: makestats(edges)
          }]
      }
  },
  mutations: {
      step(state, payload) {
          state.step = payload
      },
      flow(state, payload) {
          state.flow = payload
      },
      advanced(state, payload) {
          state.advanced = payload
      },
      loading(state, payload) {
          state.loading = payload
      },
      loaded(state, payload) {
          state.loaded = payload
      },
      waiting(state, payload) {
          state.waiting = payload
      },
      error(state, payload) {
          state.error = payload
      },
      tab(state, payload) {
          state.tab = payload
      },
      add(state, payload) {
          state.elements = _.concat(state.elements, payload)
          state.lastaction = 'add'
      },
      delete(state) {
          if (state.selected.length > 0) {
              selectedIds = _.map(state.selected, 'data.id')
              state.elements = _.filter(state.elements, function(ele) {
                  return (_.includes(selectedIds, ele.data.id) == false &&
                      _.includes(selectedIds, ele.data.source) == false &&
                      _.includes(selectedIds, ele.data.target) == false)
              })
              state.lastaction = 'delete'
          }
      },
      undo(state, payload) {
          if (payload == 'add') {
              addedIds = _.map(state.diff.elementsToAdd, 'data.id')
              state.elements = _.filter(state.elements, function(ele) {
                  return (_.includes(addedIds, ele.data.id) == false &&
                      _.includes(addedIds, ele.data.source) == false &&
                      _.includes(addedIds, ele.data.target) == false)
              })
              state.lastaction = 'delete'
          } else if (payload == 'delete') {
              state.elements = _.concat(state.elements, state.diff.elementsToRemove)
              state.lastaction = 'add'
          }
      },
      diff(state, payload) {
          oldElementIds = _.map(payload.oldElements, 'data.id')
          newElementIds = _.map(payload.newElements, 'data.id')
          idsToAdd = _.difference(newElementIds, oldElementIds)
          idsToRemove = _.difference(oldElementIds, newElementIds)
          elementsToAdd = _.filter(payload.newElements, function(ele) {
              return _.includes(idsToAdd, ele.data.id)
          })
          elementsToRemove = _.filter(payload.oldElements, function(ele) {
              return _.includes(idsToRemove, ele.data.id)
          })
          state.diff = {
              oldElementIds: oldElementIds,
              newElementIds: newElementIds,
              idsToAdd: idsToAdd,
              idsToRemove: idsToRemove,
              elementsToAdd: elementsToAdd,
              elementsToRemove: elementsToRemove
          }
      },
      clear(state) {
          state.elements = []
      },
      select(state, payload) {
          state.selected = payload
      },
      filter(state, payload) {
          state.filter = payload
      },
      layout(state, payload) {
          state.layout = payload
      },
      relayout(state, payload) {
          state.relayout = payload
      },
      fit(state, payload) {
          state.fit = payload
      },
      png(state, payload) {
          state.png = payload
      },
      json(state, payload) {
          state.json = payload
      },
      viewkey(state, payload) {
          state.viewkey = payload
      },
      runphysics(state, payload) {
          state.runphysics = payload
      },
      expandnode(state, payload) {
          state.expandnode = payload
      },
      uncovercontributors(state, payload) {
          state.uncovercontributors = payload
      },
      smartselect(state, payload) {
          state.smartselect = payload
      }
  }
}

/* Data Store */

const store = new Vuex.Store({
  modules: {
    auth: authStore,
    waitlist: waitlistStore,
    explore: exploreStore
  }
})

/* Helper Functions */

const mapLabels = function(payload) {
    let labels = _.keys(_.pickBy(payload, _.identity));
    return _.map(labels, function(x) { return _.startCase(x) });
}

const addData = function(payload) {
    axios.post('/api/graph/', payload)
        .then(function(response) {
            store.commit('explore/add', response.data)
            store.commit('explore/waiting', false)
            store.commit('explore/error', false)
            store.commit('explore/loaded', true)
        })
        .catch(function(error) {
            console.error(error)
            store.commit('explore/waiting', false)
            store.commit('explore/error', true)
        })
}

/* Initialize Components */

new Vue({
    el: '#right',
    store,
    components: {
        'network': network
    }
})

new Vue({
    el: '#box',
    store,
    components: {
        'tabs': tabbed.tabs,
        'tab': tabbed.tab,
        'histogram-stat': stat.histogram,
        'stackbar-stat': stat.stackbar
    },
    data: {
        stats: [],
        numnodes: 0,
        numedges: 0
    },
    methods: {
      change(name) {
        store.commit('explore/tab', _.lowerCase(name))
      }
    },
    mounted() {
        this.$store.watch((state) => state.explore.elements, () => {
            this.stats = this.$store.getters['explore/stats']
            this.numnodes = _.filter(this.stats, { label: 'nodes' })[0].count,
                this.numedges = _.filter(this.stats, { label: 'edges' })[0].count
        })
    }
})

new Vue({
    el: '#leftbar',
    components: {
        'datepicker': vuejsDatepicker,
        'toggle': toggle,
        'typeahead': typeahead
    },
    data: {
        disabledDates: DATERANGES.disabledDates.datasets,
        search: {
            candidates: {
                cand_name: '',
                cand_pty_affiliation: null,
                cand_office: null,
                cand_office_st: null,
                cand_office_district: null,
                cand_ici: null,
                cand_election_yr: '',
            },
            committees: {
                cmte_nm: '',
                cmte_pty_affiliation: null,
                cmte_dsgn: null,
                cmte_tp: null,
                org_tp: null
            },
            donors: {
                name: '',
                employer: '',
                occupation: '',
                entity_tp: null,
                state: null,
                zip_code: ''
            },
            payees: {
                name: ''
            },
            sources: {
                domain: '',
                bias_score: {
                    liberal: true,
                    left: true,
                    moderate: true,
                    right: true,
                    conservative: true
                },
                factually_questionable_flag: false,
                conspiracy_flag: false,
                hate_group_flag: false,
                propaganda_flag: false,
                satire_flag: false
            },
            buyers: {
                name: ''
            },
            pages: {
                name: ''
            },
            tweeters: {
                username: ''
            },
            dates: DATERANGES.dates.fixed,
            pagination: {
                limit: 30,
                page: 1
            },
            options: {
                context: true
            }
        }
    },
    methods: {
        submit() {
            store.commit('explore/waiting', true)
            store.commit('explore/error', false)
            addData({
                type: 'search',
                flow: store.state.explore.flow,
                parameters: this.search[store.state.explore.flow],
                dates: {
                    min: moment(this.search.dates.min, 'YYYY-MM-DD').toDate(),
                    max: moment(this.search.dates.max, 'YYYY-MM-DD').toDate()
                },
                pagination: this.search.pagination,
                options: this.search.options
            })
            store.commit('explore/step', 'results')
        }
    }
})

/* Initialize Modals */

new Vue({
    el: '#viewkey',
    components: {
        'modal': modal
    },
    methods: {
        cancel() {
            store.commit('explore/viewkey', false)
        }
    }
})

new Vue({
    el: '#runphysics',
    store,
    components: {
        'modal': modal
    },
    data: {
        layout: store.state.explore.layout
    },
    methods: {
        cancel() {
            store.commit('explore/runphysics', false)
        },
        submit() {
            store.commit('explore/layout', this.layout);
            store.commit('explore/relayout', true);
            this.cancel()
        }
    }
})

new Vue({
    el: '#expandnode',
    components: {
        'modal': modal,
        'toggle': toggle
    },
    data: {
        labels: {
            candidate: true,
            committee: true,
            donor: true,
            employer: true,
            job: true,
            contribution: true,
            expenditure: true,
            payee: true,
            party: true,
            race: true,
            tweeter: true,
            tweet: true,
            hashtag: true,
            annotation: true,
            link: true,
            domain: true,
            source: true,
            ad: true,
            message: true,
            buyer: true,
            page: true,
            zip: true,
            state: true,
            year: true,
            month: true,
            day: true
        },
        pagination: {
            limit: 30,
            page: 1
        }
    },
    methods: {
        all(value) {
            var self = this
            _.forEach(_.keys(this.labels), function(k) {
                self.labels[k] = value
            })
        },
        cancel() {
            store.commit('explore/expandnode', false)
        },
        submit() {
            store.commit('explore/waiting', true)
            store.commit('explore/error', false)
            addData({
                type: 'expandnode',
                labels: mapLabels(this.labels),
                ids: _.map(store.state.explore.selected, function(i) {
                  return parseInt(i.data.id)
                }),
                pagination: this.pagination
            })
            store.commit('explore/step', 'actions')
            store.commit('explore/flow', 'expand node')
            this.cancel()
        }
    }
})

new Vue({
    el: '#uncovercontributors',
    components: {
        'modal': modal,
        'toggle': toggle,
        'datepicker': vuejsDatepicker,
    },
    data: {
        labels: {
            committee: true,
            donor: true
        },
        min_transaction_amt: 5000,
        pagination: {
            limit: 30,
            page: 1
        },
        disabledDates: DATERANGES.disabledDates.datasets,
        dates: DATERANGES.dates.fixed,
    },
    methods: {
        all(value) {
            var self = this
            _.forEach(_.keys(this.labels), function(k) {
                self.labels[k] = value
            })
        },
        cancel() {
            store.commit('explore/uncovercontributors', false)
        },
        submit() {
            store.commit('explore/waiting', true)
            store.commit('explore/error', false)
            addData({
                type: 'uncovercontributors',
                labels: mapLabels(this.labels),
                ids: _.map(store.state.explore.selected, function(i) {
                  return parseInt(i.data.id)
                }),
                dates: {
                    min: moment(this.dates.min, 'YYYY-MM-DD').toDate(),
                    max: moment(this.dates.max, 'YYYY-MM-DD').toDate()
                },
                min_transaction_amt: this.min_transaction_amt,
                pagination: this.pagination
            })
            store.commit('explore/step', 'actions')
            store.commit('explore/flow', 'uncover contributors')
            this.cancel()
        }
    }
})

new Vue({
    el: '#smartselect',
    components: {
        'modal': modal,
        'toggle': toggle
    },
    data: {
        filter: {
            type: 'degree',
            degree: 2,
            labels: {
                candidate: false,
                committee: true,
                donor: false,
                employer: false,
                job: false,
                contribution: false,
                expenditure: false,
                payee: false,
                party: false,
                race: false,
                tweeter: false,
                tweet: false,
                hashtag: false,
                annotation: false,
                link: false,
                domain: false,
                source: false,
                ad: false,
                message: false,
                buyer: false,
                page: false,
                zip: false,
                state: false,
                year: false,
                month: false,
                day: false
            },
        }
    },
    methods: {
        all(value) {
            var self = this
            _.forEach(_.keys(this.filter.labels), function(k) {
                self.filter.labels[k] = value
            })
        },
        cancel() {
            store.commit('explore/smartselect', false)
        },
        submit() {
            let filter = _.clone(this.filter)
            filter.labels = mapLabels(filter.labels)
            store.commit('explore/filter', filter)
            store.commit('explore/step', 'manipulations')
            store.commit('explore/flow', 'smart select')
            this.cancel()
        }
    }
})

/* Handle Routing */

new Vue({
    router,
    store,
    el: '#router',
    mounted() {
        let nodes = this.$route.query.nodes
        let edges = this.$route.query.edges
        if (!_.isNil(nodes) || !_.isNil(edges)) {
            store.commit('explore/loading', true)
            addData({ type: 'ids', nodes: _.split(nodes, ','), edges: _.split(edges, ',') })
            store.commit('explore/step', 'start')
        }
    },
});

/* Loading Screen */
new Vue({
    store,
    el: '#loading'
});
