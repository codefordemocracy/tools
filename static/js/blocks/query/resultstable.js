const resultstable = {
  components: {
    'datatable': datatable
  },
  template: `
    <div>
      <p class="text-xs" v-if="_.isEmpty(table) && !loaded">Loading results...</p>
      <p class="text-xs" v-else-if="_.isEmpty(table) && loaded">This query returned no results.</p>
      <template v-else>
        <div class="flex flex-col sm:flex-row form form-sm bg-secondary p-3 mb-5 -mt-5 -mx-5">
          <div class="grid grid-cols-2 sm:grid-cols-none sm:flex gap-3 items-center mb-3 sm:mb-0">
            <label class="label text-dark mb-0 flex-shrink-0"><span class="text-dark">Order By:</span></label>
            <select class="form-element sm:pr-12" v-model="query.orderby" @change="setOrder">
              <option :value="undefined">None</option>
              <option value="date" v-if="_.includes(['article', 'ad', 'contribution', 'lobbying', '990'], query.output)">Date</option>
              <option value="amount" v-if="_.includes(['contribution'], query.output)">Amount</option>
            </select>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-none sm:flex gap-3 items-center mb-3 sm:mb-0 sm:mx-5">
            <label class="label mb-0 flex-shrink-0"><span class="text-dark">Direction:</span></label>
            <select class="form-element sm:pr-12" v-model="query.orderdir" :disabled="_.isEmpty(query.orderby)">
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
          <button class="btn btn-white flex-shrink-0" @click="orderResults()">Sort Results</button>
        </div>
        <div class="relative">
          <datatable ref="datatable" class="text-xs" :columns="_.keys(table[0])" :data="table" :count="count" :head="pagination.skip == 0 ? true : false" :options="{paginate: true, pagination: 'server', numpages: 0, limit: pagination.limit}" :paging="paging" @previous="previous" @next="next"></datatable>
          <div class="absolute top-0 right-0 -mt-5 -mr-5 bg-blue text-white text-xs px-2" v-if="more">&larr;<span class="px-3">scroll me</span>&rarr;</div>
        </div>
      </template>
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
      },
      more: false
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
    },
    setOrder() {
      if(_.isEmpty(this.query.orderdir)) {
        this.query.orderdir = 'asc'
      }
    },
    orderResults() {
      var self = this
      this.getResults(function(data) {
        self.table = data
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
