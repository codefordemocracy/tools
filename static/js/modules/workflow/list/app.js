/* Initialize Elements */

new Vue({
  store,
  router,
  el: '#app',
  components: {
    'tabs': tabbed.tabs,
    'tab': tabbed.tab
  },
  data: {
    list: {
      type: null,
      subtype: null,
      include: {
        terms: null,
        ids: null
      },
      visibility: 'hidden',
      name: null,
      description: null
    },
    preview: []
  },
  computed: {
    subtypes() {
      if (this.list.type == 'person') {
        return ['candidate', 'donor']
      } else if (this.list.type == 'organization') {
        return ['committee', 'employer']
      }
      return []
    },
    placeholder() {
      if (this.list.subtype == 'committee') {
        return {
          terms: 'Victory Fund, Leadership Committee, Joint Fundraising, ...',
          ids: `C00000935
C00075820
C00042366
C00027466
...
          `
        }
      } else if (this.list.subtype == 'employer') {
        return {
          terms: 'Hospital, Bank, ...',
          ids: ''
        }
      } else if (this.list.subtype == 'job') {
        return {
          terms: 'Doctor, Software Engineer, Realtor, ...',
          ids: ''
        }
      } else if (this.list.subtype == 'topic') {
        return {
          terms: 'Finance, Defense, Healthcare, ...',
          ids: 'LAW, BUD, NAT, HCR, MMM, AVI, EDU, ...'
        }
      }
      return ''
    },
    build() {
      let obj = _.cloneDeep(this.list)
      if (!_.isNil(obj.include.terms)) {
        obj.include.terms = _.map(_.split(obj.include.terms, ','))
      }
      if (!_.isNil(obj.include.ids)) {
        obj.include.ids = _.map(_.split(obj.include.ids, '\n'))
      }
      return obj
    },
  },
  methods: {
    peek() {
      var self = this
      // get preview
      axios.post('/api/list/preview/', this.build)
      .then(function(response) {
        self.preview = response.data
      })
      .catch(function(error) {
        console.error(error)
      })
    },
    submit() {
      let endpoint = '/api/list/create/'
      if (this.$route.query.action == 'edit') {
        endpoint = '/api/list/edit/'
      }
      this.$store.dispatch('workflow/submit', {endpoint: endpoint, payload: this.build})
    }
  },
  watch: {
    list: {
      deep: true,
      handler() {
        store.commit('workflow/reset')
        store.commit('workflow/clear')
        // set properties based on type
        if (_.includes(['job', 'topic'], this.list.type)) {
          this.list.subtype = this.list.type
        } else if (!_.isNull(this.list.subtype) && !_.includes(this.subtypes, this.list.subtype)) {
          this.list.subtype = null
        }
        // set properties based on subtype
        if (_.includes(['donor', 'employer', 'job'], this.list.subtype)) {
          this.list.include.ids = null
        }
        // validate and preview
        if (!_.isNull(this.list.type)) {
          store.commit('workflow/valid', 1)
        }
        if (!_.isEmpty(this.list.subtype) && !(_.isEmpty(_.get(this.list.include, 'terms')) && _.isEmpty(_.get(this.list.include, 'ids')))) {
          this.slowpeek()
          store.commit('workflow/valid', 2)
          store.commit('workflow/valid', 3)
          store.commit('workflow/valid', 4)
        }
        if (!_.isEmpty(this.list.visibility) && !_.isEmpty(this.list.name) && !_.isEmpty(this.list.description)) {
          store.commit('workflow/complete')
        }
      }
    }
  },
  created() {
    var self = this
    // create debounced preview function for new lists
    this.slowpeek = _.debounce(this.peek, 2000)
    // get id for edit or clone workflow
    if (_.includes(['edit', 'clone'], this.$route.query.action) && !_.isUndefined(this.$route.query.id)) {
      this.list.id = this.$route.query.id
    }
    // load data for view workflow
    if (!_.isUndefined(this.$route.query.id)) {
      axios.post('/api/list/meta/', {id: this.$route.query.id})
      .then(function(response) {
        self.list = response.data
        if (!_.isNil(self.list.include.terms)) {
          self.list.include.terms = self.list.include.terms.join(', ')
        }
        if (!_.isNil(self.list.include.ids)) {
          self.list.include.ids = self.list.include.ids.join('\n')
        }
      })
      .catch(function(error) {
        console.error(error)
      })
    }
  }
})
