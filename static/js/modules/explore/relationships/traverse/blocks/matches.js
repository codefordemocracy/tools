const matches = {
  template: `
    <div>
      <div class="flex justify-between items-center mb-3">
        <h3 class="text-xl text-dark-gray"><slot name="header"></slot></h3>
        <div class="flex items-center">
          <button class="btn btn-sm btn-gray mr-1" @click="modals.refine = true" v-if="!status.loading && !_.isEmpty(matches) && has.intermediaries && (intermediaries == 'contribution' || intermediaries == 'expenditure')"><i class="fas fa-cog"></i></button>
          <dropdown button="btn-sm btn-gray" text="Bulk Actions" menu="right-0 text-right dropdown-menu-xs border border-secondary" v-if="!_.isEmpty(matches)">
            <template v-if="interactions.selectable">
              <button class="dropdown-item" @click="selectAllPage()" :disabled="numbranches > 0">Select All<template v-if="paginate"> on Page</template></button>
              <button class="dropdown-item" @click="unselectAllPage()" :disabled="numbranches > 0">Unselect All<template v-if="paginate"> on Page</template></button>
              <div class="dropdown-divider"></div>
            </template>
            <button class="dropdown-item" @click="modals.download = true">Download Matches</button>
            <template v-if="interactions.selectable && paginate">
              <div class="dropdown-divider"></div>
              <button class="dropdown-item" @click="unselectAll()" :disabled="numbranches > 0">Unselect All</button>
            </template>
          </dropdown>
        </div>
      </div>
      <p class="font-light text-sm leading-relaxed mb-5"><slot name="intro"></slot></p>
      <div class="bg-xlight p-3 text-xs" v-if="_.isEmpty(matches)">
        <div v-if="status.loading">Loading<span class="blink">...</span></div>
        <template v-else>
          <slot name="none"></slot><span v-if="pagination.end && pagination.page > 1">. You've reached the end.</span>
        </template>
      </div>
      <div class="matches text-dark-gray" :class="{'hasdropdowns': !_.isEmpty(_.filter(dropdowns, {'open': true}))}">
        <table v-if="!_.isEmpty(matches)" class="text-xs w-full">
          <thead class="text-left align-bottom">
            <th class="bg-light" :class="column == 'Amount' ? 'text-right pr-5' : ''" v-for="column in columns">{{column}}</th>
            <th class="bg-light text-right">Actions</th>
          </thead>
          <tbody>
            <tr class="border-t border-secondary bg-xlight" v-for="match in matches">
              <td v-for="(value, key) in row(match)">
                <a :href="'https://www.fec.gov/data/candidate/' + value" target="_blank" v-if="key == 'Candidate ID'">{{value}}</a>
                <a :href="'https://www.fec.gov/data/committee/' + value" target="_blank" v-else-if="key == 'Committee ID'">{{value}}</a>
                <a :href="'https://docquery.fec.gov/cgi-bin/fecimg/?' + value" target="_blank" v-else-if="key == 'Image Number'">{{value}}</a>
                <a href="https://www.fec.gov/campaign-finance-data/committee-master-file-description/" target="_blank" v-else-if="key == 'Committee Designation' || key == 'Interest Group Category'">{{value}}</a>
                <a href="https://www.fec.gov/campaign-finance-data/contributions-individuals-file-description/" target="_blank" v-else-if="key == 'Entity Type' || key == 'Primary/General Indicator'">{{value}}</a>
                <a href="https://www.fec.gov/campaign-finance-data/party-code-descriptions/" target="_blank" v-else-if="key == 'Party Affiliation'">{{value}}</a>
                <a href="https://www.fec.gov/campaign-finance-data/committee-type-code-descriptions/" target="_blank" v-else-if="key == 'Committee Type'">{{value}}</a>
                <a href="https://www.fec.gov/campaign-finance-data/transaction-type-code-descriptions/" target="_blank" v-else-if="key == 'Transaction Type'">{{value}}</a>
                <a href="https://www.fec.gov/campaign-finance-data/report-type-code-descriptions/" target="_blank" v-else-if="key == 'Report Type'">{{value}}</a>
                <template v-else-if="key == 'Political Bias'">
                  <span v-if="value == '-3' || value == '-2'">Liberal</span>
                  <span v-if="value == '-1'">Left Leaning</span>
                  <span v-if="value == '0'">Moderate</span>
                  <span v-if="value == '1'">Right Leaning</span>
                  <span v-if="value == '2' || value == '3'">Conservative</span>
                </template>
                <template v-else-if="key == 'Factually Questionable' || key == 'Conspiracy' || key == 'Hate Group' || key == 'Propaganda' || key == 'Satire'">
                  <span v-if="value == '0'">False</span>
                  <span v-if="value == '1'">True</span>
                </template>
                <template v-else-if="key == 'Incumbent'">
                  <span v-if="value == 'I'">True</span>
                  <span v-else>False</span>
                </template>
                <div class="text-right pr-1" v-else-if="key == 'Contribution Amount'">{{value | currency}}</div>
                <a :href="'https://twitter.com/' + value" target="_blank" v-else-if="key == 'Handle'">@{{value}}</a>
                <a :href="'https://' + value" target="_blank" v-else-if="key == 'URL'">https://{{value}}</a>
                <template v-else>{{value}}</template>
              </td>
              <td class="actions">
                <template v-if="interactions.selectable">
                  <button @click="select(match.id)" :disabled="numbranches > 0" class="btn btn-sm btn-primary selectables" v-if="!_.includes(selected, match.id)">Select</button>
                  <button @click="unselect(match.id)" :disabled="numbranches > 0" class="btn btn-sm btn-red selectables" v-if="_.includes(selected, match.id)">Unselect</button>
                </template>
                <dropdown button="btn-sm btn-gray" text="Investigate" menu="right-0 text-right dropdown-menu-xs border border-secondary" @dropdown="dropdown">
                  <button @click="intermediate(match)" class="dropdown-item" v-if="has.intermediaries">View Details</button>
                  <button @click="expand(match)" class="dropdown-item" v-if="has.expansions">Expand Record</button>
                  <button @click="search(match)" class="dropdown-item" v-if="has.search">New Search</button>
                  <div class="dropdown-divider" v-if="countTrue([has.intermediaries, has.expansions, has.search]) > 0"></div>
                  <button @click="POPUP(ROOTURL + '/explore/relationships/graph/?mode=popup&nodes=' + stringify(_.map(_.filter(matches, {element: 'node'}), 'properties.uuid')) + '&edges=' + match.properties.uuid, 'popup-' + _.uniqueId(), 1, window)" class="dropdown-item" v-if="match.element == 'edge'">View in Graph Tool</button>
                  <button @click="POPUP(ROOTURL + '/explore/relationships/graph/?mode=popup&nodes=' + match.properties.uuid, 'popup-' + _.uniqueId(), 1, window)" class="dropdown-item" v-else>View in Graph Tool</button>
                </dropdown>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="flex justify-between items-center mt-5" v-if="paginate">
        <button class="btn btn-sm btn-light" @click="previous()" :disabled="pagination.page == 1 || status.paging">&larr; Previous Page</button>
        <div class="text-gray text-xs"><span v-if="status.paging">Loading new page...</span><span v-else-if="status.updating">Updating matches...</span><span v-else>Page {{pagination.page}}</span></div>
        <button class="btn btn-sm btn-light ml-3" @click="next()" :disabled="status.paging || pagination.end">Next Page &rarr;</button>
      </div>
      <modal :show="modals.refine" @cancel="modals.refine = false">
        <div slot="header">
          <h5 class="modal-title">Refine Matches</h5>
          <p class="modal-subtitle">You can refine the matches using the options below:</p>
        </div>
        <div slot="body" class="form-sm form-full pb-12 mb-5">
          <div class="form-group">
            <label class="label">Min <span v-if="intermediaries == 'contribution'">Contribution </span><span v-else-if="intermediaries == 'expenditure'">Expenditure </span>Date</label>
            <datepicker v-model="refine.dates.min" calendar-class="datepicker" format="yyyy-MM-dd" input-class="form-element" :disabled-dates="refine.disabledDates"></datepicker>
          </div>
          <div class="form-group">
            <label class="label">Max <span v-if="intermediaries == 'contribution'">Contribution </span><span v-else-if="intermediaries == 'expenditure'">Expenditure </span>Date</label>
            <datepicker v-model="refine.dates.max" calendar-class="datepicker" format="yyyy-MM-dd" input-class="form-element" :disabled-dates="refine.disabledDates"></datepicker>
          </div>
          <div class="form-group" v-if="intermediaries == 'contribution' && api.payload.entity != 'donor' && api.payload.entity2 != 'donor'">
            <label class="label">Direction of Contributions</label>
            <select v-model="refine.direction" class="form-element select pr-3">
              <option value="all">All</option>
              <option value="receipts">Receipts</option>
              <option value="disbursements">Disbursements</option>
            </select>
          </div>
          <div class="form-group" v-if="intermediaries == 'expenditure'">
            <label class="label">Support vs. Oppose</label>
            <select v-model="refine.sup_opp" class="form-element select pr-3">
              <option value="all">All</option>
              <option value="S">Support</option>
              <option value="O">Oppose</option>
            </select>
          </div>
        </div>
        <div slot="footer" class="flex justify-end">
          <button class="btn btn-sm btn-secondary mr-1" @click="modals.refine = false">Cancel</button>
          <button class="btn btn-sm btn-gray" @click="status.updating = true; get(true, false, false); status.refined = true; modals.refine = false">Update Matches</button>
        </div>
      </modal>
      <modal :show="modals.download" @cancel="modals.download = false">
        <div slot="header">
          <h5 class="modal-title">Download Matches</h5>
          <p class="modal-subtitle">You can download the matches using the options below:</p>
        </div>
        <div slot="body" class="form-sm form-full pb-12 mb-5">
          <div class="form-group">
            <label class="label">Format</label>
            <select v-model="download.format" class="form-element select pr-3">
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
            </select>
          </div>
          <div class="form-group">
            <label class="label">Page</label>
            <p class="form-text-top">Each page will contain up to 1000 matches.</p>
            <input class="form-element" v-model="download.page" type="number" min="1" />
          </div>
        </div>
        <div slot="footer" class="flex justify-end">
          <button class="btn btn-sm btn-secondary mr-1" @click="modals.download = false">Cancel</button>
          <button class="btn btn-sm btn-gray" @click="get(false, true, false); modals.download = false">Download Matches</button>
        </div>
      </modal>
    </div>
  `,
  props: {
    index: {
      type: Number,
      default: 0
    },
    mentity: String,
    has: {
      type: Object,
      default: () => ({
        intermediaries: false,
        expansions: false,
        search: false
      })
    },
    numbranches: Number,
    interactions: {
      type: Object,
      default: () => ({
        selectable: false
      })
    },
    api: {
      type: Object,
      default: () => ({
        endpoint: null,
        payload: {}
      })
    },
    qs: {
      type: Object,
      default: () => ({})
    },
    selected: Array
  },
  data() {
    return {
      status: {
        loading: true,
        paging: false,
        updating: false,
        refined: false
      },
      matches: [],
      pagination: {
        limit: 10,
        page: 1,
        end: false
      },
      dropdowns: [],
      modals: {
        refine: false,
        download: false
      },
      refine: {
        disabledDates: DATERANGES.disabledDates.datasets,
        dates: DATERANGES.dates.datasets,
        direction: 'all',
        sup_opp: 'all'
      },
      download: {
        format: 'csv',
        page: 1,
      }
    }
  },
  computed: {
    intermediaries() {
      if (!_.isUndefined(this.qs.intermediaries)){
        return this.qs.intermediaries
      } else {
        return _.get(_.get(this.$store.state.explore.intermediaries, this.api.payload.entity), this.api.payload.entity2)
      }
    },
    clean() {
      let self = this
      let clean = []
      _.forEach(this.matches, function(match) {
        clean.push(self.row(match))
      })
      return _.compact(clean)
    },
    columns() {
      return _.keys(this.clean[0])
    },
    paginate() {
      return (!(this.pagination.page == 1 && this.pagination.end) && !this.status.loading) || this.status.paging
    }
  },
  methods: {
    stringify(arr) {
      return JSON.stringify(_.compact(arr)).replace('[', '').replace(']', '').replace(/"/g, '')
    },
    dropdown(payload) {
      if (_.includes(_.map(this.dropdowns, 'id'), payload.id)) {
        this.dropdowns = _.map(this.dropdowns, function(d) {
          if (_.isEqual(d.id, payload.id)) {
            return payload
          }
          return d
        })
      } else {
        this.dropdowns = _.concat(this.dropdowns, payload)
      }
    },
    previous() {
      this.pagination.page--
      this.status.paging = true
      this.get()
    },
    next() {
      this.pagination.page++
      this.status.paging = true
      this.get()
    },
    get(refine=false, download=false, inspect=false) {
      var self = this
      let query = _.merge(this.api.payload, this.qs)
      if (this.status.refined == true) {
        query["dates"] = {
          min: moment(this.refine.dates.min, 'YYYY-MM-DD').format('YYYY-MM-DD'),
          max: moment(this.refine.dates.max, 'YYYY-MM-DD').format('YYYY-MM-DD')
        }
        query["direction"] = this.refine.direction
        query["sup_opp"] = this.refine.sup_opp
      }
      if (refine == true) {
        // reset pagination if not on first page
        if (this.pagination.page > 1) {
          this.pagination.page = 1
        }
      }
      if (download == true) {
        query["limit"] = 1000
        query["page"] = this.download.page
        axios.post(this.api.endpoint, query)
        .then(function(response) {
          let downloadable = []
          _.forEach(response.data, function(match) {
            downloadable.push(self.row(match))
          })
          DOWNLOAD(_.compact(downloadable), self.download.format, 'matches')
        })
        .catch(function(error) {
          console.error(error)
        })
      } else if (inspect == true) {
        query["limit"] = 1000
        query["page"] = this.inspect.page
        query["inspect"] = true
        axios.post(this.api.endpoint, query)
        .then(function(response) {
          config = encodeURIComponent(_.map(response.data, 'config'))
          window.open(ROOTURL + '/inspect/?source=config&string=' + config, '_blank')
        })
        .catch(function(error) {
          console.error(error)
        })
      } else {
        query["limit"] = this.pagination.limit
        query["page"] = this.pagination.page
        axios.post(this.api.endpoint, query)
        .then(function(response) {
          self.matches = response.data
          // determine if any more pages
          if (response.data.length < self.pagination.limit) {
            self.pagination.end = true
          } else {
            self.pagination.end = false
          }
          // reset statuses
          self.status.loading = false
          self.status.paging = false
          self.status.updating = false
          // if no mentity is provided, use the label from the matches
          if (_.isNil(self.mentity)) {
            self.mentity = _.lowerCase(self.matches[0].labels)
          }
        })
        .catch(function(error) {
          self.status.loading = false
          self.status.paging = false
          self.status.updating = false
          console.error(error)
        })
      }
    },
    select(id) {
      this.selected.push(id)
      this.$emit('onselect', this.selected)
    },
    unselect(id) {
      this.selected = _.filter(this.selected, function(n) {
        return !_.isEqual(n, id)
      })
      this.$emit('onselect', this.selected)
    },
    selectAllPage() {
      let ids = _.map(this.matches, 'id')
      this.selected = _.uniq(_.concat(this.selected, ids))
      this.$emit('onselect', this.selected)
    },
    unselectAllPage() {
      let ids = _.map(this.matches, 'id')
      this.selected = _.filter(this.selected, function(id) {
        return !_.includes(ids, id)
      })
      this.$emit('onselect', this.selected)
    },
    unselectAll() {
      let ids = _.map(this.matches, 'id')
      this.selected = []
      this.$emit('onselect', this.selected)
    },
    countTrue(payload) {
      let count = 0
      _.forEach(payload, function(value) {
        if (_.isEqual(value, true)) {
          count ++
        }
      })
      return count
    },
    row(match) {
      if (this.mentity == 'candidate') {
        return {
          'Candidate ID': match.properties.cand_id,
          'Name': match.properties.cand_name,
          'Party Affiliation': match.properties.cand_pty_affiliation,
          'Office': match.properties.cand_office,
          'State': match.properties.cand_office_st,
          'District': match.properties.cand_office_district,
          'Incumbent': match.properties.cand_ici,
          'Election Year': match.properties.cand_election_yr
        }
      } else if (this.mentity == 'committee') {
        return {
          'Committee ID': match.properties.cmte_id,
          'Name': match.properties.cmte_nm,
          'Committee Type': match.properties.cmte_tp,
          'Committee Designation': match.properties.cmte_dsgn,
          'Party Affiliation': match.properties.cmte_pty_affiliation,
          'Connected Organization Name': match.properties.connected_org_nm,
          'Interest Group Category': match.properties.org_tp
        }
      } else if (this.mentity == 'donor') {
        return {
          'Name': match.properties.name,
          'Employer': match.properties.employer,
          'Occupation': match.properties.occupation,
          'State': match.properties.state,
          'Zip Code': match.properties.zip_code,
          'Entity Type': match.properties.entity_tp
        }
      } else if (this.mentity == 'payee') {
        return {
          'Payee': match.properties.name
        }
      } else if (this.mentity == 'source') {
        return {
          'Domain': match.properties.domain,
          'Political Bias': match.properties.bias_score,
          'Factually Questionable': match.properties.factually_questionable_flag,
          'Conspiracy': match.properties.conspiracy_flag,
          'Hate Group': match.properties.hate_group_flag,
          'Propaganda': match.properties.propaganda_flag,
          'Satire': match.properties.satire_flag,
        }
      } else if (this.mentity == 'tweeter') {
        return {
          'ID': match.properties.user_id,
          'Handle': match.properties.username,
          'Name': match.properties.name
        }
      } else if (this.mentity == 'buyer') {
        return {
          'Name': match.properties.name
        }
      } else if (this.mentity == 'page') {
        return {
          'Name': match.properties.name
        }
      } else if (this.mentity == 'ad') {
        return {
          'URL': match.properties.url
        }
      } else if (this.mentity == 'tweet') {
        return {
          'ID': match.properties.tweet_id,
          'Date': match.properties.datetime.substring(0,10),
          'URL': match.properties.url
        }
      } else if (this.mentity == 'contribution') {
        return {
          'ID': match.properties.sub_id,
          'Image Number': match.properties.image_num,
          'Date': match.properties.datetime.substring(0,10),
          'Transaction Type': match.properties.transaction_tp,
          'Contribution Amount': this.$options.filters.currency(match.properties.transaction_amt),
          'Report Type': match.properties.rpt_tp,
          'Primary/General Indicator': match.properties.transaction_pgi
        }
      } else if (this.mentity == 'expenditure') {
        return {
          'Type': match.properties.type.toUpperCase(),
          'Image Number': match.properties.image_num,
          'Date': match.properties.datetime.substring(0,10),
          'Expenditure Amount': this.$options.filters.currency(match.properties.exp_amt),
          'Purpose': match.properties.purpose,
          'Support/Oppose': match.properties.sup_opp,
          'Candidate ID': match.properties.cand_id,
          'Candidate Name': match.properties.cand_name,
          'Candidate Party Affiliation': match.properties.cand_pty_affiliation,
          'Candidate Office': match.properties.cand_office,
          'Candidate State': match.properties.cand_office_st,
          'Candidate District': match.properties.cand_office_district
        }
      }
    },
    term(match) {
      if (this.mentity == 'candidate') {
        return match.properties.cand_name
      } else if (this.mentity == 'committee') {
        return match.properties.cmte_nm
      } else if (this.mentity == 'donor') {
        return match.properties.name
      } else if (this.mentity == 'payee') {
        return match.properties.name
      } else if (this.mentity == 'source') {
        return match.properties.domain
      } else if (this.mentity == 'tweeter') {
        return '@' + match.properties.username
      } else if (this.mentity == 'buyer') {
        return match.properties.name
      } else if (this.mentity == 'page') {
        return match.properties.name
      } else if (this.mentity == 'ad') {
        return 'Ad #' + match.properties.id
      } else if (this.mentity == 'tweet') {
        return 'Tweet #' + match.properties.tweet_id
      } else if (this.mentity == 'contribution') {
        return 'Contribution #' + match.properties.sub_id
      } else if (this.mentity == 'expenditure') {
        return match.properties.datetime.substring(0,10) + ' ' + match.properties.purpose
      }
    },
    intermediate(match) {
      this.$emit('investigate', {type: 'intermediate', term: this.term(match), ids: [match.id], qs: this.qs, index: this.index})
    },
    expand(match) {
      this.$emit('investigate', {type: 'expand', term: this.term(match), ids: [match.id]})
    },
    search(match) {
      this.$emit('investigate', {type: 'search', entity: this.mentity, term: this.term(match)})
    }
  },
  mounted() {
    this.get()
  }
}
