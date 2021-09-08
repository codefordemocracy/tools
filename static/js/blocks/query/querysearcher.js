const querysearcher = {
  components: {
    'querydisplayer': querydisplayer
  },
  template: `
  <div class="text-xs">
    <div class="form-full form-sm grid grid-cols-1 sm:grid-cols-3 gap-5 mb-5">
      <input class="form-element sm:col-span-1" type="text" v-model="settings.filters.term" placeholder="Filter queries by search term..."></input>
      <div class="flex sm:justify-end items-center sm:col-span-2">
        <input type="radio" class="text-green focus:ring-green focus:ring-opacity-0 mr-1" id="all" value="all" v-model="settings.filters.visibility"><label for="all" class="mr-3">All Queries</label>
        <input type="radio" class="text-green focus:ring-green focus:ring-opacity-0 mr-1" id="public" value="public" v-model="settings.filters.visibility"><label for="public" class="mr-3">Public Queries</label>
        <input type="radio" class="text-green focus:ring-green focus:ring-opacity-0 mr-1" id="hidden" value="hidden" v-model="settings.filters.visibility" :disabled="_.isEmpty(store.state.auth.profile)" :class="_.isEmpty(store.state.auth.profile) ? 'cursor-not-allowed border-gray-40' : ''"><label for="hidden" :class="_.isEmpty(store.state.auth.profile) ? 'cursor-not-allowed text-gray-40' : ''">Your Private Queries</label>
      </div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div class="form-full form-sm -mb-2">
        <button class="btn flex justify-between items-center" :class="settings.selected.id == query.id ? 'btn-primary' : 'btn-secondary'" v-for="query in options" @click="settings.selected = query">
          {{query.name}}
          <i class="fas fa-check-circle" :class="settings.selected.id == query.id ? '' : 'invisible'"></i>
        </button>
        <p v-if="_.isEmpty(preloaded)">Loading...</p>
        <p v-else-if="!_.isEmpty(preloaded) && options.length == 0">There are no queries matching your search criteria.</p>
      </div>
      <div>
        <div class="bg-gray-55 text-white uppercase px-3 py-1">
          Details about the Selected Query
        </div>
        <div class="bg-xlight text-dark p-3">
          <querydisplayer :query="settings.selected" v-if="!_.isUndefined(settings.selected.created_at)"></querydisplayer>
          <p v-if="_.isUndefined(settings.selected.id)">Select a query to view its details.</p>
        </div>
      </div>
    </div>
  </div>
  `,
  props: {
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
      let opts = this.preloaded
      if (this.settings.filters.visibility != 'all') {
        opts = _.filter(opts, {visibility: this.settings.filters.visibility})
      }
      if (!_.isEmpty(this.settings.filters.term)) {
        opts = _.filter(opts, function(l) {
          return _.includes(_.lowerCase(l.name), _.lowerCase(self.settings.filters.term))
        })
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
    // get queries
    axios.post('/api/queries/')
    .then(function(response) {
      self.preloaded = response.data
    })
    .catch(function(error) {
      console.error(error)
    })
  }
}
