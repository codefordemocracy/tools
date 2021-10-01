const listreviewer = {
  components: {
    'datatable': datatable
  },
  template: `
    <div>
      <p class="text-xs" v-if="_.isEmpty(table) && error">An error has occurred.</p>
      <p class="text-xs" v-else-if="_.isEmpty(table) && !loaded">Loading entities<span class="blink">...</span></p>
      <p class="text-xs" v-else-if="_.isEmpty(table) && loaded">Your inclusion and exclusion criteria returned no entities.</p>
      <div class="relative" v-else>
        <datatable ref="datatable" class="text-xs" :columns="_.keys(table[0])" :data="table" :count="count" :head="pagination.skip == 0 ? true : false" :options="{paginate: true, pagination: 'server', numpages: 0, limit: pagination.limit}" :paging="paging" @previous="previous" @next="next"></datatable>
        <div class="absolute top-0 right-0 -mt-5 -mr-5 bg-blue text-white text-xs px-2" v-if="more">&larr;<span class="px-3">scroll me</span>&rarr;</div>
      </div>
    </div>
  `,
  props: {
    list: {
      type: Object,
      default: function () {
        return {}
      }
    },
    download: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      table: [],
      count: -1,
      pagination: {
        skip: 0,
        limit: 20
      },
      loaded: false,
      error: false,
      paging: false,
      downloading: {
        count: 0,
        status: false
      },
      more: false
    }
  },
  methods: {
    getResults(callback, pagination=null) {
      this.loaded = false
      this.error = false
      if (_.isNull(pagination)) {
        pagination = this.pagination
      }
      var self = this
      // get results table
      axios.post('/api/list/review/table/', {list: this.list, pagination: pagination})
      .then(function(response) {
        self.loaded = true
        self.paging = false
        callback(response.data)
      })
      .catch(function(error) {
        console.error(error)
        self.error = true
      })
    },
    getCount(callback) {
      var self = this
      // get results table
      axios.post('/api/list/review/count/', {list: this.list})
      .then(function(response) {
        callback(response.data)
      })
      .catch(function(error) {
        console.error(error)
      })
    },
    downloadResults(format) {
      this.downloading.status = true
      this.downloading.count = 0
      var self = this
      var all = []
      var page = 0
      var limit = 1000
      var callback = function(response) {
        page++
        all = _.concat(all, response)
        self.downloading.count = all.length
        self.$emit('downloading', self.downloading.count)
        if (response.length == 0) {
          DOWNLOAD(all, format, 'results')
          self.downloading.status = false
          self.$emit('downloading', false)
        } else {
          self.getResults(callback, pagination={skip: page*limit, limit: limit})
        }
      }
      this.getResults(callback, pagination={skip: page*limit, limit: limit})
    },
    previous() {
      var self = this
      this.paging = true
      this.pagination.skip = this.pagination.skip - this.pagination.limit
      if (this.pagination.skip < 0) {
        this.pagination.skip = 0
      }
      this.getResults(function(data) {
        self.table = data
        Vue.nextTick(function () {
          self.more = self.$refs.datatable.$refs.table.offsetWidth > self.$refs.datatable.$el.clientWidth
        })
      })
    },
    next() {
      var self = this
      this.paging = true
      this.pagination.skip = this.pagination.skip + this.pagination.limit
      this.getResults(function(data) {
        self.table = data
        Vue.nextTick(function () {
          self.more = self.$refs.datatable.$refs.table.offsetWidth > self.$refs.datatable.$el.clientWidth
        })
      })
    }
  },
  watch: {
    download: function (newVal, oldVal) {
      if (newVal == 'csv') {
        this.downloadResults('csv')
      } else if (newVal == 'json') {
        this.downloadResults('json')
      }
    }
  },
  created() {
    var self = this
    this.getResults(function(data) {
      self.table = data
      Vue.nextTick(function () {
        self.more = self.$refs.datatable.$refs.table.offsetWidth > self.$refs.datatable.$el.clientWidth
      })
    })
    this.getCount(function(data) {
      self.count = data
      self.$emit('count', self.count)
    })
  }
}
