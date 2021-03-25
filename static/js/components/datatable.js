const datatable = {
  template: `
  <div>
    <table>
      <thead>
        <th v-for="column in columns">{{column}}</th>
      </thead>
      <tbody>
        <tr class="border-top" v-for="row in table">
          <td v-for="value in _.values(row)">{{value}}</td>
        </tr>
      </tbody>
    </table>
    <div class="d-flex justify-content-between align-items-center pt-1 border-top" v-if="options.paginate == 'yes'">
      <button class="btn" :class="button" @click="previous()" :disabled="page == 1">&larr; Previous Page</button>
      <div>Page {{page}} of {{options.numpages}}</div>
      <button class="btn pl-3" :class="button" @click="next()" :disabled="page == options.numpages">Next Page &rarr;</button>
    </div>
  </div>
  `,
  props: {
    columns: Array,
    data: Array,
    options: {
      type: Object,
      default: function () {
        return {
          paginate: 'yes',
          numpages: 1
        }
      }
    },
    button: String
  },
  data() {
    return {
      page: 1
    }
  },
  computed: {
    table() {
      if (this.options.paginate == 'yes') {
        return this.data[this.page-1]
      }
      return this.data
    }
  },
  methods: {
    previous() {
      this.page--
    },
    next() {
      this.page++
    }
  }
}
