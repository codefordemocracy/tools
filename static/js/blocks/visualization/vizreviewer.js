const vizreviewer = {
  components: {
    'datatable': datatable
  },
  template: `
    <div>
      <p class="text-xs" v-if="!loaded">Loading...</p>
      <p class="text-xs" v-else-if="formatted.count == 0">The settings you configured did not produce any rows of data.</p>
      <datatable class="text-xs" :count="formatted.count" :columns="formatted.columns" :data="formatted.pages" :head="true" :options="{paginate: true, pagination: 'client', numpages: formatted.pages.length, limit: 20}" v-if="formatted.count > 0"></datatable>
    </div>
  `,
  props: {
    category: {
      type: String,
      default: null
    },
    query: {
      type: Object,
      default: function () {
        return {}
      }
    },
    aggregations: {
      type: Object,
      default: function () {
        return {
          columns: [],
          apply: {},
          groupby: []
        }
      }
    }
  },
  data() {
    return {
      loaded: false,
      formatted: {
        count: null,
        columns: [],
        pages: []
      }
    }
  },
  created() {
    var self = this
    // get formatted data
    axios.post('/api/visualization/aggregations/results/', {query: this.query, aggregations: this.aggregations})
    .then(function(response) {
      self.formatted = response.data
      self.loaded = true
      // create datastring for datawrapper
      if (self.category != 'network') {
        let datawrapper = {
          source_name: 'Code for Democracy',
          source_url: ROOTURL + '/view/query/?id=' + self.query.id + '&mode=popup',
          data: ''
        }
        if (self.category == 'table') {
          datawrapper.type = 'tables'
        } else if (self.category == 'chart') {
          datawrapper.type = 'd3-bars'
        } else if (self.category == 'map') {
          datawrapper.type = 'd3-maps-choropleth'
        }
        if (self.formatted.count > 0) {
          datawrapper.data += _.join(self.formatted.columns, ';')
          _.forEach(self.formatted.pages, function(page) {
            _.forEach(page, function(row) {
              datawrapper.data += '\n' + _.join(_.values(row), ';')
            })
          })
        }
        self.$emit('datawrapper', datawrapper)
      }
    })
    .catch(function(error) {
      console.error(error)
    })
  }
}
