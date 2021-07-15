const SIDEBAR_OPTIONS = {
  query: {
    source: [
      {label: 'Get Elements by UUID', value: 'uuid'},
      {label: 'Use a Configuration String', value: 'config'},
      {label: 'Paste Raw JSON', value: 'json'}
    ]
  },
  table: {
    cols: [],
    fcol: [],
    fvals: [],
    scol: [],
    sdir: [
      {label: 'Ascending', value: 'asc'},
      {label: 'Descending', value: 'desc'}
    ],
    pag: [
      {label: 'Yes', value: 'yes'},
      {label: 'No', value: 'no'}
    ],
    rows: [
      {label: '20', value: 20},
      {label: '50', value: 50},
      {label: '100', value: 100}
    ]
  },
  chart: {
    type: [
      {label: 'Scatter', value: 'scatter'},
      {label: 'Line', value: 'line'},
      {label: 'Bar', value: 'bar'},
      {label: 'Histogram', value: 'hist'}
    ],
    x: [],
    y: [],
    agg: [],
    fcol: [],
    fvals: []
  },
  map: {
    unit: [
      {label: 'State', value: 'state'},
      {label: 'Zip Code', value: 'zip'}
    ],
    state: STATES,
    geo: [],
    col: [],
    agg: []
  }
}
