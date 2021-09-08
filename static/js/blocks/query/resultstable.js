const resultstable = {
  components: {
    'datatable': datatable
  },
  template: `
    <div>
      <p class="text-xs" v-if="_.isEmpty(table) && !loaded">Loading results...</p>
      <p class="text-xs" v-else-if="_.isEmpty(table) && loaded">This query returned no results.</p>
      <datatable class="text-xs" :columns="_.keys(table[0])" :data="table" :count="count" :head="pagination.skip == 0 ? true : false" :options="{paginate: true, pagination: 'server', numpages: 0, limit: pagination.limit}" :paging="paging" @previous="previous" @next="next" v-else></datatable>
    </div>
  `,
  props: {
    query: {
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
      paging: false,
      downloading: {
        count: 0,
        status: false
      }
    }
  },
  methods: {
    getResults(callback, pagination=null) {
      this.loaded = false
      if (_.isNull(pagination)) {
        pagination = this.pagination
      }
      var self = this
      // get results table
      axios.post('/api/query/results/table/', {query: this.query, pagination: pagination})
      .then(function(response) {
        this.loaded = true
        self.paging = false
        callback(response.data)
      })
      .catch(function(error) {
        console.error(error)
      })
    },
    getCount(callback) {
      var self = this
      // get results table
      axios.post('/api/query/results/count/', {query: this.query})
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
        if (response.length < limit) {
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
      })
    },
    next() {
      var self = this
      this.paging = true
      this.pagination.skip = this.pagination.skip + this.pagination.limit
      this.getResults(function(data) {
        self.table = data
      })
    }
  },
  watch: {
    download: function (newVal, oldVal){
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
    })
    this.getCount(function(data) {
      self.count = data
      self.$emit('count', self.count)
    })
  }
}
