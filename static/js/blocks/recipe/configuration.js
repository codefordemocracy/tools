var concatrecipes = ""
_.forEach(RECIPES, function(r) {
  concatrecipes +=
    `<div v-if="template == '` + r.template + `'">` +
      `<div class="configurables">` + r.configurables + `</div>` +
      `<div class="interpretation" v-if="version == 'results'">` +
        `<p>` + r.interpretation+ `</p>` +
      `</div>` +
    `</div>`
})

const configuration = {
  components: {
    'configurable': configurable
  },
  template: `
  <div class="configuration">
    <div :class="version == 'grid' ? 'card' : ''">
      <div :class="version == 'grid' ? 'card-body flex flex-col justify-between' : ''">
        ` + concatrecipes + `
        <div class="mt-2" v-if="version == 'grid'">
          <a :href="'/recipe/settings/' + querystring" class="btn btn-sm btn-gray">Customize</a>
          <a :href="'/recipe/results/' + querystring" class="btn btn-sm btn-primary">See Results <span class="font-weight-bold">&rarr;</span></a>
        </div>
        <template v-if="version == 'results'">
          <button class="btn btn-sm btn-light mt-3" @click="click"><span class="font-weight-bold">&larr;</span> Edit Settings</button>
        </template>
      </div>
    </div>
  </div>
  `,
  props: {
    version: {
      type: String,
      default: 'list'
    },
    template: {
      type: String,
      required: true
    },
    lists: {
      type: Array,
      required: true
    },
    names: {
      type: Array,
      default: []
    },
    preloaded: {
      type: Array,
      default: false
    },
    prefill: {
      type: Array,
      default: false
    }
  },
  data() {
    return {
      selected: {}
    }
  },
  computed: {
    configurables() {
      var self = this
      return _.map(this.lists, function(value, index) {
        let sequence = ['a', 'b', 'c', 'd', 'e', 'f'][index]
        let name = 'Custom ' + _.startCase(value) + ' List'
        if (!_.isNil(_.get(self.names, index))) {
          name = self.names[index]
        }
        return {
          sequence: ['a', 'b', 'c', 'd', 'e', 'f'][index],
          name: name,
          type: value
        }
      })
    },
    querystring() {
      qs = "?template=" + this.template
      _.forOwn(this.selected, function(v, k) {
        if (!_.isNil(v)) {
          qs += '&' + k + '=' + encodeURIComponent(v)
        }
      })
      return qs
    }
  },
  methods: {
    settings(index) {
      return {
        version: this.version,
        template: this.template,
        sequence: this.configurables[index].sequence,
        name: this.configurables[index].name
      }
    },
    select(payload) {
      this.selected[payload.sequence] = payload.selected
    },
    click(index) {
      this.$emit('click', index)
    }
  },
  created() {
    this.selected = _.reduce(_.map(this.configurables, 'sequence'), function(result, value, key) {
      result[value] = null
      return result
    }, {})
  }
}
