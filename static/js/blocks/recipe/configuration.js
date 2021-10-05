var concatrecipes = ""
_.forEach(RECIPES, function(r) {
  concatrecipes +=
    `<template v-if="recipe.template == '` + r.template + `'">`
      + `<span v-if="version=='results'">You are seeing the results for</span><span v-else>Find</span> ` + r.configurables + `<span v-if="version=='results'">. ` + r.interpretation + `</span>` +
    `</template>`
})

const configuration = {
  components: {
    'configurable': configurable
  },
  template: `
  <div class="configuration" :class="{'inline': unformatted}">
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
      type: Object,
      default: function () {
        return {}
      }
    },
    prefill: {
      type: Array,
      default: false
    },
    unformatted: {
      type: Boolean,
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
        sequence: ['a', 'b', 'c', 'd', 'e', 'f'][index],
        unformatted: this.unformatted
      }
    }
  }
}
