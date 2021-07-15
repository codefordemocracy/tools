const configurable = {
  template: `
  <span>
    <span class="configurable" @click="$emit('click')" v-if="settings.version == 'list'"><span v-if="!prefill">a </span><strong>{{prefill ? options[0].name : _.startCase(type) + ' List'}}</strong><span v-if="prefill"> ({{_.startCase(type) + ' List'}})</span></span>
    <select v-if="settings.version == 'grid'" v-model="selected" :style="width > 0 ? 'max-width: ' + width + 'px' : ''"><option v-for="o in options" :value="o.id">{{o.name}}</option></select>
    <span class="pointer configurable text-dark" @click="$emit('click')" v-if="settings.version == 'settings'">List {{_.toUpper(settings.sequence)}}</span>
    <span class="pointer configurable text-dark" @click="$emit('click')" v-if="settings.version == 'results'">{{settings.name}} <i class="icon-info-circle"></i></span>
  </span>
  `,
  props: {
    preloaded: {
      type: Array,
      default: []
    },
    type: String,
    value: String,
    prefill: Boolean,
    settings: {
      type: Object,
      default: function () {
        return {
          version: 'list',
          template: '',
          sequence: 'a',
          name: 'Custom List'
        }
      }
    }
  },
  data() {
    return {
      width: 0,
      selected: null
    }
  },
  computed: {
    options() {
      return this.preloaded[this.type]
    },
    width() {
      let docwidth = document.body.clientWidth
      let name = _.get(_.filter(this.options, {id: this.selected})[0], 'name')
      if (!_.isUndefined(name)) {
        return name.length * Math.log(Math.log(docwidth))*5.25 + 24
      }
      return null
    }
  },
  methods: {
    calculateWidth() {
      let docwidth = document.body.clientWidth
      let name = _.get(_.filter(this.options, {id: this.selected})[0], 'name')
      if (!_.isUndefined(name)) {
        this.width = name.length * Math.log(Math.log(docwidth))*5.35 + 22
      }
    }
  },
  watch: {
    options() {
      if (_.isNil(this.value)) {
        this.selected = this.options[0].id
      } else {
        this.selected = this.value
      }
      this.calculateWidth()
    },
    selected() {
      this.$emit('select', {sequence: this.settings.sequence, selected: this.selected})
      this.calculateWidth()
    }
  },
  mounted() {
    window.addEventListener('resize', this.calculateWidth)
  },
  destroyed() {
    window.removeEventListener('resize', this.calculateWidth)
  }
}
