/* Data Store */

const store = new Vuex.Store({
  state: {
    branches: [],
    search: ['candidate', 'committee', 'donor', 'payee', 'tweeter', 'source', 'buyer', 'page'],
    associations: {
      candidate: ['committee', 'tweeter'],
      committee: ['candidate', 'committee', 'donor', 'payee'],
      donor: ['committee'],
      payee: ['committee'],
      tweeter: ['candidate', 'source'],
      source: ['tweeter'],
      buyer: ['page'],
      page: ['buyer'],
      ad: [],
      tweet: [],
      contribution: [],
      expenditure: []
    },
    intersections: ['candidate', 'committee', 'donor', 'payee', 'tweeter', 'source', 'buyer', 'page'],
    intermediaries: {
      candidate: {
        committee: 'expenditure'
      },
      committee: {
        committee: ['contribution', 'candidate'],
        candidate: 'expenditure',
        donor: 'contribution',
        payee: 'expenditure'
      },
      donor: {
        committee: 'contribution'
      },
      payee: {
        committee: 'expenditure'
      },
      tweeter: {
        candidate: null,
        source: 'tweet'
      },
      source: {
        tweeter: 'tweet'
      },
      buyer: {
        page: 'ad'
      },
      page: {
        buyer: 'ad'
      },
      ad: {},
      tweet: {},
      contribution: {},
      expenditure: {}
    },
    expansions: ['contribution']
  },
  mutations: {
    start (state, payload) {
      state.branches.push({
        id: _.uniqueId(),
        settings: payload,
        branches: []
      })
    },
    clear (state) {
      state.branches = []
    }
  }
})

/* Handle Routing */

const router = new VueRouter({
  mode: 'history',
  routes: []
})

/* Initialize Components */

Vue.component('datepicker', vuejsDatepicker)

Vue.component('modal', modal)
Vue.component('typeahead', typeahead)
Vue.component('dropdown', dropdown)
Vue.component('matches', matches)
Vue.component('actions', actions)
Vue.component('branch', branch)
Vue.component('block', block)

Vue.component('overview', overview)
Vue.component('associations-results-candidate-committee', associations_results_candidate_committee)
Vue.component('associations-results-committee-committee', associations_results_committee_committee)
Vue.component('associations-results', associations_results)
Vue.component('associations-details', associations_details)
Vue.component('intersection-settings', intersection_settings)
Vue.component('intersection-results-candidate-committee', intersection_results_candidate_committee)
Vue.component('intersection-results-committee-committee', intersection_results_committee_committee)
Vue.component('intersection-results', intersection_results)
Vue.component('intersection-details', intersection_details)
Vue.component('contribution', contribution)

new Vue({
  el: '#main',
  router,
  store,
  data: {
    entity: 'candidate',
    term: ''
  },
  watch: {
    entity(newVal, oldVal) {
      if (oldVal != 'candidate' && newVal != this.$route.query.term){
        this.term = ''
      }
    }
  },
  methods: {
    search() {
      store.commit('start', {template: 'overview', entity: this.entity, term: this.term})
    },
    clear() {
      store.commit('clear')
    }
  },
  created() {
    if (!_.isUndefined(this.$route.query.entity) && !_.isUndefined(this.$route.query.term)) {
      this.entity = this.$route.query.entity
      this.term = this.$route.query.term
    }
  }
})
