const listsearcher = {
  components: {
    'listdisplayer': listdisplayer
  },
  template: `
  <div class="text-xs">
    <div class="form-full form-sm grid grid-cols-1 sm:grid-cols-3 gap-5 mb-5">
      <input class="form-element sm:col-span-1" type="text" v-model="settings.filters.term" placeholder="Filter lists by search term..."></input>
      <div class="flex sm:justify-end items-center sm:col-span-2">
        <input type="radio" class="text-green focus:ring-green focus:ring-opacity-0 mr-1" id="all" value="all" v-model="settings.filters.visibility"><label for="all" class="mr-3">All Lists</label>
        <input type="radio" class="text-green focus:ring-green focus:ring-opacity-0 mr-1" id="public" value="public" v-model="settings.filters.visibility"><label for="public" class="mr-3">Public Lists</label>
        <input type="radio" class="text-green focus:ring-green focus:ring-opacity-0 mr-1" id="hidden" value="hidden" v-model="settings.filters.visibility" :disabled="_.isEmpty(store.state.auth.profile)" :class="_.isEmpty(store.state.auth.profile) ? 'cursor-not-allowed border-gray-40' : ''"><label for="hidden" :class="_.isEmpty(store.state.auth.profile) ? 'cursor-not-allowed text-gray-40' : ''">Your Hidden Lists</label>
      </div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div class="form-full form-sm -mb-2">
        <button class="btn flex justify-between items-center" :class="settings.selected.id == list.id ? 'btn-primary' : 'btn-secondary'" v-for="list in options" @click="settings.selected = list">
          {{list.name}}
          <i class="fas fa-check-circle" :class="!_.isNull(sequence) && settings.selected.id == list.id ? '' : 'invisible'"></i>
        </button>
        <p v-if="_.isEmpty(preloaded) && !_.isNull(this.subtype)">Loading...</p>
        <p v-else-if="_.isEmpty(preloaded) && _.isNull(this.subtype)">Lists that match your search criteria will show up here.</p>
        <p v-else-if="!_.isEmpty(preloaded) && options.length == 0">There are no lists matching your search criteria.</p>
      </div>
      <div>
        <div class="bg-gray-55 text-white uppercase px-3 py-1">
          Details about the <span v-if="!_.isNull(sequence)">List Selected for Slot {{_.toUpper(sequence)}}</span><span v-else>Selected List</span>
        </div>
        <div class="bg-xlight text-dark p-3">
          <listdisplayer :list="settings.selected" v-if="!_.isUndefined(settings.selected.created_at)"></listdisplayer>
          <p v-else-if="!_.isNull(sequence) && !_.isUndefined(settings.selected.id) && _.isUndefined(settings.selected.created_at)">Please wait while we load details for the list selected for Slot {{_.toUpper(sequence)}}.</p>
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
      preloaded: {}
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
    // get lists
    if (!_.isNull(this.subtype)) {
      axios.post('/api/lists/')
      .then(function(response) {
        let subtype = _.uniq(_.map(response.data, 'subtype'))
        let mapped = {}
        _.forEach(subtype, function(t) {
          mapped[t] = _.filter(response.data, {subtype: t})
        })
        self.preloaded = mapped
        // fill out selected for cloning and editing
        if (!_.isUndefined(self.settings.selected.id) && _.isUndefined(self.settings.selected.created_at)) {
          self.settings.selected = _.filter(response.data, function(l) {
            return l.id == self.settings.selected.id
          })[0]
        }
      })
      .catch(function(error) {
        console.error(error)
      })
    }
  }
}
