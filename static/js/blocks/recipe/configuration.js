var concatrecipes = ""
_.forEach(RECIPES, function(r) {
  concatrecipes +=
    `<div v-if="recipe.template == '` + r.template + `'">` +
      `<div>` + r.configurables + `</div>` +
      `<p v-if="version == 'results'">` +
        + r.interpretation +
      `</p>` +
    `</div>`
})

const configuration = {
  components: {
    'configurable': configurable
  },
  template: `
  <div class="configuration">
    ` + concatrecipes + `
  </div>
  `,
  props: {
    recipe: {
      type: Object,
      default: function () {
        return {
          template: null,
          subtypes: []
        }
      }
    },
    version: {
      type: String,
      default: 'list'
    },
    lists: {
      type: Array,
      default: []
    },
    prefill: {
      type: Array,
      default: false
    }
  },
  methods: {
    settings(index) {
      return {
        version: this.version,
        lists: this.lists,
        prefill: this.prefill,
        subtype: this.recipe.subtypes[index],
        sequence: ['a', 'b', 'c', 'd', 'e', 'f'][index]
      }
    },
    click(index) {
      this.$emit('click', index)
    }
  }
}
