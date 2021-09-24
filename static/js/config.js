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
    documents: {
      to: moment('2019-01-01', 'YYYY-MM-DD').toDate()
    },
    datasets: {
      to: moment('2007-01-01', 'YYYY-MM-DD').toDate()
    }
  },
  dates: {
    documents: {
      min: moment().subtract(3, 'months').format('YYYY-MM-DD'),
      max: moment().format('YYYY-MM-DD')
    },
    datasets: {
      min: moment('2021-01-01', 'YYYY-MM-DD').toDate(),
      max: moment().toDate()
    }
  }
}

/* Recipes */

const RECIPES = [{
  output: 'contribution',
  tags: ['campfin'],
  template: 'ReqQ',
  subtypes: ["committee"],
  configurables: `Find contributions from <configurable :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of contributions from contributor committees in the selected list.`
}, {
  output: 'contribution',
  tags: ['campfin'],
  template: 'VqHR',
  subtypes: ["committee"],
  configurables: `Find contributions from committees to <configurable :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of committee contributions to recipient committees in the selected list.`
}, {
  output: 'contribution',
  tags: ['campfin'],
  template: 'DXhw',
  subtypes: ["candidate"],
  configurables: `Find contributions from committees to <configurable :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of committee contributions to recipient candidates in the selected list.`
}, {
  output: 'contribution',
  tags: ['campfin'],
  template: 'dFMy',
  subtypes: ["committee"],
  configurables: `Find contributions from individual donors to <configurable :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of individual contributions to recipient committees in the selected list.`
}, {
  output: 'contribution',
  tags: ['campfin'],
  template: 'KWYZ',
  subtypes: ["candidate"],
  configurables: `Find contributions from individual donors to <configurable :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of individual contributions to recipient candidates in the selected list.`
}, {
  output: 'contribution',
  tags: ['campfin'],
  template: 'IQL2',
  subtypes: ["committee", "committee"],
  configurables: `Find contributions from <configurable :settings="settings(0)" @click="click(0)"></configurable> to <configurable :settings="settings(1)" @click="click(1)"></configurable>`,
  interpretation: `This recipe produces a list of contributions from contributor committees to recipient committees.`
}, {
  output: 'contribution',
  tags: ['campfin'],
  template: 'WK3K',
  subtypes: ["committee", "candidate"],
  configurables: `Find contributions from <configurable :settings="settings(0)" @click="click(0)"></configurable> to <configurable :settings="settings(1)" @click="click(1)"></configurable>`,
  interpretation: `This recipe produces a list of contributions from contributor committees to recipient candidates.`
}, {
  output: 'contribution',
  tags: ['campfin'],
  template: 'NcFz',
  subtypes: ["donor"],
  configurables: `Find contributions from individual donors in the list of <configurable :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of contributions from individual donors in the selected list.`
}, {
  output: 'contribution',
  tags: ['campfin'],
  template: 'm4YC',
  subtypes: ["employer"],
  configurables: `Find contributions from individual donors employed by <configurable :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of contributions from individual donors who were employed by employers in the selected list at the time the contribution was made.`
}, {
  output: 'contribution',
  tags: ['campfin'],
  template: 'Bs5W',
  subtypes: ["employer", "committee"],
  configurables: `Find contributions from individual donors employed by <configurable :settings="settings(0)" @click="click(0)"></configurable> to <configurable :settings="settings(1)" @click="click(1)"></configurable>`,
  interpretation: `This recipe produces a list of contributions from individual donors who were employed by employers in the first selected list at the time the contribution was made, to committees in the second selected list.`
}, {
  output: 'contribution',
  tags: ['campfin'],
  template: 'KR64',
  subtypes: ["employer", "candidate"],
  configurables: `Find contributions from individual donors employed by <configurable :settings="settings(0)" @click="click(0)"></configurable> to <configurable :settings="settings(1)" @click="click(1)"></configurable>`,
  interpretation: `This recipe produces a list of contributions from individual donors who were employed by employers in the first selected list at the time the contribution was made, to candidates in the second selected list.`
}, {
  output: 'contribution',
  tags: ['campfin'],
  template: '7v4P',
  subtypes: ["job"],
  configurables: `Find contributions from individual donors who work as <configurable :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of contributions from individual donors who held a job in the selected list at the time the contribution was made.`
}, {
  output: 'contribution',
  tags: ['campfin'],
  template: '6peF',
  subtypes: ["job", "committee"],
  configurables: `Find contributions from individual donors who work as <configurable :settings="settings(0)" @click="click(0)"></configurable> to <configurable :settings="settings(1)" @click="click(1)"></configurable>`,
  interpretation: `This recipe produces a list of contributions from individual donors who held a job in the first selected list at the time the contribution was made to committees in the second selected list.`
}, {
  output: 'contribution',
  tags: ['campfin'],
  template: 'F7Xn',
  subtypes: ["job", "candidate"],
  configurables: `Find contributions from individual donors who work as <configurable :settings="settings(0)" @click="click(0)"></configurable> to <configurable :settings="settings(1)" @click="click(1)"></configurable>`,
  interpretation: `This recipe produces a list of contributions from individual donors who held a job in the first selected list at the time the contribution was made to candidates in the second selected list.`
}, {
  output: 'contribution',
  tags: ['campfin'],
  template: 'T5xv',
  subtypes: ["job", "employer"],
  configurables: `Find contributions from individual donors who work as <configurable :settings="settings(0)" @click="click(0)"></configurable> for <configurable :settings="settings(1)" @click="click(1)"></configurable>`,
  interpretation: `This recipe produces a list of contributions from individual donors who held a job in the first selected list at an employer in the second selected list at the time the contribution was made.`
}, {
  output: 'contribution',
  tags: ['campfin'],
  template: 'F2mS',
  subtypes: ["job", "employer", "committee"],
  configurables: `Find contributions from individual donors who work as <configurable :settings="settings(0)" @click="click(0)"></configurable> for <configurable :settings="settings(1)" @click="click(1)"></configurable> to <configurable :settings="settings(2)" @click="click(2)"></configurable>`,
  interpretation: `This recipe produces a list of contributions from individual donors who held a job in the first selected list at an employer in the second selected list at the time the contribution was made to committees in the third selected list.`
}, {
  output: 'contribution',
  tags: ['campfin'],
  template: 'gXjA',
  subtypes: ["job", "employer", "candidate"],
  configurables: `Find contributions from individual donors who work as <configurable :settings="settings(0)" @click="click(0)"></configurable> for <configurable :settings="settings(1)" @click="click(1)"></configurable> to <configurable :settings="settings(2)" @click="click(2)"></configurable>`,
  interpretation: `This recipe produces a list of contributions from individual donors who held a job in the first selected list at an employer in the second selected list at the time the contribution was made to candidates in the third selected list.`
}, {
  output: 'lobbying',
  tags: ['lobbying'],
  template: 'wLvp',
  subtypes: ["employer"],
  configurables: `Find lobbying activity conducted by <configurable value="TiHlDe7JBzAXsc1xhlIL" :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of lobbying activity done by firms in the selected list.`
}, {
  output: 'lobbying',
  tags: ['lobbying'],
  template: 'kMER',
  subtypes: ["employer"],
  configurables: `Find lobbying activity conducted on behalf of <configurable :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of lobbying activity done on behalf of organizations in the selected list.`
}, {
  output: 'lobbying',
  tags: ['lobbying'],
  template: 'MJdb',
  subtypes: ["topic"],
  configurables: `Find lobbying activity related to <configurable :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of lobbying activity related to issues in the selected list.`
}, {
  output: 'lobbying',
  tags: ['campfin', 'lobbying'],
  template: 'PjyR',
  subtypes: ["employer"],
  configurables: `Find contributions by lobbyists employed by <configurable value="TiHlDe7JBzAXsc1xhlIL" :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of contributions by lobbyists affiliated with lobbying activity done by firms in the selected list.`
}, {
  output: 'lobbying',
  tags: ['campfin', 'lobbying'],
  template: 'WGb3',
  subtypes: ["employer"],
  configurables: `Find contributions by lobbyists lobbying on behalf of <configurable :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of contributions by lobbyists affiliated with lobbying activity done on behalf of organizations in the selected list.`
}, {
  output: 'lobbying',
  tags: ['campfin', 'lobbying'],
  template: 'MK93',
  subtypes: ["topic"],
  configurables: `Find contributions by lobbyists lobbying on <configurable :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of contributions by lobbyists affiliated with lobbying activity related to issues in the selected list.`
}, {
  output: 'lobbying',
  tags: ['lobbying'],
  template: 'V5Gh',
  subtypes: ["employer"],
  configurables: `Find honorary expenses associated with lobbying activity conducted by <configurable value="TiHlDe7JBzAXsc1xhlIL" :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of honorary expenses in filings with lobbying activity done by firms in the selected list.`
}, {
  output: 'lobbying',
  tags: ['lobbying'],
  template: '3Nrt',
  subtypes: ["employer"],
  configurables: `Find honorary expenses associated with lobbying activity conducted on behalf of <configurable :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of honorary expenses in filings with lobbying activity done on behalf of organizations in the selected list.`
}, {
  output: 'lobbying',
  tags: ['lobbying'],
  template: 'Q23x',
  subtypes: ["topic"],
  configurables: `Find honorary expenses associated with lobbying activity related to <configurable :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of honorary expenses in filings with lobbying activity related to issues in the selected list.`
}, {
  output: '990',
  tags: ['tax'],
  template: 'GCv2',
  subtypes: ["committee"],
  configurables: `Find 990 filings that mention committees in the list of <configurable :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of IRS 990 filings that mention the committees in the selected list.`
}, {
  output: '990',
  tags: ['tax'],
  template: 'P34n',
  subtypes: ["employer"],
  configurables: `Find 990 filings that mention organizations in the list of <configurable :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of IRS 990 filings that mention the organizations in the selected list.`
}, {
  output: '990',
  tags: ['tax'],
  template: 'K23r',
  subtypes: ["donor"],
  configurables: `Find 990 filings that mention people in the list of <configurable :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of IRS 990 filings that mention the people in the selected list.`
}, {
  output: 'ad',
  tags: ['narrative'],
  template: 'D3WE',
  subtypes: ["committee"],
  configurables: `Find Facebook ads purchased by entities affiliated with <configurable :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of Facebook ads where the buyer or page is in the selected list.`
}, {
  output: 'ad',
  tags: ['narrative'],
  template: 'BuW8',
  subtypes: ["committee"],
  configurables: `Find Facebook ads that mention committees in the list of <configurable :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of Facebook ads related to committees in the selected list.`
}, {
  output: 'ad',
  tags: ['narrative'],
  template: 'P2HG',
  subtypes: ["employer"],
  configurables: `Find Facebook ads that mention organizations in the list of <configurable :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of Facebook ads related to organizations in the selected list.`
}, {
  output: 'ad',
  tags: ['narrative'],
  template: 'N7Jk',
  subtypes: ["donor"],
  configurables: `Find Facebook ads that mention people in the list of <configurable :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of Facebook ads related to people in the selected list.`
}, {
  output: 'ad',
  tags: ['narrative'],
  template: '8HcR',
  subtypes: ["topic"],
  configurables: `Find Facebook ads with text about <configurable :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of Facebook ads related to issues in the selected list.`
}, {
  output: 'article',
  tags: ['narrative'],
  template: 'PMYZ',
  subtypes: ["committee"],
  configurables: `Find news articles that mention committees in the list of <configurable :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of news articles related to committees in the selected list.`
}, {
  output: 'article',
  tags: ['narrative'],
  template: 'WdMv',
  subtypes: ["employer"],
  configurables: `Find news articles that mention organizations in the list of <configurable :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of news articles related to organizations in the selected list.`
}, {
  output: 'article',
  tags: ['narrative'],
  template: 'RasK',
  subtypes: ["donor"],
  configurables: `Find news articles that mention people in the list of <configurable :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of news articles related to people in the selected list.`
}, {
  output: 'article',
  tags: ['narrative'],
  template: 'GSmB',
  subtypes: ["topic"],
  configurables: `Find news articles with text about <configurable :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of news articles related to issues in the selected list.`
}]
