const branch = {
  template: `
    <div :id="id">
      <leaf :settings="settings" :numbranches="numbranches" @add="add" @destroy="destroy"></leaf>
      <div v-if="branches.length > 0">
        <div class="bar d-flex flex-column">
          <div class="align-self-center line"></div>
          <div class="bubbles pl-1 pb-1 text-center">
            <button v-for="path in paths" @click="set(path.id)" class="d-inline-block bubble" :class="{'bg-secondary': !path.active, 'bg-gray': path.active, 'text-white': path.active}"></button>
          </div>
          <div class="align-self-center line" v-if="branch"></div>
        </div>
        <branch :id="branch.id" :settings="branch.settings" :branches="branch.branches" @destroy="remove" v-for="branch in branches" v-show="active == branch.id"></branch>
      </div>
    </div>
  `,
  props: {
    id: Number,
    settings: Object,
    branches: Array
  },
  data() {
    return {
      active: null
    }
  },
  computed: {
    paths() {
      var self = this
      return _.map(this.branches, function(branch) {
        return {
          id: branch.id,
          label: branch.label,
          active: _.isEqual(self.active, branch.id) ? true : false
        }
      })
    },
    numbranches() {
      return this.branches.length
    }
  },
  methods: {
    add(payload) {
      let branch = {
        id: _.uniqueId(),
        settings: payload,
        branches: []
      }
      this.active = branch.id
      this.branches.push(branch)
    },
    set(id) {
      this.active = id
    },
    remove(id) {
      // remove emitted branch
      this.branches = _.filter(this.branches, function(branch) {
        return !_.isEqual(branch.id, id)
      })
      // set new active branch
      if (!_.isEmpty(this.branches)) {
        this.active = this.branches[0].id
      }
    },
    destroy() {
      this.$emit('destroy', this.id)
    }
  },
  mounted() {
    document.getElementById(this.id).scrollIntoView();
  }
}
