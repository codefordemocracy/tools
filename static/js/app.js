/* Shared Config */

const ROOTURL = 'https://explore.codefordemocracy.org'

/* Shared Functions */

const DOWNLOAD = function(elements, format, filename) {
  if (format == 'json') {
    file = new Blob([JSON.stringify(elements, null, 2)], {type: 'application/javascript;charset=utf-8'})
    saveAs(file, filename + '.json');
  } else if (format == 'csv') {
    axios.post('/format/flat/', elements)
    .then(function(response) {
      keys = _.uniq(_.map(response, function(ele) { return _.keys(ele) }))
      data = Papa.unparse((response), {columns: keys})
      file = new Blob([data], {type: "text/plain;charset=utf-8"})
      saveAs(file, filename + '.csv')
    })
    .catch(function(error) {
      console.error(error)
    })
  }
}

/* Shared Lists */

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

/* Shared Date Settings */

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
      min: moment().add(1, 'days').subtract(3, 'months').format('YYYY-MM-DD'),
      max: moment().add(1, 'days').format('YYYY-MM-DD')
    },
    fec: {
      min: moment('2019-01-01', 'YYYY-MM-DD').add(1, 'days').toDate(),
      max: moment('2020-12-31', 'YYYY-MM-DD').add(1, 'days').toDate(),
    }
  }
}

/* Initialize Navbar */

new Vue({
  el: '#navbar',
  data: {
    open: false
  }
})
