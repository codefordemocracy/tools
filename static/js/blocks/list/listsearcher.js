const listsearcher = {
  components: {
    'listdisplayer': listdisplayer
  },
  template: `
  <div class="text-xs">
    <div class="form-full form-sm grid grid-cols-1 sm:grid-cols-3 gap-5 mb-5">
      <input class="form-element sm:col-span-1" type="text" v-model="settings.filters.term" placeholder="Filter lists by search term..."></input>
      <div class="flex sm:justify-end items-center sm:col-span-2">
        <input type="radio" class="text-green focus:ring-green focus:ring-opacity-0 mr-1" id="all" value="all" v-model="settings.filters.visibility"><label for="all" class="mr-3">All <span class="hidden sm:inline">Lists</span></label>
        <input type="radio" class="text-green focus:ring-green focus:ring-opacity-0 mr-1" id="public" value="public" v-model="settings.filters.visibility"><label for="public" class="mr-3">Public <span class="hidden sm:inline">Lists</span></label>
        <input type="radio" class="text-green focus:ring-green focus:ring-opacity-0 mr-1" id="hidden" value="hidden" v-model="settings.filters.visibility" :disabled="!store.getters['auth/isLoggedIn']" :class="!store.getters['auth/isLoggedIn'] ? 'cursor-not-allowed border-gray-40' : ''"><label for="hidden" :class="!store.getters['auth/isLoggedIn'] ? 'cursor-not-allowed text-gray-40' : ''"><span class="hidden sm:inline">Your</span> Hidden <span class="hidden sm:inline">Lists</span></label>
      </div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div class="form-full form-sm -mb-2">
        <button class="btn flex justify-between items-center" :class="settings.selected.id == list.id ? 'btn-primary' : 'btn-secondary'" v-for="list in _.slice(options, 10*(page-1), 10*page)" @click="settings.selected = list">
          <span class="text-left">{{list.name}}</span>
          <i class="fas fa-check-circle ml-4" :class="!_.isNull(sequence) && settings.selected.id == list.id ? '' : 'invisible'"></i>
        </button>
        <p v-if="error">An error has occurred.</p>
        <p v-else-if="_.isEmpty(preloaded) && !_.isNull(this.subtype)">Loading lists<span class="blink">...</span></p>
        <p v-else-if="_.isEmpty(preloaded) && _.isNull(this.subtype)">Lists that match your search criteria will show up here.</p>
        <p v-else-if="!_.isEmpty(preloaded) && options.length == 0">There are no lists matching your search criteria.</p>
        <div class="flex justify-between items-center py-2" v-if="!_.isEmpty(preloaded) && options.length > 0">
          <button class="btn p-0 w-auto mb-0" @click="page--" :disabled="page == 1">&larr; Previous Page</button>
          <div class="text-gray text-xs">Page {{page}} of {{Math.ceil(options.length/10)}}</div>
          <button class="btn p-0 w-auto ml-3 mb-0" @click="page++" :disabled="page == Math.ceil(options.length/10)">Next Page &rarr;</button>
        </div>
      </div>
      <div>
        <div class="bg-gray-55 text-white uppercase px-3 py-1">
          Details about the <span v-if="!_.isNull(sequence)">List Selected for Slot {{_.toUpper(sequence)}}</span><span v-else>Selected List</span>
        </div>
        <div class="bg-xlight text-dark p-3">
          <listdisplayer :list="settings.selected" v-if="!_.isNil(settings.selected.created_at)"></listdisplayer>
          <p v-else-if="!_.isNull(sequence) && !_.isNil(settings.selected.id) && _.isNil(settings.selected.created_at)">Please wait while we load details for the list selected for Slot {{_.toUpper(sequence)}}.</p>
          <p v-else-if="!_.isNull(sequence)">You have not yet selected a list for Slot {{_.toUpper(sequence)}}.</p>
          <p v-else>Select a list to view its details.</p>
        </div>
      </div>
    </div>
  </div>
  `,
  props: {
    subtype: {
      type: String,
      default: null
    },
    sequence: {
      type: String,
      default: null
    },
    settings: {
      type: Object,
      default: function () {
        return {
          filters: {
            visibility: 'all',
            term: null
          },
          selected: {}
        }
      }
    }
  },
  data() {
    return {
      preloaded: {},
      loaded: false,
      error: false,
      page: 1
    }
  },
  computed: {
    options() {
      var self = this
      let opts = []
      if (!_.isNull(this.subtype)) {
        opts = this.preloaded[this.subtype]
        if (this.settings.filters.visibility != 'all') {
          opts = _.filter(opts, {visibility: this.settings.filters.visibility})
        }
        if (!_.isEmpty(this.settings.filters.term)) {
          opts = _.filter(opts, function(l) {
            return _.includes(_.lowerCase(l.name), _.lowerCase(self.settings.filters.term))
          })
        }
      }
      return opts || []
    }
  },
  methods: {
    loadObjects() {
      var self = this
      // get lists
      if (!_.isNull(this.subtype)) {
        axios.post('/api/lists/')
        .then(function(response) {
          let subtype = _.uniq(_.map(response.data, 'subtype'))
          let mapped = {}
          _.forEach(subtype, function(t) {
            mapped[t] = _.orderBy(_.filter(response.data, {subtype: t}), ['visibility', 'featured'], ['desc', 'asc'])
          })
          self.preloaded = mapped
          self.loaded = true
          // fill out selected for cloning and editing
          if (!_.isNil(self.settings.selected.id) && _.isNil(self.settings.selected.created_at)) {
            self.settings.selected = _.filter(response.data, function(l) {
              return l.id == self.settings.selected.id
            })[0]
          }
        })
        .catch(function(error) {
          console.error(error)
          self.error = true
        })
      }
    }
  },
  watch: {
    settings: {
      deep: true,
      handler() {
        if (!_.isEmpty(this.settings.selected)) {
          this.$emit('change', this.settings)
        }
      }
    }
  },
  created() {
    var self = this
    this.loadObjects()
    this.$store.watch((state) => store.state.auth.profile.email, (newValue, oldValue) => {
      if (!_.isUndefined(newValue)) {
        self.loadObjects()
      }
    })
  }
}
