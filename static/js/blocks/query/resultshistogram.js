const resultshistogram = {
  components: {
    'plot': plot
  },
  template: `
    <div>
      <p class="text-xs" v-if="_.isEmpty(buckets) && error">An error has occurred.</p>
      <p class="text-xs" v-else-if="_.isEmpty(buckets) && !loaded">Loading histogram<span class="blink">...</span></p>
      <p class="text-xs" v-else-if="_.isEmpty(buckets) && loaded">A histogram could not be built for this query.</p>
      <plot class="-m-5" :id="_.uniqueId('histogram')" :settings="histogram" v-else></plot>
    </div>
  `,
  props: {
    query: {
      type: Object,
      default: function () {
        return {}
      }
    },
  },
  data() {
    return {
      buckets: [],
      loaded: false,
      error: false,
    }
  },
  computed: {
    histogram() {
      return {
        data: [
          {
            x: _.map(this.buckets, 'key_as_string'),
            y: _.map(this.buckets, 'doc_count'),
            type: "bar",
            marker: {
              color: '#e5e5e5'
            }
          }
        ],
        layout: {
          height: 175,
          xaxis: {
            linecolor: '#e5e5e5',
            showgrid: false,
            showticklabels: false,
            fixedrange: true
          },
          yaxis: {
            zeroline: false,
            showgrid: false,
            showticklabels: false,
            fixedrange: true
          },
          margin: {
            l: 23,
            r: 23,
            t: 20,
            b: 27
          }
        },
        config: {
          displayModeBar: false,
          responsive: true
        },
      }
    }
  },
  created() {
    var self = this
    // get results table
    axios.post('/api/query/results/histogram/', {query: this.query})
    .then(function(response) {
      self.buckets = response.data
      self.loaded = true
    })
    .catch(function(error) {
      console.error(error)
      self.error = true
    })
  }
}
