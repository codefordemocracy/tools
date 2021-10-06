/* Initialize Elements */

new Vue({
  store,
  router,
  el: '#app',
  components: {
    'tabs': tabbed.tabs,
    'tab': tabbed.tab,
    'querysearcher': querysearcher
  },
  data: {
    alert: {
      id: null
    },
    query: undefined,
    trigger: {
      event: 'new_results',
      frequency: 'weekly'
    },
    save: {
      name: null,
      description: null
    }
  },
  computed: {
    build() {
      let obj = {
        trigger: this.trigger,
        name: this.save.name,
        description: this.save.description
      }
      if (!_.isEmpty(this.alert.id)) {
        obj.id = this.alert.id
      }
      if (!_.isNil(this.query)) {
        obj.query = this.query.selected.id
      }
      return obj
    }
  },
  methods: {
    updateQuery(payload) {
      this.query = payload
    },
    submit() {
      let endpoint = '/api/alert/create/'
      if (this.$route.query.action == 'edit') {
        endpoint = '/api/alert/edit/'
      }
      this.$store.dispatch('workflow/submit', {endpoint: endpoint, payload: this.build})
    }
  },
  watch: {
    build: {
      deep: true,
      handler() {
        store.commit('workflow/reset')
        store.commit('workflow/clear')
        // validate steps
        if (!_.isNil(this.query)) {
          store.commit('workflow/valid', 1)
          if (!_.isEmpty(this.trigger.event) && !_.isEmpty(this.trigger.frequency)) {
            store.commit('workflow/valid', 2)
            if (!_.isEmpty(this.save.name)) {
              store.commit('workflow/complete')
            }
          }
        }
      }
    }
  },
  created() {
    var self = this
    // get id for edit or clone workflow
    if (_.includes(['edit', 'clone'], this.$route.query.action) && !_.isNil(this.$route.query.id)) {
      this.alert.id = this.$route.query.id
    }
    // load data for edit or clone workflow
    if (!_.isNil(this.$route.query.id)) {
      axios.post('/api/alert/meta/', {id: this.$route.query.id})
      .then(function(response) {
        self.query = {
          filters: {
            visibility: 'all',
            term: null
          },
          selected: {
            id: response.data.query
          }
        }
        self.trigger = response.data.trigger
        self.save.name = response.data.name
        self.save.description = response.data.description
      })
      .catch(function(error) {
        console.error(error)
      })
    }
  }
})
