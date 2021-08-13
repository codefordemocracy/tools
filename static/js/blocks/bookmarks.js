const bookmarks = {
  template: `
    <div>
      <div class="bg-xlight p-5 mb-4" v-for="bookmark in chunks[page-1]">
        <ul class="list-none">
          <li><strong>Description:</strong> {{bookmark.description}}</li>
          <li><strong>URL:</strong> <a :href="makeurl(bookmark)" class="text-gray">{{makeurl(bookmark)}}</a></li>
          <li><strong>Bookmarked at:</strong> {{moment(bookmark.bookmarked_at).local()}}</li>
        </ul>
        <div class="text-xs mt-3">
          <a :href="makeurl(bookmark)" class="mr-3" class="text-primary">View</a>
          <a href="javascript:void(0)" @click="remove(bookmark)" class="text-red">Delete</a>
        </div>
      </div>
      <div class="flex justify-between items-center" v-if="chunks.length > 1">
        <button class="btn text-gray btn-sm" @click="page--" :disabled="page == 1">&larr; Previous<span class="hidden md:inline"> Page</span></button>
        <span class="text-xs">Page {{page}} of {{chunks.length}}</span>
        <button class="btn text-gray btn-sm pl-3" @click="page++" :disabled="page == chunks.length">Next<span class="hidden md:inline"> Page</span> &rarr;</button>
      </div>
    </div>
  `,
  props: {
    bookmarks: {
      type: Array,
      default: []
    }
  },
  data() {
    return {
      page: 1
    }
  },
  computed: {
    chunks() {
      return _.chunk(this.bookmarks, 5)
    }
  },
  methods: {
    makeurl(bookmark) {
      let url = '/recipe/results/?template=' + bookmark.query.template
      _.forOwn(_.omit(bookmark.query, ['id', 'template']), function(v, k) {
        if (!_.isNil(v)) {
          url += '&' + k + '=' + encodeURIComponent(v)
        }
      })
      return url
    },
    remove(bookmark) {
      var self = this
      axios.post('/api/recipe/bookmark/remove/', {id: bookmark.id})
      .then(function(response) {
        if (_.get(response.data, 'success')) {
          self.bookmarks = _.filter(self.bookmarks, function(o) { return !_.isEqual(o.id, bookmark.id) })
          self.$emit('update', self.bookmarks)
        }
      })
      .catch(function(error) {
        console.error(error)
      })
    }
  }
}
