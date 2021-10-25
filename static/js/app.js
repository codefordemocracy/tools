/* Helper Functions */

var mailchimp = {}
function getMailchimp(json) {
  mailchimp = json
}

/* Initialize Elements */

new Vue({
  store,
  router,
  el: '#navbar',
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

new Vue({
  store,
  el: '#waitlist',
  data: {
    form: {
      b_b4403b081b3c5fd183e8f1f60_0a70f9292d: null,
      EMAIL: null,
      ORIGIN: 'Tools'
    },
    error: false,
    success: false
  },
  methods: {
    subscribe() {
      var self = this
      this.error = false
      this.$http.jsonp('https://codefordemocracy.us15.list-manage.com/subscribe/post-json?u=b4403b081b3c5fd183e8f1f60&id=0a70f9292d&c=getMailchimp', {
        params: this.form
      })
      .catch(function(response) {
        if (mailchimp.msg.includes('already subscribed') || mailchimp.result == 'success') {
          self.success = true
        } else {
          self.error = true
          console.error(mailchimp)
        }
      })
    }
  }
})

new Vue({
  store,
  el: '#login',
  methods: {
    close() {
      var self = this
      axios.get('/api/user/active/')
      .then(function(response) {
        self.$store.commit('auth/profile', response.data)
      })
      .catch(function(error) {
        console.error(error)
      })
      this.$store.commit('auth/login', false)
    }
  }
})

new Vue({
  store,
  el: '#logout',
  methods: {
    close() {
      var self = this
      axios.get('/api/user/active/')
      .then(function(response) {
        self.$store.commit('auth/profile', response.data)
      })
      .catch(function(error) {
        console.error(error)
      })
      this.$store.commit('auth/logout', false)
    }
  }
})

new Vue({
  store,
  el: '#verify',
  methods: {
    close() {
      var self = this
      axios.get('/api/user/active/')
      .then(function(response) {
        self.$store.commit('auth/profile', response.data)
      })
      .catch(function(error) {
        console.error(error)
      })
      this.$store.commit('auth/verify', false)
    }
  }
})

new Vue({
  store,
  el: '#limit',
  methods: {
    close() {
      this.$store.commit('auth/limit', false)
    }
  }
})
