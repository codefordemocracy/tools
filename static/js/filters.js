/* Formatting Filters */

Vue.filter('prettify', function (value) {
  try { return JSON.stringify(value, null, 2) }
  catch { return value }
})

/* Numerical Filters */

Vue.filter('currency', function (value) {
  if (typeof value !== "number") {
      return value;
  }
  var formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
  });
  return formatter.format(value);
});

Vue.filter('numbreviate', function (value) {
  try {
    if (Math.abs(value) > 1000000000) {
      return (value/1000000000).toFixed(1) + 'B'
    } else if (Math.abs(value) > 1000000) {
      return (value/1000000).toFixed(1) + 'M'
    } else if (Math.abs(value) > 1000) {
      return (value/1000).toFixed(1) + 'K'
    } else {
      return value
    }
  }
  catch { return value }
})

/* Text Filters */

Vue.filter('plural', function (value) {
  if (value == "candidate") {
      return "candidates"
  } else if (value == "committee") {
      return "committees"
  } else if (value == "donor") {
      return "donors"
  } else if (value == "payee") {
      return "payees"
  } else if (value == "employer") {
      return "employers"
  } else if (value == "job") {
      return "jobs"
  } else if (value == "source") {
      return "sources"
  } else if (value == "tweeter") {
      return "tweeters"
  } else if (value == "buyer") {
      return "buyers"
  } else if (value == "page") {
      return "pages"
  } else if (value == "contribution") {
      return "contributions"
  } else if (value == "expenditure") {
      return "expenditures"
  }
  return value
});
