/* Initialize Elements */

new Vue({
  store,
  router,
  el: '#app',
  components: {
    'tabs': tabbed.tabs,
    'tab': tabbed.tab,
    'toggle': toggle,
    'multiselect': window.VueMultiselect.default,
    'listreviewer': listreviewer
  },
  data: {
    list: {
      type: null,
      subtype: null,
      include: {
        terms: null,
        ids: null
      },
      exclude: {
        terms: null,
        ids: null
      },
      visibility: 'hidden',
      name: null,
      description: null
    },
    exclude: false,
    filters: {
      include: {
        candidate: {
          cand_pty_affiliation: null,
          cand_office: null,
          cand_office_st: null,
          cand_office_district: null,
          cand_ici: null,
          cand_election_yr: ['']
        },
        donor: {
          entity_tp: null,
          state: null,
          zip_code: ['']
        },
        committee: {
          cmte_pty_affiliation: null,
          cmte_dsgn: null,
          cmte_tp: null,
          org_tp: null
        }
      },
      exclude: {
        candidate: {
          cand_pty_affiliation: null,
          cand_office: null,
          cand_office_st: null,
          cand_office_district: null,
          cand_ici: null,
          cand_election_yr: ['']
        },
        donor: {
          entity_tp: null,
          state: null,
          zip_code: ['']
        },
        committee: {
          cmte_pty_affiliation: null,
          cmte_dsgn: null,
          cmte_tp: null,
          org_tp: null
        }
      }
    },
    preview: {
      include: [],
      exclude: []
    },
    review: {
      count: -1,
      download: false,
      downloading: 0
    }
  },
  computed: {
    subtypes() {
      if (this.list.type == 'person') {
        return ['candidate', 'donor']
      } else if (this.list.type == 'organization') {
        return ['committee', 'employer', 'source']
      }
      return []
    },
    placeholder() {
      if (this.list.subtype == 'candidate') {
        return {
          terms: ["Joe Biden ", "Nancy Pelosi ", "Mitch McConnell ", "..."].join('\n'),
          ids: ["P60012143 ", "H8CA05035 ", "S2KY00012 ", "P80001571 ", "..."].join('\n')
        }
      } else if (this.list.subtype == 'committee') {
        return {
          terms: ["Victory Fund ", "Leadership Committee ", "Joint Fundraising ", "..."].join('\n'),
          ids: ["C00000935 ", "C00075820 ", "C00075820 ", "C00042366 ", "C00027466 ", "..."].join('\n')
        }
      } else if (this.list.subtype == 'employer') {
        return {
          terms: ["Hospital ", "Bank ", "..."].join('\n'),
          ids: ''
        }
      } else if (this.list.subtype == 'source') {
        return {
          terms: ["CNN ", "Reuters ", "Breitbart ", "The Federalist ", "..."].join('\n'),
          ids: ["cnn.com ", "reuters.com ", "breitbart.com ", "thefederalist.com ", "..."].join('\n')
        }
      } else if (this.list.subtype == 'job') {
        return {
          terms: ["Doctor ", "Software Engineer ", "Realtor ", "..."].join('\n'),
          ids: ''
        }
      } else if (this.list.subtype == 'topic') {
        return {
          terms: ["Finance ", "Defense ", "Healthcare ", "..."].join('\n'),
          ids: ["LAW ", "BUD ", "NAT ", "HCR ", "MMM ", "AVI ", "EDU ", "..."].join('\n')
        }
      }
      return ''
    },
    build() {
      var self = this
      let obj = _.cloneDeep(this.list)
      if (!_.isNil(obj.include.terms)) {
        obj.include.terms = _.compact(_.split(obj.include.terms, '\n'))
      }
      if (!_.isNil(obj.include.ids)) {
        obj.include.ids = _.compact(_.split(obj.include.ids, '\n'))
      }
      if (!_.isNil(this.filters.include[obj.subtype])) {
        obj.include.filters = {}
        _.forEach(_.keys(this.filters.include[obj.subtype]), function(k) {
          if (!_.isEmpty(self.filters.include[obj.subtype][k])) {
            let filters = _.compact(self.filters.include[obj.subtype][k])
            if (!_.isEmpty(filters)) {
              obj.include.filters[k] = filters
            }
          }
        })
      }
      if (this.exclude) {
        if (!_.isNil(obj.exclude.terms)) {
          obj.exclude.terms = _.compact(_.split(obj.exclude.terms, '\n'))
        }
        if (!_.isNil(obj.exclude.ids)) {
          obj.exclude.ids = _.compact(_.split(obj.exclude.ids, '\n'))
        }
        if (!_.isNil(this.filters.exclude[obj.subtype])) {
          obj.exclude.filters = {}
          _.forEach(_.keys(this.filters.exclude[obj.subtype]), function(k) {
            let filters = _.compact(self.filters.exclude[obj.subtype][k])
            if (!_.isEmpty(filters)) {
              obj.exclude.filters[k] = filters
            }
          })
        }
      } else {
        obj.exclude.terms = null
        obj.exclude.ids = null
      }
      return obj
    },
    buildable() {
      return _.intersection(store.state.workflow.valid, [1,2,3]).length == 3
    },
    textinputs() {
      return {
        include: this.list.include,
        exclude: this.list.exclude
      }
    },
    numclauses() {
      let count = 0
      if (!_.isNil(this.build.include.terms)) {
        count += this.build.include.terms.length
      }
      if (!_.isNil(this.build.include.ids)) {
        count += this.build.include.ids.length
      }
      if (!_.isNil(this.build.exclude.terms)) {
        count += this.build.exclude.terms.length
      }
      if (!_.isNil(this.build.exclude.ids)) {
        count += this.build.exclude.ids.length
      }
      return count
    }
  },
  methods: {
    makeOptions(options) {
      return _.map(options, 'value')
    },
    findLabel(x, options) {
      return _.filter(options, {value: x})[0].label
    },
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
    downloadingEntities(payload) {
      if (payload == false) {
        this.review.download = false
        this.review.downloading = 0
      } else {
        this.review.downloading = payload
      }
    },
    countEntities(payload) {
      this.review.count = payload
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
    textinputs: {
      deep: true,
      handler() {
        if (!_.isEmpty(this.list.subtype) && !(_.isEmpty(_.get(this.build.include, 'terms')) && _.isEmpty(_.get(this.build.include, 'ids')))) {
          this.slowpeek()
        }
      }
    },
    build: {
      deep: true,
      handler() {
        store.commit('workflow/reset')
        store.commit('workflow/clear')
        // set properties based on type
        if (_.includes(['job', 'topic'], this.list.type)) {
          this.list.subtype = this.list.type
        } else if (_.isNull(this.list.subtype) || !_.includes(this.subtypes, this.list.subtype)) {
          this.list.subtype = this.subtypes[0]
        }
        // set properties based on subtype
        if (_.includes(['donor', 'employer', 'job'], this.list.subtype)) {
          this.list.include.ids = null
          this.list.exclude.ids = null
        }
        // validate steps
        if (!_.isNull(this.list.type)) {
          store.commit('workflow/valid', 1)
          if (!_.isEmpty(this.list.subtype) && !(_.isEmpty(_.get(this.build.include, 'terms')) && _.isEmpty(_.get(this.build.include, 'ids')) && _.isEmpty(_.get(this.build.include, 'filters')))) {
            store.commit('workflow/valid', 2)
            store.commit('workflow/valid', 3)
            store.commit('workflow/valid', 4)
            if (!_.isEmpty(this.list.visibility) && !_.isEmpty(this.list.name) && !_.isEmpty(this.list.description)) {
              store.commit('workflow/complete')
            }
          }
        }
      }
    }
  },
  created() {
    var self = this
    // create debounced preview function for new lists
    this.slowpeek = _.debounce(this.peek, 2000)
    // get id for edit or clone workflow
    if (_.includes(['edit', 'clone'], this.$route.query.action) && !_.isNil(this.$route.query.id)) {
      this.list.id = this.$route.query.id
    }
    // load data for edit or clone workflow
    if (!_.isNil(this.$route.query.id)) {
      axios.post('/api/list/meta/', {id: this.$route.query.id})
      .then(function(response) {
        self.list = response.data
        if (!_.isNil(self.list.include.terms)) {
          self.list.include.terms = self.list.include.terms.join('\n')
        }
        if (!_.isNil(self.list.include.ids)) {
          self.list.include.ids = self.list.include.ids.join('\n')
        }
        if (!_.isNil(self.list.include.filters)) {
          _.forEach(_.keys(self.list.include.filters), function(k) {
            self.filters.include[self.list.subtype][k] = self.list.include.filters[k]
          })
          self.list.include = _.omit(self.list.include, 'filters')
        }
        if (_.isNil(self.list.exclude)) {
          self.list.exclude = {
            terms: null,
            ids: null
          }
          self.exclude = false
        } else {
          if (!_.isNil(self.list.exclude.terms)) {
            self.list.exclude.terms = self.list.exclude.terms.join('\n')
            self.exclude = true
          }
          if (!_.isNil(self.list.exclude.ids)) {
            self.list.exclude.ids = self.list.exclude.ids.join('\n')
            self.exclude = true
          }
          if (!_.isNil(self.list.exclude.filters)) {
            _.forEach(_.keys(self.list.exclude.filters), function(k) {
              self.filters.exclude[self.list.subtype][k] = self.list.exclude.filters[k]
            })
            self.list.exclude = _.omit(self.list.exclude, 'filters')
            self.exclude = true
          }
        }
      })
      .catch(function(error) {
        console.error(error)
      })
    }
  }
})
