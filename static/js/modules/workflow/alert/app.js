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
      if (!_.isUndefined(this.query)) {
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
        // validate
        if (!_.isUndefined(this.query)) {
          store.commit('workflow/valid', 1)
        }
        if (!_.isEmpty(this.trigger.event) && !_.isEmpty(this.trigger.frequency)) {
          store.commit('workflow/valid', 2)
        }
        if (!_.isEmpty(this.save.name) && !_.isEmpty(this.save.description)) {
          store.commit('workflow/complete')
        }
      }
    }
  }
})
