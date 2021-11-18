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
      frequency: 'daily'
    },
    save: {
      active: false,
      name: null,
      description: null
    }
  },
  computed: {
    descriptor() {
      return {
        event: this.trigger.event,
        query: _.isUndefined(this.query) ? null : _.get(this.query.selected, 'name')
      }
    },
    build() {
      let obj = {
        trigger: this.trigger,
        active: this.save.active,
        name: this.save.name,
        description: this.save.description
      }
      if (!_.isEmpty(this.alert.id)) {
        obj.id = this.alert.id
      }
      if (!_.isUndefined(this.query) && !_.isNil(this.query.selected.id)) {
        obj.query = this.query.selected.id
      }
      return obj
    }
  },
  methods: {
    updateQuery(payload) {
      this.query = payload
    },
    submitProceed() {
      let endpoint = '/api/alert/create/'
      if (this.$route.query.action == 'edit') {
        endpoint = '/api/alert/edit/'
      }
      this.$store.dispatch('workflow/submit', {endpoint: endpoint, payload: this.build})
    },
    submit() {
      var self = this
      if (this.build.active == true) {
        axios.get('/api/user/active/alerts/count/active/')
        .then(function(response) {
          if (response.data >= MAX_ACTIVE_ALERTS) {
            self.$store.commit('auth/limit', true)
          } else {
            self.submitProceed()
          }
        })
        .catch(function(error) {
          console.error(error)
        })
      } else {
        this.submitProceed()
      }
    }
  },
  watch: {
    trigger: {
      deep: true,
      handler() {
        if (this.trigger.event == 'no_results' && this.trigger.frequency == 'daily') {
          this.trigger.frequency = 'weekly'
        }
      }
    },
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
    },
    descriptor: {
      deep: true,
      handler() {
        if (!_.isNull(this.descriptor.event) && !_.isNull(this.descriptor.query)) {
          this.save.name = this.descriptor.query
          if (this.descriptor.event == 'new_results') {
            this.save.name = 'New Results for ' + this.save.name
          }
        }
      }
    }
  },
  created() {
    var self = this
    this.$store.watch((state) => store.state.auth.profile.email, (newValue, oldValue) => {
      if (!_.isUndefined(newValue) && self.$store.getters['auth/isVerified']) {
        self.save.active = true
      } else {
        self.save.active = false
      }
    })
    // get query id
    if (!_.isNil(this.$route.query.query)) {
      this.query = {
        filters: {
          visibility: 'all',
          term: null
        },
        selected: {
          id: this.$route.query.query
        }
      }
    }
  }
})
