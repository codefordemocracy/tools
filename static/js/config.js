/* URLs */

const ROOTURL = 'https://tools.codefordemocracy.org'
const ACCOUNTURL = 'https://account.codefordemocracy.org'

/* Placeholders */

const PLACEHOLDERS = {
  candidate: ['Donald Trump', 'Bill Weld', 'Joseph Biden', 'Elizabeth Warren', 'Bernard Sanders', 'Kamala Harris', 'Pete Buttigieg', 'Robert Beto O’Rourke', 'Andrew Yang', 'Cory Booker', 'Amy Klobuchar', 'Mitch McConnell', 'Nancy Pelosi'],
  committee: ['DCCC', 'NRCC', 'DSCC', 'NRSC', 'Northrop Grumman', 'Comcast'],
  donor: ['Sheldon Adelson', 'Michael Bloomberg', 'Thomas Steyer', 'Richard Uihlein', 'Donald Sussman', 'James Simons', 'George Soros', 'Jeffrey Bezos', 'Reid Hoffman'],
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

/* Categories */

const OPTIONS_PTY_AFFILIATION = [
  {label: 'Democrat (DEM)', value: 'DEM'},
  {label: 'Republican (REP)', value: 'REP'}
]

const OPTIONS_CAND_OFFICE = [
  {label: 'House (H)', value: 'H'},
  {label: 'Senate (S)', value: 'S'},
  {label: 'President (P)', value: 'P'}
]

const OPTIONS_CAND_ICI = [
  {label: 'Incumbent (I)', value: 'I'},
  {label: 'Challenger (C)', value: 'C'},
  {label: 'Open Seat (O)', value: 'O'}
]

const OPTIONS_CMTE_DSGN = [
  {label: 'Authorized by a candidate (A)', value: 'A'},
  {label: 'Leadership PAC (D)', value: 'D'},
  {label: 'Joint fundraiser (J)', value: 'J'},
  {label: 'Lobbyist/Registrant PAC (B)', value: 'B'},
  {label: 'Principal campaign committee of a candidate (P)', value: 'P'},
  {label: 'Unauthorized (U)', value: 'U'}
]

const OPTIONS_CMTE_TP = [
  {label: 'House (H)', value: 'H'},
  {label: 'Senate (S)', value: 'S'},
  {label: 'Presidential (P)', value: 'P'},
  {label: 'PAC - qualified (Q)', value: 'Q'},
  {label: 'PAC - nonqualified (N)', value: 'N'},
  {label: 'PAC with non-contribution account - qualified (W)', value: 'W'},
  {label: 'PAC with non-contribution account - nonqualified (V)', value: 'V'},
  {label: 'Independent expenditure-only (Super PACs) (O)', value: 'O'},
  {label: 'Independent expenditor (person or group) (I)', value: 'I'},
  {label: 'Single-candidate independent expenditure (U)', value: 'U'},
  {label: 'Party - qualified (Y)', value: 'Y'},
  {label: 'Party - nonqualified (X)', value: 'X'},
  {label: 'National party nonfederal account (Z)', value: 'Z'},
  {label: 'Electioneering communication (E)', value: 'E'},
  {label: 'Communication cost (C)', value: 'C'},
  {label: 'Delegate committee (D)', value: 'D'}
]

const OPTIONS_ORG_TP = [
  {label: 'Corporation (C)', value: 'C'},
  {label: 'Labor organization (L)', value: 'L'},
  {label: 'Membership organization (M)', value: 'M'},
  {label: 'Trade association (T)', value: 'T'},
  {label: 'Cooperative (V)', value: 'V'},
  {label: 'Corporation without capital stock (W)', value: 'W'}
]

const OPTIONS_ENTITY_TP = [
  {label: 'Individual (IND)', value: 'IND'},
  {label: 'Organization (ORG)', value: 'ORG'}
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
    fixed: {
      min: moment().subtract(4, 'months').toDate(),
      max: moment().toDate()
    },
    open: {
      min: moment().subtract(4, 'months').toDate(),
      max: null
    }
  }
}

/* Recipes */

const RECIPES = [{
  output: 'contribution',
  tags: ['campfin'],
  template: 'ReqQ',
  subtypes: ["committee"],
  configurables: `contributions from <configurable :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of contributions from contributor committees in the selected list.`
}, {
  output: 'contribution',
  tags: ['campfin'],
  template: 'VqHR',
  subtypes: ["committee"],
  configurables: `contributions from committees to <configurable :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of committee contributions to recipient committees in the selected list.`
}, {
  output: 'contribution',
  tags: ['campfin'],
  template: 'DXhw',
  subtypes: ["candidate"],
  configurables: `contributions from committees to <configurable :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of committee contributions to recipient candidates in the selected list.`
}, {
  output: 'contribution',
  tags: ['campfin'],
  template: 'dFMy',
  subtypes: ["committee"],
  configurables: `contributions from individual donors to <configurable :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of individual contributions to recipient committees in the selected list.`
}, {
  output: 'contribution',
  tags: ['campfin'],
  template: 'KWYZ',
  subtypes: ["candidate"],
  configurables: `contributions from individual donors to <configurable :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of individual contributions to recipient candidates in the selected list.`
}, {
  output: 'contribution',
  tags: ['campfin'],
  template: 'IQL2',
  subtypes: ["committee", "committee"],
  configurables: `contributions from <configurable :settings="settings(0)" @click="click(0)"></configurable> to <configurable :settings="settings(1)" @click="click(1)"></configurable>`,
  interpretation: `This recipe produces a list of contributions from contributor committees to recipient committees.`
}, {
  output: 'contribution',
  tags: ['campfin'],
  template: 'WK3K',
  subtypes: ["committee", "candidate"],
  configurables: `contributions from <configurable :settings="settings(0)" @click="click(0)"></configurable> to <configurable :settings="settings(1)" @click="click(1)"></configurable>`,
  interpretation: `This recipe produces a list of contributions from contributor committees to recipient candidates.`
}, {
  output: 'contribution',
  tags: ['campfin'],
  template: 'NcFz',
  subtypes: ["donor"],
  configurables: `contributions from individual donors in the list of <configurable :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of contributions from individual donors in the selected list.`
}, {
  output: 'contribution',
  tags: ['campfin'],
  template: 'm4YC',
  subtypes: ["employer"],
  configurables: `contributions from individual donors employed by <configurable :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of contributions from individual donors who were employed by employers in the selected list at the time the contribution was made.`
}, {
  output: 'contribution',
  tags: ['campfin'],
  template: 'Bs5W',
  subtypes: ["employer", "committee"],
  configurables: `contributions from individual donors employed by <configurable :settings="settings(0)" @click="click(0)"></configurable> to <configurable :settings="settings(1)" @click="click(1)"></configurable>`,
  interpretation: `This recipe produces a list of contributions from individual donors who were employed by employers in the first selected list at the time the contribution was made, to committees in the second selected list.`
}, {
  output: 'contribution',
  tags: ['campfin'],
  template: 'KR64',
  subtypes: ["employer", "candidate"],
  configurables: `contributions from individual donors employed by <configurable :settings="settings(0)" @click="click(0)"></configurable> to <configurable :settings="settings(1)" @click="click(1)"></configurable>`,
  interpretation: `This recipe produces a list of contributions from individual donors who were employed by employers in the first selected list at the time the contribution was made, to candidates in the second selected list.`
}, {
  output: 'contribution',
  tags: ['campfin'],
  template: '7v4P',
  subtypes: ["job"],
  configurables: `contributions from individual donors who work as <configurable :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of contributions from individual donors who held a job in the selected list at the time the contribution was made.`
}, {
  output: 'contribution',
  tags: ['campfin'],
  template: '6peF',
  subtypes: ["job", "committee"],
  configurables: `contributions from individual donors who work as <configurable :settings="settings(0)" @click="click(0)"></configurable> to <configurable :settings="settings(1)" @click="click(1)"></configurable>`,
  interpretation: `This recipe produces a list of contributions from individual donors who held a job in the first selected list at the time the contribution was made to committees in the second selected list.`
}, {
  output: 'contribution',
  tags: ['campfin'],
  template: 'F7Xn',
  subtypes: ["job", "candidate"],
  configurables: `contributions from individual donors who work as <configurable :settings="settings(0)" @click="click(0)"></configurable> to <configurable :settings="settings(1)" @click="click(1)"></configurable>`,
  interpretation: `This recipe produces a list of contributions from individual donors who held a job in the first selected list at the time the contribution was made to candidates in the second selected list.`
}, {
  output: 'contribution',
  tags: ['campfin'],
  template: 'T5xv',
  subtypes: ["job", "employer"],
  configurables: `contributions from individual donors who work as <configurable :settings="settings(0)" @click="click(0)"></configurable> for <configurable :settings="settings(1)" @click="click(1)"></configurable>`,
  interpretation: `This recipe produces a list of contributions from individual donors who held a job in the first selected list at an employer in the second selected list at the time the contribution was made.`
}, {
  output: 'contribution',
  tags: ['campfin'],
  template: 'F2mS',
  subtypes: ["job", "employer", "committee"],
  configurables: `contributions from individual donors who work as <configurable :settings="settings(0)" @click="click(0)"></configurable> for <configurable :settings="settings(1)" @click="click(1)"></configurable> to <configurable :settings="settings(2)" @click="click(2)"></configurable>`,
  interpretation: `This recipe produces a list of contributions from individual donors who held a job in the first selected list at an employer in the second selected list at the time the contribution was made to committees in the third selected list.`
}, {
  output: 'contribution',
  tags: ['campfin'],
  template: 'gXjA',
  subtypes: ["job", "employer", "candidate"],
  configurables: `contributions from individual donors who work as <configurable :settings="settings(0)" @click="click(0)"></configurable> for <configurable :settings="settings(1)" @click="click(1)"></configurable> to <configurable :settings="settings(2)" @click="click(2)"></configurable>`,
  interpretation: `This recipe produces a list of contributions from individual donors who held a job in the first selected list at an employer in the second selected list at the time the contribution was made to candidates in the third selected list.`
}, {
  output: 'lobbying',
  tags: ['lobbying'],
  template: 'wLvp',
  subtypes: ["employer"],
  configurables: `lobbying disclosures for lobbying conducted by <configurable value="TiHlDe7JBzAXsc1xhlIL" :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of lobbying disclosures for lobbying done by firms in the selected list.`
}, {
  output: 'lobbying',
  tags: ['lobbying'],
  template: 'kMER',
  subtypes: ["employer"],
  configurables: `lobbying disclosures for lobbying conducted on behalf of clients who are <configurable :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of lobbying disclosures for lobbying done on behalf of organizations in the selected list.`
}, {
  output: 'lobbying',
  tags: ['lobbying'],
  template: 'MJdb',
  subtypes: ["topic"],
  configurables: `lobbying disclosures for lobbying related to <configurable :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of lobbying disclosures for lobbying related to issues in the selected list.`
}, {
  output: 'lobbying',
  tags: ['lobbying'],
  template: 'PLWg',
  subtypes: ["employer"],
  configurables: `lobbying activity conducted by <configurable value="TiHlDe7JBzAXsc1xhlIL" :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of lobbying activity done by firms in the selected list.`
}, {
  output: 'lobbying',
  tags: ['lobbying'],
  template: 'QJeb',
  subtypes: ["employer"],
  configurables: `lobbying activity conducted on behalf of clients who are <configurable :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of lobbying activity done on behalf of organizations in the selected list.`
}, {
  output: 'lobbying',
  tags: ['lobbying'],
  template: 'nNKT',
  subtypes: ["topic"],
  configurables: `lobbying activity related to <configurable :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of lobbying activity related to issues in the selected list.`
}, {
  output: 'lobbying',
  tags: ['campfin', 'lobbying'],
  template: 'PjyR',
  subtypes: ["employer"],
  configurables: `contributions by lobbying firms who are <configurable value="TiHlDe7JBzAXsc1xhlIL" :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of contributions by lobbying firms in the selected list.`
}, {
  output: 'lobbying',
  tags: ['campfin', 'lobbying'],
  template: 'WGb3',
  subtypes: ["employer"],
  configurables: `contributions by lobbying firms lobbying on behalf of clients who are <configurable :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of contributions by lobbying firms affiliated with lobbying activity done on behalf of organizations in the selected list.`
}, {
  output: 'lobbying',
  tags: ['campfin', 'lobbying'],
  template: 'MK93',
  subtypes: ["topic"],
  configurables: `contributions by lobbying firms lobbying on <configurable :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of contributions by lobbying firms affiliated with lobbying activity related to issues in the selected list.`
}, {
  output: 'lobbying',
  tags: ['campfin', 'lobbying'],
  template: 'A3ue',
  subtypes: ["donor"],
  configurables: `contributions by lobbyists in the list of <configurable :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of contributions by lobbyists in the selected list.`
}, {
  output: 'lobbying',
  tags: ['campfin', 'lobbying'],
  template: 'rXwv',
  subtypes: ["employer"],
  configurables: `contributions by lobbyists lobbying on behalf of clients who are <configurable :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of contributions by lobbyists lobbying on behalf of organizations in the selected list.`,
  warning: 'This recipe may produce an unusual number of false negatives. Interpret results with caution.'
}, {
  output: 'lobbying',
  tags: ['campfin', 'lobbying'],
  template: 'i5xq',
  subtypes: ["topic"],
  configurables: `contributions by lobbyists lobbying on <configurable :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of contributions by lobbyists lobbying on issues in the selected list.`,
  warning: 'This recipe may produce an unusual number of false negatives. Interpret results with caution.'
}, {
  output: 'lobbying',
  tags: ['lobbying'],
  template: 'V5Gh',
  subtypes: ["employer"],
  configurables: `honorary expenses associated with lobbying firms who are <configurable value="TiHlDe7JBzAXsc1xhlIL" :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of honorary expenses in filings by registrants in the selected list.`
}, {
  output: 'lobbying',
  tags: ['lobbying'],
  template: '3Nrt',
  subtypes: ["employer"],
  configurables: `honorary expenses associated with lobbying firms lobbying on on behalf of clients who are <configurable :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of honorary expenses in filings by registrants with lobbying activity done on behalf of organizations in the selected list.`
}, {
  output: 'lobbying',
  tags: ['lobbying'],
  template: 'Q23x',
  subtypes: ["topic"],
  configurables: `honorary expenses associated with lobbying firms lobbying on <configurable :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of honorary expenses in filings by registrants with lobbying activity related to issues in the selected list.`
}, {
  output: 'lobbying',
  tags: ['lobbying'],
  template: 'Hsqk',
  subtypes: ["donor"],
  configurables: `honorary expenses associated with lobbyists in the list of <configurable :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of honorary expenses in filings by lobbyists in the selected list.`
}, {
  output: 'lobbying',
  tags: ['lobbying'],
  template: 'JCXA',
  subtypes: ["employer"],
  configurables: `honorary expenses associated with lobbyists lobbying on behalf of clients who are <configurable :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of honorary expenses in filings by lobbyists lobbying on behalf of organizations in the selected list.`,
  warning: 'This recipe may produce an unusual number of false negatives. Interpret results with caution.'
}, {
  output: 'lobbying',
  tags: ['lobbying'],
  template: '7EyP',
  subtypes: ["topic"],
  configurables: `honorary expenses associated with lobbyists lobbying on <configurable :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of honorary expenses in filings by lobbyists lobbying on issues in the selected list.`,
  warning: 'This recipe may produce an unusual number of false negatives. Interpret results with caution.'
}, {
  output: 'expenditure',
  tags: ['campfin'],
  template: 'qSMe',
  subtypes: ["committee"],
  configurables: `independent expenditures by <configurable :settings="settings(0)" @click="click(0)"></configurable></configurable>`,
  interpretation: `This recipe produces a list of independent expenditures by committees in the selected list.`,
  warning: 'This recipe may produce an unusual number of duplicated records. Interpret results with caution.'
}, {
  output: 'expenditure',
  tags: ['campfin'],
  template: 'kKSg',
  subtypes: ["committee"],
  configurables: `independent expenditures that pay <configurable :settings="settings(0)" @click="click(0)"></configurable></configurable>`,
  interpretation: `This recipe produces a list of independent expenditures that paid committees in the selected list.`,
  warning: 'This recipe may produce an unusual number of duplicated records. Interpret results with caution.'
}, {
  output: 'expenditure',
  tags: ['campfin'],
  template: 'Ft9G',
  subtypes: ["employer"],
  configurables: `independent expenditures that pay <configurable :settings="settings(0)" @click="click(0)"></configurable></configurable>`,
  interpretation: `This recipe produces a list of independent expenditures that paid employers in the selected list.`,
  warning: 'This recipe may produce an unusual number of duplicated records. Interpret results with caution.'
}, {
  output: 'expenditure',
  tags: ['campfin'],
  template: 'ZfYW',
  subtypes: ["candidate"],
  configurables: `independent expenditures that identify <configurable :settings="settings(0)" @click="click(0)"></configurable></configurable>`,
  interpretation: `This recipe produces a list of independent expenditures that identify candidates in the selected list.`,
  warning: 'This recipe may produce an unusual number of duplicated records. Interpret results with caution.'
}, {
  output: 'expenditure',
  tags: ['campfin'],
  template: 'FEzU',
  subtypes: ["topic"],
  configurables: `independent expenditures that mention <configurable :settings="settings(0)" @click="click(0)"></configurable></configurable>`,
  interpretation: `This recipe produces a list of independent expenditures that mention topics in the selected list as the purpose.`,
  warning: 'This recipe may produce an unusual number of duplicated records. Interpret results with caution.'
}, {
  output: 'expenditure',
  tags: ['campfin'],
  template: 'MJAh',
  subtypes: ["committee"],
  configurables: `operating expenditures by <configurable :settings="settings(0)" @click="click(0)"></configurable></configurable>`,
  interpretation: `This recipe produces a list of operating expenditures by committees in the selected list.`,
}, {
  output: 'expenditure',
  tags: ['campfin'],
  template: 'RncJ',
  subtypes: ["committee"],
  configurables: `operating expenditures that pay <configurable :settings="settings(0)" @click="click(0)"></configurable></configurable>`,
  interpretation: `This recipe produces a list of operating expenditures that paid committees in the selected list.`,
}, {
  output: 'expenditure',
  tags: ['campfin'],
  template: 'Wq88',
  subtypes: ["employer"],
  configurables: `operating expenditures that pay <configurable :settings="settings(0)" @click="click(0)"></configurable></configurable>`,
  interpretation: `This recipe produces a list of operating expenditures that paid employers in the selected list.`,
}, {
  output: 'expenditure',
  tags: ['campfin'],
  template: 'Mtr2',
  subtypes: ["donor"],
  configurables: `operating expenditures that pay <configurable :settings="settings(0)" @click="click(0)"></configurable></configurable>`,
  interpretation: `This recipe produces a list of operating expenditures that paid donors in the selected list.`,
}, {
  output: 'expenditure',
  tags: ['campfin'],
  template: '8ErS',
  subtypes: ["topic"],
  configurables: `operating expenditures that mention <configurable :settings="settings(0)" @click="click(0)"></configurable></configurable>`,
  interpretation: `This recipe produces a list of operating expenditures that mention topics in the selected list as the purpose.`,
  warning: 'This recipe may produce an unusual number of duplicated records. Interpret results with caution.'
}, {
  output: '990',
  tags: ['tax'],
  template: 'GCv2',
  subtypes: ["committee"],
  configurables: `990 filings that mention committees in the list of <configurable :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of IRS 990 filings that mention the committees in the selected list.`,
  warning: 'This recipe may produce an unusual number of false positives. Interpret results with caution.'
}, {
  output: '990',
  tags: ['tax'],
  template: 'P34n',
  subtypes: ["employer"],
  configurables: `990 filings that mention organizations in the list of <configurable :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of IRS 990 filings that mention the organizations in the selected list.`,
  warning: 'This recipe may produce an unusual number of false positives. Interpret results with caution.'
}, {
  output: '990',
  tags: ['tax'],
  template: 'K23r',
  subtypes: ["donor"],
  configurables: `990 filings that mention people in the list of <configurable :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of IRS 990 filings that mention the people in the selected list.`,
  warning: 'This recipe may produce an unusual number of false positives. Interpret results with caution.'
}, {
  output: '990',
  tags: ['tax'],
  template: 'mFF7',
  subtypes: ["candidate"],
  configurables: `990 filings that mention people in the list of <configurable :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of IRS 990 filings that mention the candidates in the selected list.`,
  warning: 'This recipe may produce an unusual number of false positives. Interpret results with caution.'
}, {
  output: '990',
  tags: ['tax'],
  template: '9q84',
  subtypes: ["topic"],
  configurables: `990 filings with text about <configurable :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of IRS 990 filings related to issues in the selected list.`,
  warning: 'This recipe may produce an unusual number of false positives. Interpret results with caution.'
}, {
  output: 'ad',
  tags: ['narrative'],
  template: 'D3WE',
  subtypes: ["committee"],
  configurables: `Facebook ads purchased by entities affiliated with <configurable :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of Facebook ads where the buyer or page is in the selected list.`,
  warning: 'This recipe may produce an unusual number of false positives. Interpret results with caution.'
}, {
  output: 'ad',
  tags: ['narrative'],
  template: 'BuW8',
  subtypes: ["committee"],
  configurables: `Facebook ads that mention committees in the list of <configurable :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of Facebook ads related to committees in the selected list.`,
  warning: 'This recipe may produce an unusual number of false positives. Interpret results with caution.'
}, {
  output: 'ad',
  tags: ['narrative'],
  template: 'P2HG',
  subtypes: ["employer"],
  configurables: `Facebook ads that mention organizations in the list of <configurable :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of Facebook ads related to organizations in the selected list.`,
  warning: 'This recipe may produce an unusual number of false positives. Interpret results with caution.'
}, {
  output: 'ad',
  tags: ['narrative'],
  template: 'N7Jk',
  subtypes: ["donor"],
  configurables: `Facebook ads that mention people in the list of <configurable :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of Facebook ads related to people in the selected list.`,
  warning: 'This recipe may produce an unusual number of false positives. Interpret results with caution.'
}, {
  output: 'ad',
  tags: ['narrative'],
  template: 'Jphg',
  subtypes: ["candidate"],
  configurables: `Facebook ads that mention people in the list of <configurable :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of Facebook ads related to candidates in the selected list.`,
  warning: 'This recipe may produce an unusual number of false positives. Interpret results with caution.'
}, {
  output: 'ad',
  tags: ['narrative'],
  template: '8HcR',
  subtypes: ["topic"],
  configurables: `Facebook ads with text about <configurable :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of Facebook ads related to issues in the selected list.`,
  warning: 'This recipe may produce an unusual number of false positives. Interpret results with caution.'
}, {
  output: 'article',
  tags: ['narrative'],
  template: 'PMYZ',
  subtypes: ["committee"],
  configurables: `news articles that mention committees in the list of <configurable :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of news articles related to committees in the selected list.`,
  warning: 'This recipe may produce an unusual number of false positives and false negatives. Interpret results with caution.'
}, {
  output: 'article',
  tags: ['narrative'],
  template: 'WdMv',
  subtypes: ["employer"],
  configurables: `news articles that mention organizations in the list of <configurable :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of news articles related to organizations in the selected list.`,
  warning: 'This recipe may produce an unusual number of false positives and false negatives. Interpret results with caution.'
}, {
  output: 'article',
  tags: ['narrative'],
  template: 'RasK',
  subtypes: ["donor"],
  configurables: `news articles that mention people in the list of <configurable :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of news articles related to people in the selected list.`,
  warning: 'This recipe may produce an unusual number of false positives and false negatives. Interpret results with caution.'
}, {
  output: 'article',
  tags: ['narrative'],
  template: 'EBli',
  subtypes: ["candidate"],
  configurables: `news articles that mention people in the list of <configurable :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of news articles related to candidates in the selected list.`,
  warning: 'This recipe may produce an unusual number of false positives and false negatives. Interpret results with caution.'
}, {
  output: 'article',
  tags: ['narrative'],
  template: 'GSmB',
  subtypes: ["topic"],
  configurables: `news articles with text about <configurable :settings="settings(0)" @click="click(0)"></configurable>`,
  interpretation: `This recipe produces a list of news articles related to issues in the selected list.`,
  warning: 'This recipe may produce an unusual number of false positives and false negatives. Interpret results with caution.'
}, {
  output: 'article',
  tags: ['narrative'],
  template: 'hSaE',
  subtypes: ["committee", "source"],
  configurables: `news articles that mention committees in the list of <configurable :settings="settings(0)" @click="click(0)"></configurable> that were published by <configurable :settings="settings(1)" @click="click(1)"></configurable> `,
  interpretation: `This recipe produces a list of news articles related to committees in the second selected list by news sources in the second list.`,
  warning: 'This recipe may produce an unusual number of false positives and false negatives. Interpret results with caution.'
}, {
  output: 'article',
  tags: ['narrative'],
  template: 'PqAA',
  subtypes: ["employer", "source"],
  configurables: `news articles that mention organizations in the list of <configurable :settings="settings(0)" @click="click(0)"></configurable> that were published by <configurable :settings="settings(1)" @click="click(1)"></configurable>`,
  interpretation: `This recipe produces a list of news articles related to organizations in the second selected list by news sources in the second list.`,
  warning: 'This recipe may produce an unusual number of false positives and false negatives. Interpret results with caution.'
}, {
  output: 'article',
  tags: ['narrative'],
  template: 'FBRq',
  subtypes: ["donor", "source"],
  configurables: `news articles that mention people in the list of <configurable :settings="settings(0)" @click="click(0)"></configurable> that were published by <configurable :settings="settings(1)" @click="click(1)"></configurable>`,
  interpretation: `This recipe produces a list of news articles related to people in the first selected list by news sources in the second list.`,
  warning: 'This recipe may produce an unusual number of false positives and false negatives. Interpret results with caution.'
}, {
  output: 'article',
  tags: ['narrative'],
  template: 'CpsR',
  subtypes: ["candidate", "source"],
  configurables: `news articles that mention people in the list of <configurable :settings="settings(0)" @click="click(0)"></configurable> that were published by <configurable :settings="settings(1)" @click="click(1)"></configurable>`,
  interpretation: `This recipe produces a list of news articles related to candidates in the first selected list by news sources in the second list.`,
  warning: 'This recipe may produce an unusual number of false positives and false negatives. Interpret results with caution.'
}, {
  output: 'article',
  tags: ['narrative'],
  template: '2uJX',
  subtypes: ["topic", "source"],
  configurables: `news articles with text about <configurable :settings="settings(0)" @click="click(0)"></configurable> that were published by <configurable :settings="settings(1)" @click="click(1)"></configurable>`,
  interpretation: `This recipe produces a list of news articles related to issues in the first selected list by news sources in the second list.`,
  warning: 'This recipe may produce an unusual number of false positives and false negatives. Interpret results with caution.'
}]

/* Alerts */

const MAX_ACTIVE_ALERTS = 20
