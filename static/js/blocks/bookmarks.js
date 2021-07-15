const bookmarks = {
  template: `
    <div>
      <div class="bg-xlight p-2 mb-1" v-for="bookmark in chunks[page-1]">
        <ul class="list-unstyled infolist text-gray">
          <li><strong>Description:</strong> {{bookmark.description}}</li>
          <li><strong>URL:</strong> <a :href="makeurl(bookmark)" class="text-gray">{{makeurl(bookmark)}}</a></li>
          <li><strong>Bookmarked at:</strong> {{moment(bookmark.bookmarked_at).local()}}</li>
        </ul>
        <a :href="makeurl(bookmark)" class="mr-2">View</a>
        <a href="javascript:void(0)" @click="remove(bookmark)" class="text-danger">Delete</a>
      </div>
      <div class="row d-flex align-items-center mb-1" v-if="chunks.length > 1">
        <div class="col-6 col-sm-3 order-sm-1">
          <button class="btn btn-link text-gray btn-xs" @click="page--" :disabled="page == 1">&larr; Previous<span class="d-none d-md-inline"> Page</span></button>
        </div>
        <div class="col-6 col-sm-3 order-sm-3 text-right">
          <button class="btn btn-link text-gray btn-xs pl-3" @click="page++" :disabled="page == chunks.length">Next<span class="d-none d-md-inline"> Page</span> &rarr;</button>
        </div>
        <div class="col-12 col-sm-6 order-sm-2 text-center">
          Page {{page}} of {{chunks.length}}</span>
        </div>
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
