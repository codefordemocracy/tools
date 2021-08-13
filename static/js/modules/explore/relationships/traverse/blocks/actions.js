const actions = {
  template: `
    <div v-if="!_.isEmpty(selected)" class="actions mt-10">
      <h3 class="text-xl text-dark-gray mb-3"><slot name="header"></slot></h3>
      <p class="font-light text-sm leading-relaxed mb-5"><slot name="intro"></slot></p>
      <div class="grid grid-cols-2 gap-5">
        <div class="bg-light p-5 col-span-2" v-if="next.intersection2">
          <p class="text-xs mb-3">Choose the entities you would like to find in common between the {{mentity}}s.</p>
          <form class="flex form-sm" @submit.prevent="action('intersection2')">
            <select v-model="settings.intersection2" class="form-element dimmable flex-1 mr-1">
              <option v-for="entity in entities" :value="entity">{{_.startCase(entity)}}</option>
            </select>
            <input type="submit" class="btn btn-gray px-3 md:px-5 lg:px-7" value="Go"></button>
          </form>
        </div>
        <div class="bg-light p-5 col-span-2 md:col-span-1" :class="{'disabledbox': !next.associations}">
          <h4 class="text-dark-gray mb-2">Find Associations</h4>
          <p class="text-xs mb-3" v-if="!next.associations">This action is not available for {{mentity}}s.</p>
          <p class="text-xs mb-3" v-else>Discover which other entities {{selected.length == 1 ? 'this ' + mentity + ' is' : 'these ' + pluralize(mentity) + ' are'}} connected to.</p>
          <form class="flex form-sm" @submit.prevent="action('associations')">
            <select v-model="settings.associations" class="form-element dimmable flex-1 mr-1" :disabled="!next.associations">
              <option v-for="entity in entities" :value="entity">{{_.startCase(pluralize(entity))}}</option>
            </select>
            <input type="submit" class="btn btn-gray px-3 md:px-5 lg:px-7" value="Go" :disabled="!next.associations"></button>
          </form>
        </div>
        <div class="bg-light p-5 col-span-2 md:col-span-1" :class="{'disabledbox': !next.intersection}">
          <h4 class="text-dark-gray mb-2">Compute Intersection</h4>
          <p class="text-xs mb-3" v-if="!next.intersection">This action is not available for {{mentity}}s.</p>
          <p class="text-xs mb-3" v-else>Discover associations shared by {{selected.length == 1 ? 'this' : 'these'}} and the below {{mentity}}.</p>
          <form class="flex form-sm" @submit.prevent="action('intersection')">
            <typeahead ul="text-xs" class="flex-1 mr-1" input="form-element w-full dimmable" v-model="settings.intersection" :items="PLACEHOLDERS[mentity]" :disabled="!next.intersection"></typeahead>
            <input type="submit" class="btn btn-gray px-3 md:px-5 lg:px-7" value="Go" :disabled="_.isEmpty(settings.intersection) || !next.intersection"></button>
          </form>
        </div>
      </div>
    </div>
  `,
  props: {
    mentity: String,
    next: {
      type: Object,
      default: () => ({
        associations: false,
        intersection: false,
        intersection2: false
      })
    },
    selected: Array
  },
  data() {
    return {
      settings: {
        associations: null,
        intersection: null,
        intersection2: null
      }
    }
  },
  computed: {
    entities() {
      return store.state.explore.associations[this.mentity]
    }
  },
  methods: {
    action(type) {
      this.$emit('action', {type: type, setting: this.settings[type]})
    },
    pluralize(value) {
      return this.$options.filters.plural(value);
    }
  },
  mounted() {
    if (this.next.associations) {
      this.settings.associations = this.entities[0]
    }
    if (this.next.intersection2) {
      this.settings.intersection2 = this.entities[0]
    }
    if (this.next.connectors) {
      this.settings.connectors = this.entities[0]
    }
  }
}
