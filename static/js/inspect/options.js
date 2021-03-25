const STATES = [
  {label: 'Alabama (AL)', value: 'AL'},
  {label: 'Alaska (AK)', value: 'AK'},
  {label: 'American Samoa (AS)', value: 'AS'},
  {label: 'Arizona (AZ)', value: 'AZ'},
  {label: 'Arkansas (AR)', value: 'AR'},
  {label: 'California (CA)', value: 'CA'},
  {label: 'Colorado (CO)', value: 'CO'},
  {label: 'Connecticut (CT)', value: 'CT'},
  {label: 'Delaware (DE)', value: 'DE'},
  {label: 'District Of Columbia (DC)', value: 'DC'},
  {label: 'Florida (FL)', value: 'FL'},
  {label: 'Georgia (GA)', value: 'GA'},
  {label: 'Guam (GU)', value: 'GU'},
  {label: 'Hawaii (HI)', value: 'HI'},
  {label: 'Idaho (ID)', value: 'ID'},
  {label: 'Illinois (IL)', value: 'IL'},
  {label: 'Indiana (IN)', value: 'IN'},
  {label: 'Iowa (IA)', value: 'IA'},
  {label: 'Kansas (KS)', value: 'KS'},
  {label: 'Kentucky (KY)', value: 'KY'},
  {label: 'Louisiana (LA)', value: 'LA'},
  {label: 'Maine (ME)', value: 'ME'},
  {label: 'Maryland (MD)', value: 'MD'},
  {label: 'Massachusetts (MA)', value: 'MA'},
  {label: 'Michigan (MI)', value: 'MI'},
  {label: 'Minnesota (MN)', value: 'MN'},
  {label: 'Mississippi (MS)', value: 'MS'},
  {label: 'Missouri (MO)', value: 'MO'},
  {label: 'Montana (MT)', value: 'MT'},
  {label: 'Nebraska (NE)', value: 'NE'},
  {label: 'Nevada (NV)', value: 'NV'},
  {label: 'New Hampshire (NH)', value: 'NH'},
  {label: 'New Jersey (NJ)', value: 'NJ'},
  {label: 'New Mexico (NM)', value: 'NM'},
  {label: 'New York (NY)', value: 'NY'},
  {label: 'North Carolina (NC)', value: 'NC'},
  {label: 'North Dakota (ND)', value: 'ND'},
  {label: 'Northern Mariana Islands (MP)', value: 'MP'},
  {label: 'Ohio (OH)', value: 'OH'},
  {label: 'Oklahoma (OK)', value: 'OK'},
  {label: 'Oregon (OR)', value: 'OR'},
  {label: 'Pennsylvania (PA)', value: 'PA'},
  {label: 'Puerto Rico (PR)', value: 'PR'},
  {label: 'Rhode Island (RI)', value: 'RI'},
  {label: 'South Carolina (SC)', value: 'SC'},
  {label: 'South Dakota (SD)', value: 'SD'},
  {label: 'Tennessee (TN)', value: 'TN'},
  {label: 'Texas (TX)', value: 'TX'},
  {label: 'Utah (UT)', value: 'UT'},
  {label: 'Vermont (VT)', value: 'VT'},
  {label: 'Virgin Islands (VI)', value: 'VI'},
  {label: 'Virginia (VA)', value: 'VA'},
  {label: 'Washington (WA)', value: 'WA'},
  {label: 'West Virginia (WV)', value: 'WV'},
  {label: 'Wisconsin (WI)', value: 'WI'},
  {label: 'Wyoming (WY)', value: 'WY'}
]

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
