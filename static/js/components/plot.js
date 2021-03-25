const plot = {
  template: `
  <div :id="'plot-'+id"></div>
  `,
  props: {
    settings: Object,
    id: String
  },
  methods: {
    render() {
      Plotly.newPlot('plot-'+this.id, this.settings.data, this.settings.layout, this.settings.config)
    }
  },
  watch: {
    settings() {
      var self = this
      Vue.nextTick().then(function() {
        self.render()
      })
    }
  },
  mounted() {
    this.render()
  }
}
