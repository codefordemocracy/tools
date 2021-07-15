/* URLs */

const ROOTURL = 'https://tools.codefordemocracy.org'
const ACCOUNTURL = 'https://account.codefordemocracy.org'

/* Placeholders */

const PLACEHOLDERS = {
  candidate: ['Trump, Donald', 'Weld, Bill', 'Biden, Joseph', 'Warren, Elizabeth', 'Sanders, Bernard', 'Harris, Kamala', 'Buttigieg, Pete', 'O’Rourke, Robert Beto', 'Yang, Andrew', 'Booker, Cory', 'Klobuchar, Amy', 'McConnell, Mitch', 'Pelosi, Nancy'],
  committee: ['DCCC', 'NRCC', 'DSCC', 'NRSC', 'Northrop Grumman', 'Comcast'],
  donor: ['Adelson, Sheldon', 'Bloomberg, Michael', 'Steyer, Thomas', 'Uihlein, Richard', 'Sussman, Donald', 'Simons, James', 'Soros, George', 'Bezos, Jeffrey', 'Hoffman, Reid'],
  payee: ['Google', 'YouTube', 'Facebook', 'Twitter'],
  employer: ['Facebook', 'Google', 'Amazon', 'Apple', 'Microsoft'],
  job: ['CEO', 'CTO', 'CTO', 'Chairman', 'President'],
  source: ['politico.com', 'dailykos.com', 'thegatewaypundit.com', 'dailycaller.com', 'breitbart.com', 'foxnews.com'],
  tweeter: ['@realDonaldTrump', '@JoeBiden'],
  buyer: ['Courier Newsroom, Inc.'],
  page: ['Donald J. Trump', 'Joe Biden', 'Progressive Turnout Project', 'The Lincoln Project', 'U.S. Census Bureau']
}

/* Geography */

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

/* Dates */

const DATERANGES = {
  disabledDates: {
    elastic: {
      to: moment('2019-04-01', 'YYYY-MM-DD').toDate(),
      from: moment().toDate()
    },
    fec: {
      to: moment('2019-01-01', 'YYYY-MM-DD').toDate(),
      from: moment().toDate()
    }
  },
  dates: {
    elastic: {
      min: moment().subtract(3, 'months').format('YYYY-MM-DD'),
      max: moment().format('YYYY-MM-DD')
    },
    fec: {
      min: moment('2019-01-01', 'YYYY-MM-DD').toDate(),
      max: moment('2020-12-31', 'YYYY-MM-DD').toDate(),
    }
  }
}

/* Recipes */

const RECIPES = [{
  output: 'contribution',
  tags: ['campfin'],
  template: 'ReqQ',
  lists: ["committee"],
  configurables: `Find contributions from <configurable :type="lists[0]" :settings="settings(0)" @click="click(0)" :preloaded="preloaded" :prefill="prefill" @select="select"></configurable>`,
  interpretation: `This recipe produces a list of contributions from contributor committees to recipient committees.`
}, {
  output: 'contribution',
  tags: ['campfin'],
  template: 'NcFz',
  lists: ["person"],
  configurables: `Find contributions from donors in the list of <configurable :type="lists[0]" :settings="settings(0)" @click="click(0)" :preloaded="preloaded" :prefill="prefill" @select="select"></configurable>`,
  interpretation: `This recipe produces a list of contributions from donors in the selected list.`
}, {
  output: 'contribution',
  tags: ['campfin'],
  template: 'm4YC',
  lists: ["organization"],
  configurables: `Find contributions from donors employed by <configurable :type="lists[0]" :settings="settings(0)" @click="click(0)" :preloaded="preloaded" :prefill="prefill" @select="select"></configurable>`,
  interpretation: `This recipe produces a list of contributions from donors who were employed by employers in the selected list at the time the contribution was made.`
}, {
  output: 'contribution',
  tags: ['campfin'],
  template: '7v4P',
  lists: ["job"],
  configurables: `Find contributions from donors who work as <configurable :type="lists[0]" :settings="settings(0)" @click="click(0)" :preloaded="preloaded" :prefill="prefill" @select="select"></configurable>`,
  interpretation: `This recipe produces a list of contributions from donors who held a job in the selected list at the time the contribution was made.`
}, {
  output: 'contribution',
  tags: ['campfin'],
  template: 'T5xv',
  lists: ["job", "organization"],
  configurables: `Find contributions from donors who work as <configurable :type="lists[0]" :settings="settings(0)" @click="click(0)" :preloaded="preloaded" :prefill="prefill" @select="select"></configurable> for <configurable :type="lists[1]" :settings="settings(1)" @click="click(1)" :preloaded="preloaded" :prefill="prefill" @select="select"></configurable>`,
  interpretation: `This recipe produces a list of contributions from donors who held a job in the first selected list at an employer in the second selected list at the time the contribution was made.`
}, {
  output: 'contribution',
  tags: ['campfin'],
  template: 'Bs5W',
  lists: ["organization", "committee"],
  configurables: `Find contributions from donors employed by <configurable :type="lists[0]" :settings="settings(0)" @click="click(0)" :preloaded="preloaded" :prefill="prefill" @select="select"></configurable> to <configurable :type="lists[1]" :settings="settings(1)" @click="click(1)" :preloaded="preloaded" :prefill="prefill" @select="select"></configurable>`,
  interpretation: `This recipe produces a list of contributions from donors who were at any point employed by employers in the first selected list, even if it was not their disclosed employer at the time the contribution was made, to committees in the second selected list.`
}, {
  output: 'contribution',
  tags: ['campfin'],
  template: '6peF',
  lists: ["job", "committee"],
  configurables: `Find contributions from donors who work as <configurable :type="lists[0]" :settings="settings(0)" @click="click(0)" :preloaded="preloaded" :prefill="prefill" @select="select"></configurable> to <configurable :type="lists[1]" :settings="settings(1)" @click="click(1)" :preloaded="preloaded" :prefill="prefill" @select="select"></configurable>`,
  interpretation: `This recipe produces a list of contributions from donors who held a job in the first selected list at the time the contribution was made to committees in the second selected list.`
}, {
  output: 'contribution',
  tags: ['campfin'],
  template: 'F2mS',
  lists: ["job", "organization", "committee"],
  configurables: `Find contributions from donors who work as <configurable :type="lists[0]" :settings="settings(0)" @click="click(0)" :preloaded="preloaded" :prefill="prefill" @select="select"></configurable> for <configurable :type="lists[1]" :settings="settings(1)" @click="click(1)" :preloaded="preloaded" :prefill="prefill" @select="select"></configurable> to <configurable :type="lists[2]" :settings="settings(2)" @click="click(2)" :preloaded="preloaded" :prefill="prefill" @select="select"></configurable>`,
  interpretation: `This recipe produces a list of contributions from donors who held a job in the first selected list at an employer in the second selected list at the time the contribution was made to committees in the third selected list.`
}, {
  output: 'contribution',
  tags: ['campfin'],
  template: 'IQL2',
  lists: ["committee", "committee"],
  configurables: `Find contributions from <configurable :type="lists[0]" :settings="settings(0)" @click="click(0)" :preloaded="preloaded" :prefill="prefill" @select="select"></configurable> to <configurable :type="lists[1]" :settings="settings(1)" @click="click(1)" :preloaded="preloaded" :prefill="prefill" @select="select"></configurable>`,
  interpretation: `This recipe produces a list of contributions from contributor committees to recipient committees.`
}, {
  output: 'contribution',
  tags: ['campfin'],
  template: 'P3JF',
  lists: ["committee"],
  configurables: `Find contributions from <configurable :type="lists[0]" :settings="settings(0)" @click="click(0)" :preloaded="preloaded" :prefill="prefill" @select="select"></configurable> that were refunded by the recipient`,
  interpretation: `This recipe produces a list of refunds of contributions from committees in the selected list.`
}, {
  output: 'contribution',
  tags: ['campfin'],
  template: 'VqHR',
  lists: ["committee"],
  configurables: `Find contributions to <configurable :type="lists[0]" :settings="settings(0)" @click="click(0)" :preloaded="preloaded" :prefill="prefill" @select="select"></configurable>`,
  interpretation: `This recipe produces a list of contributions from contributor committees to recipient committees.`
}, {
  output: 'lobbying',
  tags: ['lobbying'],
  template: 'kMER',
  lists: ["organization"],
  configurables: `Find lobbying activity conducted on behalf of <configurable :type="lists[0]" :settings="settings(0)" @click="click(0)" :preloaded="preloaded" :prefill="prefill" @select="select"></configurable>`,
  interpretation: `This recipe produces a list of lobbying activity done on behalf of organizations in the selected list.`
}, {
  output: 'lobbying',
  tags: ['lobbying'],
  template: 'wLvp',
  lists: ["organization"],
  configurables: `Find lobbying activity conducted by <configurable :type="lists[0]" value="TiHlDe7JBzAXsc1xhlIL" :settings="settings(0)" @click="click(0)" :preloaded="preloaded" :prefill="prefill" @select="select"></configurable>`,
  interpretation: `This recipe produces a list of lobbying activity done by firms in the selected list.`
}, {
  output: 'lobbying',
  tags: ['lobbying'],
  template: 'MJdb',
  lists: ["topic"],
  configurables: `Find lobbying activity related to <configurable :type="lists[0]" :settings="settings(0)" @click="click(0)" :preloaded="preloaded" :prefill="prefill" @select="select"></configurable>`,
  interpretation: `This recipe produces a list of lobbying activity related to issues in the selected list.`
}, {
  output: 'lobbying',
  tags: ['campfin', 'lobbying'],
  template: 'WGb3',
  lists: ["organization"],
  configurables: `Find contributions by lobbyists lobbying on behalf of <configurable :type="lists[0]" :settings="settings(0)" @click="click(0)" :preloaded="preloaded" :prefill="prefill" @select="select"></configurable>`,
  interpretation: `This recipe produces a list of contributions by lobbyists affiliated with lobbying activity done on behalf of organizations in the selected list.`
}, {
  output: 'lobbying',
  tags: ['campfin', 'lobbying'],
  template: 'PjyR',
  lists: ["organization"],
  configurables: `Find contributions by lobbyists employed by <configurable :type="lists[0]" value="TiHlDe7JBzAXsc1xhlIL" :settings="settings(0)" @click="click(0)" :preloaded="preloaded" :prefill="prefill" @select="select"></configurable>`,
  interpretation: `This recipe produces a list of contributions by lobbyists affiliated with lobbying activity done by firms in the selected list.`
}, {
  output: 'lobbying',
  tags: ['campfin', 'lobbying'],
  template: 'MK93',
  lists: ["topic"],
  configurables: `Find contributions by lobbyists lobbying on <configurable :type="lists[0]" :settings="settings(0)" @click="click(0)" :preloaded="preloaded" :prefill="prefill" @select="select"></configurable>`,
  interpretation: `This recipe produces a list of contributions by lobbyists affiliated with lobbying activity related to issues in the selected list.`
}, {
  output: 'lobbying',
  tags: ['lobbying'],
  template: '3Nrt',
  lists: ["organization"],
  configurables: `Find honorary expenses associated with lobbying activity conducted on behalf of <configurable :type="lists[0]" :settings="settings(0)" @click="click(0)" :preloaded="preloaded" :prefill="prefill" @select="select"></configurable>`,
  interpretation: `This recipe produces a list of honorary expenses in filings with lobbying activity done on behalf of organizations in the selected list.`
}, {
  output: 'lobbying',
  tags: ['lobbying'],
  template: 'V5Gh',
  lists: ["organization"],
  configurables: `Find honorary expenses associated with lobbying activity conducted by <configurable :type="lists[0]" value="TiHlDe7JBzAXsc1xhlIL" :settings="settings(0)" @click="click(0)" :preloaded="preloaded" :prefill="prefill" @select="select"></configurable>`,
  interpretation: `This recipe produces a list of honorary expenses in filings with lobbying activity done by firms in the selected list.`
}, {
  output: 'lobbying',
  tags: ['lobbying'],
  template: 'Q23x',
  lists: ["topic"],
  configurables: `Find honorary expenses associated with lobbying activity related to <configurable :type="lists[0]" :settings="settings(0)" @click="click(0)" :preloaded="preloaded" :prefill="prefill" @select="select"></configurable>`,
  interpretation: `This recipe produces a list of honorary expenses in filings with lobbying activity related to issues in the selected list.`
}, {
  output: '990',
  tags: ['tax'],
  template: 'K23r',
  lists: ["person"],
  configurables: `Find 990 filings that mention people in the list of <configurable :type="lists[0]" :settings="settings(0)" @click="click(0)" :preloaded="preloaded" :prefill="prefill" @select="select"></configurable>`,
  interpretation: `This recipe produces a list of IRS 990 filings that mention the people in the selected list.`
}, {
  output: '990',
  tags: ['tax'],
  template: 'GCv2',
  lists: ["committee"],
  configurables: `Find 990 filings that mention committees in the list of <configurable :type="lists[0]" :settings="settings(0)" @click="click(0)" :preloaded="preloaded" :prefill="prefill" @select="select"></configurable>`,
  interpretation: `This recipe produces a list of IRS 990 filings that mention the committees in the selected list.`
}, {
  output: '990',
  tags: ['tax'],
  template: 'P34n',
  lists: ["organization"],
  configurables: `Find 990 filings that mention organizations in the list of <configurable :type="lists[0]" :settings="settings(0)" @click="click(0)" :preloaded="preloaded" :prefill="prefill" @select="select"></configurable>`,
  interpretation: `This recipe produces a list of IRS 990 filings that mention the organizations in the selected list.`
}, {
  output: 'ad',
  tags: ['narrative'],
  template: 'D3WE',
  lists: ["committee"],
  configurables: `Find Facebook ads by entities affiliated with <configurable :type="lists[0]" :settings="settings(0)" @click="click(0)" :preloaded="preloaded" :prefill="prefill" @select="select"></configurable>`,
  interpretation: `This recipe produces a list of Facebook ads where the buyer or page is in the selected list.`
}, {
  output: 'ad',
  tags: ['narrative'],
  template: 'BuW8',
  lists: ["committee"],
  configurables: `Find Facebook ads that mention committees in the list of <configurable :type="lists[0]" :settings="settings(0)" @click="click(0)" :preloaded="preloaded" :prefill="prefill" @select="select"></configurable>`,
  interpretation: `This recipe produces a list of Facebook ads related to committees in the selected list.`
}, {
  output: 'ad',
  tags: ['narrative'],
  template: 'N7Jk',
  lists: ["person"],
  configurables: `Find Facebook ads that mention people in the list of <configurable :type="lists[0]" :settings="settings(0)" @click="click(0)" :preloaded="preloaded" :prefill="prefill" @select="select"></configurable>`,
  interpretation: `This recipe produces a list of Facebook ads related to people in the selected list.`
}, {
  output: 'ad',
  tags: ['narrative'],
  template: 'P2HG',
  lists: ["organization"],
  configurables: `Find Facebook ads that mention organizations in the list of <configurable :type="lists[0]" :settings="settings(0)" @click="click(0)" :preloaded="preloaded" :prefill="prefill" @select="select"></configurable>`,
  interpretation: `This recipe produces a list of Facebook ads related to organizations in the selected list.`
}, {
  output: 'ad',
  tags: ['narrative'],
  template: '8HcR',
  lists: ["topic"],
  configurables: `Find Facebook ads with text about <configurable :type="lists[0]" :settings="settings(0)" @click="click(0)" :preloaded="preloaded" :prefill="prefill" @select="select"></configurable>`,
  interpretation: `This recipe produces a list of Facebook ads related to issues in the selected list.`
}]

/* Hacks */

const SHIM = function(list) {
  if (list.subtype == 'employer') {
    list.subtype = 'organization'
  }
  if (list.subtype == 'committee') {
    list.type = 'committee'
  }
  return list
}

const UNSHIM = function(list) {
  if (list.type == 'committee') {
    list.type = 'organization'
    list.subtype = 'committee'
  }
  if (list.type == 'employer') {
    list.type = 'organization'
    list.subtype = 'employer'
  }
  return list
}
