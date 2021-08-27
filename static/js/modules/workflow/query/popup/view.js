/* Initialize Store */

const store = new Vuex.Store({
  modules: {
    auth: authStore,
    waitquery: waitqueryStore
  }
})

/* Initialize Components */

new Vue({
  store,
  router,
  el: '#main',
  components: {
    'querydisplayer': querydisplayer
  },
  data: {
    query: {}
  },
  computed: {
    ratio() {
      if (this.$route.query.mode == 'popup') {
        return 1
      }
    }
  },
  created() {
    var self = this
    // load data for view workflow
    if (!_.isUndefined(this.$route.query.id)) {
      axios.post('/api/query/meta/', {id: this.$route.query.id})
      .then(function(response) {
        self.query = response.data
      })
      .catch(function(error) {
        console.error(error)
      })
    }
  }
})
