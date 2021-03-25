const actions = {
  template: `
    <div v-if="!_.isEmpty(selected)">
      <h3 class="mt-3 mb-1"><slot name="header"></slot></h3>
      <p class="py-1 lead"><slot name="intro"></slot></p>
      <div class="row mx-md-n1">
        <div class="col-12" v-if="next.intersection2">
          <div class="bg-light p-2">
            <div class="row">
              <div class="col-md-6 col-lg-8 d-flex">
                <p class="align-self-md-center mb-1 mb-md-0">Choose the entities you would like to find in common between the {{mentity}}s.</p>
              </div>
              <div class="col-md-6 col-lg-4">
                <form class="form-inline align-self-center" @submit.prevent="action('intersection2')">
                  <div class="form-group flex-grow-1">
                    <select v-model="settings.intersection2" class="form-control form-control-xs select w-100">
                      <option v-for="entity in entities" :value="entity">{{_.startCase(entity)}}</option>
                    </select>
                  </div>
                  <div class="form-group ml-xs">
                    <input type="submit" class="btn btn-xs btn-gray px-2" value="Go"></button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        <template v-else>
          <div class="col-12 col-md-6 mb-2 mb-md-0 px-md-1">
            <div class="bg-light p-2" :class="{'disabledbox': !next.associations}">
              <h4>Find Associations</h4>
              <p v-if="!next.associations">This action is not available for {{mentity}}s.</p>
              <p v-else>Discover which other entities {{selected.length == 1 ? 'this ' + mentity + ' is' : 'these ' + pluralize(mentity) + ' are'}} connected to.</p>
              <form class="form-inline" @submit.prevent="action('associations')">
                <div class="form-group flex-grow-1">
                  <select v-model="settings.associations" class="form-control form-control-xs select w-100 dimmable" :disabled="!next.associations">
                    <option v-for="entity in entities" :value="entity">{{_.startCase(pluralize(entity))}}</option>
                  </select>
                </div>
                <div class="form-group ml-xs">
                  <input type="submit" class="btn btn-xs btn-gray px-2" value="Go" :disabled="!next.associations"></button>
                </div>
              </form>
            </div>
          </div>
          <div class="col-12 col-md-6 mb-2 mb-md-0 px-md-1">
            <div class="bg-light p-2" :class="{'disabledbox': !next.intersection}">
              <h4>Compute Intersection</h4>
              <p v-if="!next.intersection">This action is not available for {{mentity}}s.</p>
              <p v-else>Discover associations shared by {{selected.length == 1 ? 'this' : 'these'}} and the below {{mentity}}.</p>
              <form class="form-inline" @submit.prevent="action('intersection')">
                <div class="form-group flex-grow-1">
                  <typeahead class="w-100" input="form-control form-control-xs w-100 dimmable" ul="form-xs-text" v-model="settings.intersection" :items="PLACEHOLDERS[mentity]" :disabled="!next.intersection"></typeahead>
                </div>
                <div class="form-group ml-xs">
                  <input type="submit" class="btn btn-xs btn-gray px-2" value="Go" :disabled="_.isEmpty(settings.intersection) || !next.intersection"></button>
                </div>
              </form>
            </div>
          </div>
        </template>
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
      return store.state.associations[this.mentity]
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
