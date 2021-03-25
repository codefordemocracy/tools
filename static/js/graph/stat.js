const STAT_COLORS = ['#e5e5e5', '#dadada', '#cfcfcf', '#c4c4c4', '#b8b8b8', '#adadad', '#a2a2a2', '#979797', '#8c8c8c', '#818181', '#757575', '#6a6a6a', '#5f5f5f', '#575757', '#4f4f4f', '#474747', '#3f3f3f', '#373737', '#2f2f2f', '#282828', '#202020', '#181818']
const stat = {
  histogram: {
    props: ['statid', 'statdata'],
    template: '<div :id="statid"></div>',
    methods: {
      draw() {
        let data = [
          {
            histfunc: "sum",
            x: this.statdata.labels,
            y: this.statdata.values,
            type: "histogram",
            marker: {
              color: STAT_COLORS[0]
            },
            hovertemplate:
              "<b>%{x}:</b> " +
              "%{y}<br>" +
              "<extra></extra>"
          }
        ]
        let layout = {
          height: 100,
          showlegend: false,
          hovermode: 'closest',
          hoverlabel: {
            bgcolor: '#333',
            bordercolor: '#333',
            font: {
              size: 10,
              color: '#fff'
            }
          },
          xaxis: {
            showgrid: false,
            zeroline: false,
            showline: false,
            showticklabels: false,
            fixedrange: true
          },
          yaxis: {
            showgrid: false,
            zeroline: false,
            showline: false,
            showticklabels: false,
            fixedrange: true
          },
          margin: {
            l: 10,
            r: 10,
            t: 5,
            b: 5
          }
        };
        let config = {
          displayModeBar: false,
          responsive: true
        }
        Plotly.newPlot(this.statid, data, layout, config);
      }
    },
    data() {
      return { rendered: false };
    },
    watch: {
      statdata() {
        this.rendered = false
        if (this.$store.state.tab == 'stats') {
          this.draw()
        }
      }
    },
    mounted() {
      if (this.$store.state.tab == 'stats' && this.rendered == false) {
        this.draw()
      }
      this.$store.watch((state) => state.tab, (newTab, oldTab) => {
        if (newTab == 'stats' && this.rendered == false) {
          this.draw()
          this.rendered = true
        }
      })
    }
  },
  stackbar: {
    props: ['statid', 'statdata'],
    template: '<div :id="statid"></div>',
    methods: {
      draw() {
        let colorindex = this.statdata.pairs.length - 1
        let data = [];
        _.forEach(this.statdata.pairs, function (obj) {
          data.push({
            x: [obj.value],
            y: ['stackbar'],
            customdata: [obj.label],
            orientation: 'h',
            type: 'bar',
            marker: {
              color: STAT_COLORS[colorindex]
            },
            hovertemplate:
              "<b>%{customdata}:</b> " +
              "%{x}%<br>" +
              "<extra></extra>"
          })
          colorindex--
        });
        let layout = {
          height: 40,
          barmode: 'stack',
          showlegend: false,
          hovermode: 'closest',
          hoverlabel: {
            bgcolor: '#333',
            bordercolor: '#333',
            font: {
              size: 10,
              color: '#fff'
            }
          },
          xaxis: {
            range: [0, 100],
            showgrid: false,
            zeroline: false,
            showline: false,
            showticklabels: false,
            fixedrange: true
          },
          yaxis: {
            showgrid: false,
            zeroline: false,
            showline: false,
            showticklabels: false,
            fixedrange: true
          },
          margin: {
            l: 10,
            r: 10,
            t: 5,
            b: 5
          }
        };
        let config = {
          displayModeBar: false,
          responsive: true
        }
        Plotly.newPlot(this.statid, data, layout, config);
      }
    },
    data() {
      return { rendered: false };
    },
    watch: {
      statdata() {
        this.rendered = false
        if (this.$store.state.tab == 'stats') {
          this.draw()
        }
      }
    },
    mounted() {
      if (this.$store.state.tab == 'stats' && this.rendered == false) {
        this.draw()
      }
      this.$store.watch((state) => state.tab, (newTab, oldTab) => {
        if (newTab == 'stats' && this.rendered == false) {
          this.draw()
          this.rendered = true
        }
      })
    }
  }
}
